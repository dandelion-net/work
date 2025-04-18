import { prisma } from "./db";
import { Problem, Solution, Vote, WeightedVote } from "@prisma/client";
import { encryptPayload, EncryptedPayload } from "./encryption";

export type WebhookEventType = 
  | "problem.created" 
  | "problem.updated" 
  | "problem.deleted"
  | "solution.created" 
  | "solution.updated" 
  | "solution.deleted"
  | "vote.created" 
  | "vote.updated"
  | "weightedVote.created";

export interface WebhookEvent {
  type: WebhookEventType;
  data: Problem | Solution | Vote | WeightedVote;
  timestamp: string;
}

export async function dispatchWebhook(event: WebhookEvent) {
  const webhooks = await prisma.webhook.findMany({
    where: {
      active: true,
      events: {
        has: event.type,
      },
    },
  });

  const promises = webhooks.map(async (webhook) => {
    try {
      const payload = {
        ...event,
        timestamp: new Date().toISOString(),
      };

      const signature = await createSignature(
        JSON.stringify(payload),
        webhook.secret
      );

      let encryptedPayload: EncryptedPayload | null = null;
      if (webhook.publicKey) {
        encryptedPayload = encryptPayload(
          payload,
          webhook.publicKey,
          process.env.WEBHOOK_SENDER_SECRET_KEY!
        );
      }

      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
          "X-Webhook-Event": event.type,
          ...(encryptedPayload && { "X-Webhook-Encrypted": "true" }),
        },
        body: JSON.stringify(encryptedPayload || payload),
      });

      if (!response.ok) {
        console.error(`Webhook delivery failed to ${webhook.url}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Failed to dispatch webhook to ${webhook.url}:`, error);
    }
  });

  await Promise.allSettled(promises);
}

async function createSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, data);
  return Buffer.from(signature).toString("hex");
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  return createSignature(payload, secret).then(
    (expectedSignature) => expectedSignature === signature
  );
}