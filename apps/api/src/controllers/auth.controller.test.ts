import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

vi.mock("../services/auth.service.js", () => ({
  authService: {
    exchangeCode: vi.fn(),
    generateStateToken: vi.fn(() => "state-token"),
    generateAuthUrl: vi.fn(() => "https://accounts.google.com/o/oauth2/v2/auth"),
  },
}));

vi.mock("../utils/logger.js", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

const { authController } = await import("./auth.controller.js");
const { authService } = await import("../services/auth.service.js");

const WEB = "http://localhost:3000";

function mockRes() {
  return {
    redirect: vi.fn(),
    cookie: vi.fn(),
    clearCookie: vi.fn(),
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response & { redirect: ReturnType<typeof vi.fn> };
}

function mockReq(query: Record<string, unknown>, cookies: Record<string, string> = {}) {
  return { query, cookies } as unknown as Request;
}

const next = vi.fn() as unknown as NextFunction;

describe("googleCallback", () => {
  beforeEach(() => vi.clearAllMocks());

  it("redirects to the dashboard on success", async () => {
    vi.mocked(authService.exchangeCode).mockResolvedValue({
      accessToken: "at",
      refreshToken: "rt",
      user: { id: "1", email: "a@b.c", name: null, picture_url: null, plan: "free" },
    });

    const res = mockRes();
    await authController.googleCallback(
      mockReq({ code: "abc", state: "s" }, { oauth_state: "s" }),
      res,
      next,
    );

    expect(res.cookie).toHaveBeenCalledWith("access_token", "at", expect.anything());
    expect(res.cookie).toHaveBeenCalledWith("refresh_token", "rt", expect.anything());
    expect(res.redirect).toHaveBeenCalledWith(`${WEB}/dashboard`);
  });

  // The regression: a failed exchange used to fall through to the error handler
  // and render raw JSON at a user who was mid-login.
  it("redirects to login with server_error when the exchange throws", async () => {
    vi.mocked(authService.exchangeCode).mockRejectedValue(new Error("invalid_grant"));

    const res = mockRes();
    await authController.googleCallback(
      mockReq({ code: "abc", state: "s" }, { oauth_state: "s" }),
      res,
      next,
    );

    expect(res.redirect).toHaveBeenCalledWith(`${WEB}/login?error=server_error`);
    expect(next).not.toHaveBeenCalled();
  });

  it("redirects with invalid_state when the state cookie is missing", async () => {
    const res = mockRes();
    await authController.googleCallback(mockReq({ code: "abc", state: "s" }, {}), res, next);

    expect(res.redirect).toHaveBeenCalledWith(`${WEB}/login?error=invalid_state`);
    expect(authService.exchangeCode).not.toHaveBeenCalled();
  });

  it("redirects with invalid_state when the state does not match", async () => {
    const res = mockRes();
    await authController.googleCallback(
      mockReq({ code: "abc", state: "s" }, { oauth_state: "different" }),
      res,
      next,
    );

    expect(res.redirect).toHaveBeenCalledWith(`${WEB}/login?error=invalid_state`);
    expect(authService.exchangeCode).not.toHaveBeenCalled();
  });

  it("redirects with missing_code when Google returns no code", async () => {
    const res = mockRes();
    await authController.googleCallback(mockReq({ state: "s" }, { oauth_state: "s" }), res, next);

    expect(res.redirect).toHaveBeenCalledWith(`${WEB}/login?error=missing_code`);
    expect(authService.exchangeCode).not.toHaveBeenCalled();
  });

  it("never leaves the response unsent", async () => {
    vi.mocked(authService.exchangeCode).mockRejectedValue(new Error("boom"));

    const res = mockRes();
    await authController.googleCallback(
      mockReq({ code: "abc", state: "s" }, { oauth_state: "s" }),
      res,
      next,
    );

    expect(res.redirect).toHaveBeenCalledTimes(1);
  });
});
