import jwt from "jsonwebtoken";
import { createOAuth2Client, GOOGLE_SCOPES } from "../config/gmail.js";
import { env } from "../config/env.js";
import { userRepository } from "../repositories/user.repository.js";
import { encrypt } from "../utils/crypto.js";
import { logger } from "../utils/logger.js";
import crypto from "crypto";

interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date?: number;
  id_token?: string;
}

interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
}

export const authService = {
  generateAuthUrl(state: string): string {
    const oauth2Client = createOAuth2Client();
    return oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: GOOGLE_SCOPES,
      state,
    });
  },

  generateStateToken(): string {
    return crypto.randomBytes(32).toString("hex");
  },

  async exchangeCode(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string; name: string | null; picture_url: string | null; plan: string };
  }> {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    const googleTokens = tokens as GoogleTokens;

    if (!googleTokens.access_token) {
      throw new Error("No access token received from Google");
    }

    // Get user info from id_token or userinfo endpoint
    oauth2Client.setCredentials(tokens);
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${googleTokens.access_token}` },
    });

    if (!userInfoRes.ok) {
      throw new Error("Failed to fetch user info from Google");
    }

    const userInfo = (await userInfoRes.json()) as GoogleUserInfo;

    // Encrypt tokens before storing
    const encryptedAccessToken = encrypt(googleTokens.access_token);
    const encryptedRefreshToken = encrypt(googleTokens.refresh_token || "");
    const tokenExpiry = new Date(googleTokens.expiry_date || Date.now() + 3600 * 1000);

    // Upsert user
    const user = await userRepository.upsert({
      email: userInfo.email,
      name: userInfo.name || null,
      picture_url: userInfo.picture || null,
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      token_expiry: tokenExpiry,
    });

    logger.info({ email: user.email }, "User authenticated via Google OAuth");

    // Generate app JWT
    const appAccessToken = this.generateJwt(user.id, user.email);
    const appRefreshToken = this.generateRefreshToken(user.id, user.email);

    return {
      accessToken: appAccessToken,
      refreshToken: appRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture_url: user.picture_url,
        plan: user.plan,
      },
    };
  },

  generateJwt(userId: string, email: string): string {
    return jwt.sign({ sub: userId, email }, env.JWT_SECRET, {
      expiresIn: "1h",
    });
  },

  generateRefreshToken(userId: string, email: string): string {
    return jwt.sign({ sub: userId, email, type: "refresh" }, env.JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });
  },

  verifyJwt(token: string): { sub: string; email: string } {
    return jwt.verify(token, env.JWT_SECRET) as { sub: string; email: string };
  },

  verifyRefreshToken(token: string): { sub: string; email: string } {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as {
      sub: string;
      email: string;
      type: string;
    };
    if (payload.type !== "refresh") {
      throw new Error("Invalid token type");
    }
    return payload;
  },

  async refreshTokens(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = this.verifyRefreshToken(refreshToken);
    const user = await userRepository.findById(payload.sub);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      accessToken: this.generateJwt(user.id, user.email),
      refreshToken: this.generateRefreshToken(user.id, user.email),
    };
  },
};
