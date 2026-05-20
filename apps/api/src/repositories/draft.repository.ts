import { db } from "../config/database.js";
import type { DraftCategory } from "@fluxionos/shared";

export interface DraftRow {
  id: string;
  user_id: string;
  to: string[] | null;
  subject: string | null;
  body: string | null;
  category: DraftCategory;
  created_at: Date;
  updated_at: Date;
}

export const draftRepository = {
  async create(data: {
    user_id: string;
    to?: string[];
    subject?: string;
    body?: string;
    category?: DraftCategory;
  }): Promise<DraftRow> {
    const result = await db.query(
      `INSERT INTO drafts (user_id, "to", subject, body, category)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.user_id,
        data.to || null,
        data.subject || null,
        data.body || null,
        data.category || "uncategorized",
      ],
    );
    return result.rows[0];
  },

  async findById(id: string): Promise<DraftRow | null> {
    const result = await db.query("SELECT * FROM drafts WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  async findByUserId(
    userId: string,
    options: { category?: DraftCategory; limit?: number; offset?: number } = {},
  ): Promise<{ drafts: DraftRow[]; total: number }> {
    const { category, limit = 20, offset = 0 } = options;

    let whereClause = "WHERE user_id = $1";
    const params: unknown[] = [userId];

    if (category) {
      params.push(category);
      whereClause += ` AND category = $${params.length}`;
    }

    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM drafts ${whereClause}`,
      params,
    );

    params.push(limit, offset);
    const result = await db.query(
      `SELECT * FROM drafts ${whereClause} ORDER BY updated_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );

    return {
      drafts: result.rows,
      total: parseInt(countResult.rows[0].total, 10),
    };
  },

  async update(
    id: string,
    data: {
      to?: string[];
      subject?: string;
      body?: string;
      category?: DraftCategory;
    },
  ): Promise<DraftRow | null> {
    const setClauses: string[] = ["updated_at = NOW()"];
    const params: unknown[] = [id];

    if (data.to !== undefined) {
      params.push(data.to);
      setClauses.push(`"to" = $${params.length}`);
    }
    if (data.subject !== undefined) {
      params.push(data.subject);
      setClauses.push(`subject = $${params.length}`);
    }
    if (data.body !== undefined) {
      params.push(data.body);
      setClauses.push(`body = $${params.length}`);
    }
    if (data.category !== undefined) {
      params.push(data.category);
      setClauses.push(`category = $${params.length}`);
    }

    const result = await db.query(
      `UPDATE drafts SET ${setClauses.join(", ")} WHERE id = $1 RETURNING *`,
      params,
    );
    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await db.query("DELETE FROM drafts WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  },
};
