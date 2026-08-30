import type { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../middleware/error-handler.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

// In production the web app and API are different sites bridged by a Vercel
// proxy, so the cookie is first-party to the web origin but the OAuth flow
// bounces through Google. SameSite=None (with Secure) is required for the
// cookie to be stored and sent reliably across that bounce.
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  path: "/",
};

export const authController = {
  async googleRedirect(req: Request, res: Response, _next: NextFunction) {
    const state = authService.generateStateToken();

    res.cookie("oauth_state", state, {
      ...COOKIE_OPTIONS,
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    const authUrl = authService.generateAuthUrl(state);
    res.redirect(authUrl);
  },

  async googleCallback(req: Request, res: Response, _next: NextFunction) {
    // Never surface a raw 500 here: this endpoint is a browser navigation, so
    // an unhandled error dumps JSON at the user mid-login. Send them back to
    // the login page with a reason instead, and log the real cause.
    const fail = (reason: string, err?: unknown) => {
      logger.error({ err, reason }, "Google OAuth callback failed");
      res.redirect(`${env.WEB_URL}/login?error=${reason}`);
    };

    const { code, state } = req.query;
    const savedState = req.cookies?.oauth_state;

    if (!code || typeof code !== "string") {
      return fail("missing_code");
    }

    if (!state || state !== savedState) {
      return fail("invalid_state");
    }

    try {
      // Clear the state cookie
      res.clearCookie("oauth_state", COOKIE_OPTIONS);

      const { accessToken, refreshToken } = await authService.exchangeCode(code);

      // Set auth cookies
      res.cookie("access_token", accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      res.cookie("refresh_token", refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Redirect to frontend dashboard
      res.redirect(`${env.WEB_URL}/dashboard`);
    } catch (err) {
      fail("server_error", err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refresh_token;

      if (!refreshToken) {
        throw new AppError(401, "No refresh token");
      }

      const tokens = await authService.refreshTokens(refreshToken);

      res.cookie("access_token", tokens.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 1000,
      });

      res.cookie("refresh_token", tokens.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ success: true, message: "Tokens refreshed" });
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.findById(req.userId!);

      if (!user) {
        throw new AppError(404, "User not found");
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture_url: user.picture_url,
          plan: user.plan,
          monthly_send_count: user.monthly_send_count,
          created_at: user.created_at,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(_req: Request, res: Response) {
    res.clearCookie("access_token", COOKIE_OPTIONS);
    res.clearCookie("refresh_token", COOKIE_OPTIONS);
    res.json({ success: true, message: "Logged out" });
  },
};
