import { db } from "../config/database.js";
import type { FollowUpStatus } from "@fluxionos/shared";

export interface FollowUpRow {
  id: string;
  email_id: string;
  user_id: string;
  delay_hours: number;
  follow_up_body: string;
  check_at: Date | null;
  sent_at: Date | null;
  status: FollowUpStatus;
  gmail_message_id: string | null;
  error_message: string | null;
  created_at: Date;
  updated_at: Date;
}

export const followUpRepository = {
  async create(data: {
    email_id: string;
    user_id: string;
    delay_hours: number;
    follow_up_body: string;
  }): Promise<FollowUpRow> {
    const result = await db.query(
      `INSERT INTO follow_ups (email_id, user_id, delay_hours, follow_up_body)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.email_id, data.user_id, data.delay_hours, data.follow_up_body],
    );
    return result.rows[0];
  },

  async findById(id: string): Promise<FollowUpRow | null> {
    const result = await db.query("SELECT * FROM follow_ups WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  async findByEmailId(emailId: string): Promise<FollowUpRow | null> {
    const result = await db.query("SELECT * FROM follow_ups WHERE email_id = $1", [emailId]);
    return result.rows[0] || null;
  },

  async findByUserId(
    userId: string,
    options: { status?: FollowUpStatus; limit?: number; offset?: number } = {},
  ): Promise<{ followUps: FollowUpRow[]; total: number }> {
    const { status, limit = 20, offset = 0 } = options;

    let whereClause = "WHERE f.user_id = $1";
    const params: unknown[] = [userId];

    if (status) {
      params.push(status);
      whereClause += ` AND f.status = $${params.length}`;
    }

    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM follow_ups f ${whereClause}`,
      params,
    );

    params.push(limit, offset);
    const result = await db.query(
      `SELECT f.*, e.subject as email_subject, e."to" as email_to
       FROM follow_ups f
       JOIN emails e ON f.email_id = e.id
       ${whereClause}
       ORDER BY f.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );

    return {
      followUps: result.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  },

  async updateStatus(
    id: string,
    status: FollowUpStatus,
    extra?: {
      check_at?: Date;
      sent_at?: Date;
      gmail_message_id?: string;
      error_message?: string;
    },
  ): Promise<FollowUpRow | null> {
    const setClauses = ["status = $2", "updated_at = NOW()"];
    const params: unknown[] = [id, status];

    if (extra?.check_at) {
      params.push(extra.check_at);
      setClauses.push(`check_at = $${params.length}`);
    }
    if (extra?.sent_at) {
      params.push(extra.sent_at);
      setClauses.push(`sent_at = $${params.length}`);
    }
    if (extra?.gmail_message_id) {
      params.push(extra.gmail_message_id);
      setClauses.push(`gmail_message_id = $${params.length}`);
    }
    if (extra?.error_message !== undefined) {
      params.push(extra.error_message);
      setClauses.push(`error_message = $${params.length}`);
    }

    const result = await db.query(
      `UPDATE follow_ups SET ${setClauses.join(", ")} WHERE id = $1 RETURNING *`,
      params,
    );
    return result.rows[0] || null;
  },
};
