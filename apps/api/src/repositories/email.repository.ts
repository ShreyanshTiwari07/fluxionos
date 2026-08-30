import { db } from "../config/database.js";
import type { EmailStatus } from "@fluxionos/shared";

export interface EmailRow {
  id: string;
  user_id: string;
  to: string[];
  cc: string[] | null;
  subject: string;
  body: string;
  scheduled_at: Date;
  sent_at: Date | null;
  status: EmailStatus;
  gmail_message_id: string | null;
  gmail_thread_id: string | null;
  error_message: string | null;
  retry_count: number;
  created_at: Date;
  updated_at: Date;
}

export const emailRepository = {
  async create(data: {
    user_id: string;
    to: string[];
    cc?: string[];
    subject: string;
    body: string;
    scheduled_at: Date;
  }): Promise<EmailRow> {
    const result = await db.query(
      `INSERT INTO fluxion_emails (user_id, "to", cc, subject, body, scheduled_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.user_id, data.to, data.cc || null, data.subject, data.body, data.scheduled_at],
    );
    return result.rows[0];
  },

  async findById(id: string): Promise<EmailRow | null> {
    const result = await db.query("SELECT * FROM fluxion_emails WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  async findByUserId(
    userId: string,
    options: { status?: EmailStatus; limit?: number; offset?: number } = {},
  ): Promise<{ emails: EmailRow[]; total: number }> {
    const { status, limit = 20, offset = 0 } = options;

    let whereClause = "WHERE user_id = $1";
    const params: unknown[] = [userId];

    if (status) {
      params.push(status);
      whereClause += ` AND status = $${params.length}`;
    }

    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM fluxion_emails ${whereClause}`,
      params,
    );

    params.push(limit, offset);
    const result = await db.query(
      `SELECT * FROM fluxion_emails ${whereClause} ORDER BY scheduled_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );

    return {
      emails: result.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  },

  async updateStatus(
    id: string,
    status: EmailStatus,
    extra?: {
      sent_at?: Date;
      gmail_message_id?: string;
      gmail_thread_id?: string;
      error_message?: string;
    },
  ): Promise<EmailRow | null> {
    const setClauses = ["status = $2", "updated_at = NOW()"];
    const params: unknown[] = [id, status];

    if (extra?.sent_at) {
      params.push(extra.sent_at);
      setClauses.push(`sent_at = $${params.length}`);
    }
    if (extra?.gmail_message_id) {
      params.push(extra.gmail_message_id);
      setClauses.push(`gmail_message_id = $${params.length}`);
    }
    if (extra?.gmail_thread_id) {
      params.push(extra.gmail_thread_id);
      setClauses.push(`gmail_thread_id = $${params.length}`);
    }
    if (extra?.error_message !== undefined) {
      params.push(extra.error_message);
      setClauses.push(`error_message = $${params.length}`);
    }

    const result = await db.query(
      `UPDATE fluxion_emails SET ${setClauses.join(", ")} WHERE id = $1 RETURNING *`,
      params,
    );
    return result.rows[0] || null;
  },

  async incrementRetry(id: string): Promise<void> {
    await db.query(
      "UPDATE fluxion_emails SET retry_count = retry_count + 1, updated_at = NOW() WHERE id = $1",
      [id],
    );
  },

  async getStats(userId: string): Promise<{
    scheduled: number;
    sent: number;
    failed: number;
  }> {
    const result = await db.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
        COUNT(*) FILTER (WHERE status = 'sent') as sent,
        COUNT(*) FILTER (WHERE status = 'failed') as failed
       FROM fluxion_emails WHERE user_id = $1`,
      [userId],
    );
    const row = result.rows[0];
    return {
      scheduled: parseInt(row.scheduled, 10),
      sent: parseInt(row.sent, 10),
      failed: parseInt(row.failed, 10),
    };
  },
};
