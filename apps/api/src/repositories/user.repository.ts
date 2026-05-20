import { db } from "../config/database.js";

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  picture_url: string | null;
  access_token: string;
  refresh_token: string;
  token_expiry: Date;
  plan: string;
  monthly_send_count: number;
  send_count_reset_at: Date;
  created_at: Date;
  updated_at: Date;
}

export const userRepository = {
  async findByEmail(email: string): Promise<UserRow | null> {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0] || null;
  },

  async findById(id: string): Promise<UserRow | null> {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  async upsert(data: {
    email: string;
    name: string | null;
    picture_url: string | null;
    access_token: string;
    refresh_token: string;
    token_expiry: Date;
  }): Promise<UserRow> {
    const result = await db.query(
      `INSERT INTO users (email, name, picture_url, access_token, refresh_token, token_expiry)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         picture_url = EXCLUDED.picture_url,
         access_token = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         token_expiry = EXCLUDED.token_expiry,
         updated_at = NOW()
       RETURNING *`,
      [
        data.email,
        data.name,
        data.picture_url,
        data.access_token,
        data.refresh_token,
        data.token_expiry,
      ],
    );
    return result.rows[0];
  },

  async updateTokens(
    userId: string,
    accessToken: string,
    refreshToken: string,
    tokenExpiry: Date,
  ): Promise<void> {
    await db.query(
      `UPDATE users SET access_token = $1, refresh_token = $2, token_expiry = $3, updated_at = NOW()
       WHERE id = $4`,
      [accessToken, refreshToken, tokenExpiry, userId],
    );
  },

  async incrementSendCount(userId: string): Promise<void> {
    await db.query(
      `UPDATE users SET monthly_send_count = monthly_send_count + 1, updated_at = NOW()
       WHERE id = $1`,
      [userId],
    );
  },

  async resetSendCountIfNeeded(userId: string): Promise<void> {
    await db.query(
      `UPDATE users SET
        monthly_send_count = 0,
        send_count_reset_at = date_trunc('month', NOW()) + INTERVAL '1 month',
        updated_at = NOW()
       WHERE id = $1 AND send_count_reset_at <= NOW()`,
      [userId],
    );
  },
};
