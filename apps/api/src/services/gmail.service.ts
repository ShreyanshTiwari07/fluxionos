import { google } from "googleapis";
import { createOAuth2Client } from "../config/gmail.js";
import { userRepository } from "../repositories/user.repository.js";
import { encrypt, decrypt } from "../utils/crypto.js";
import { logger } from "../utils/logger.js";

interface SendEmailOptions {
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string;
}

interface SendResult {
  messageId: string;
  threadId: string;
}

export const gmailService = {
  /**
   * Get an authenticated Gmail client for a user.
   * Automatically refreshes the token if it's about to expire.
   */
  async getAuthenticatedClient(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error("User not found");

    const oauth2Client = createOAuth2Client();
    const accessToken = decrypt(user.access_token);
    const refreshToken = decrypt(user.refresh_token);

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: user.token_expiry.getTime(),
    });

    // Proactively refresh if token expires within 5 minutes
    const fiveMinutes = 5 * 60 * 1000;
    if (user.token_expiry.getTime() - Date.now() < fiveMinutes) {
      logger.info({ userId }, "Refreshing Google OAuth token");
      const { credentials } = await oauth2Client.refreshAccessToken();

      const newAccessToken = credentials.access_token!;
      const newRefreshToken = credentials.refresh_token || refreshToken;
      const newExpiry = new Date(credentials.expiry_date || Date.now() + 3600 * 1000);

      await userRepository.updateTokens(
        userId,
        encrypt(newAccessToken),
        encrypt(newRefreshToken),
        newExpiry,
      );

      oauth2Client.setCredentials(credentials);
    }

    return { gmail: google.gmail({ version: "v1", auth: oauth2Client }), email: user.email };
  },

  /**
   * Build an RFC 2822 MIME message and send via Gmail API.
   */
  async sendEmail(userId: string, options: SendEmailOptions): Promise<SendResult> {
    const { gmail, email: senderEmail } = await this.getAuthenticatedClient(userId);

    const headers: string[] = [
      `From: ${senderEmail}`,
      `To: ${options.to.join(", ")}`,
    ];

    if (options.cc && options.cc.length > 0) {
      headers.push(`Cc: ${options.cc.join(", ")}`);
    }

    headers.push(`Subject: ${options.subject}`);
    headers.push("MIME-Version: 1.0");
    headers.push("Content-Type: text/plain; charset=UTF-8");

    if (options.inReplyTo) {
      headers.push(`In-Reply-To: ${options.inReplyTo}`);
    }
    if (options.references) {
      headers.push(`References: ${options.references}`);
    }

    const message = `${headers.join("\r\n")}\r\n\r\n${options.body}`;
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedMessage,
        threadId: options.threadId || undefined,
      },
    });

    if (!res.data.id || !res.data.threadId) {
      throw new Error("Gmail API did not return message or thread ID");
    }

    logger.info(
      { userId, messageId: res.data.id, threadId: res.data.threadId },
      "Email sent via Gmail",
    );

    return {
      messageId: res.data.id,
      threadId: res.data.threadId,
    };
  },

  /**
   * Get the Message-ID header from a sent email (for threading follow-ups).
   */
  async getMessageHeader(
    userId: string,
    gmailMessageId: string,
    headerName: string,
  ): Promise<string | null> {
    const { gmail } = await this.getAuthenticatedClient(userId);

    const res = await gmail.users.messages.get({
      userId: "me",
      id: gmailMessageId,
      format: "metadata",
      metadataHeaders: [headerName],
    });

    const header = res.data.payload?.headers?.find(
      (h) => h.name?.toLowerCase() === headerName.toLowerCase(),
    );

    return header?.value || null;
  },

  /**
   * Check if a thread has received a reply (a message not from the sender).
   */
  async hasReceivedReply(userId: string, threadId: string, afterMessageId: string): Promise<boolean> {
    const { gmail, email: senderEmail } = await this.getAuthenticatedClient(userId);

    const res = await gmail.users.threads.get({
      userId: "me",
      id: threadId,
      format: "metadata",
      metadataHeaders: ["From"],
    });

    if (!res.data.messages) return false;

    // Find messages after the original sent message
    let foundOriginal = false;
    for (const msg of res.data.messages) {
      if (msg.id === afterMessageId) {
        foundOriginal = true;
        continue;
      }

      if (!foundOriginal) continue;

      // Check if this message is from someone other than the sender
      const fromHeader = msg.payload?.headers?.find(
        (h) => h.name?.toLowerCase() === "from",
      );

      if (fromHeader?.value && !fromHeader.value.includes(senderEmail)) {
        return true;
      }
    }

    return false;
  },
};
