import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const leadSchema = z.object({
  company: z.string().min(1, "Company name is required").max(120),
  countryCode: z.string().regex(/^\+\d{1,4}$/, "Invalid country code"),
  phone: z.string().min(5, "Phone number is too short").max(30),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const sendLeadToTelegram = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const chatId = process.env["TELEGRAM_CHAT_ID"];
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const telegramKey = process.env["TELEGRAM_API_KEY"];

    if (!chatId || !lovableKey || !telegramKey) {
      throw new Error("Telegram integration is not fully configured");
    }

    const fullPhone = `${data.countryCode} ${data.phone}`;
    const text = [
      "<b>New lead from AD Simple</b>",
      "",
      `<b>Company:</b> ${escapeHtml(data.company)}`,
      `<b>Phone:</b> ${escapeHtml(fullPhone)}`,
      `<b>Time:</b> ${new Date().toLocaleString("en-EU", {
        timeZone: "Europe/Amsterdam",
        dateStyle: "medium",
        timeStyle: "short",
      })}`,
    ].join("\n");

    const response = await fetch(
      "https://connector-gateway.lovable.dev/telegram/sendMessage",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": telegramKey,
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Telegram gateway failed [${response.status}]: ${errorBody}`);
      throw new Error(`Failed to send message [${response.status}]`);
    }

    const result = await response.json();
    if (result && typeof result === "object" && "ok" in result && !result.ok) {
      const errorBody = JSON.stringify(result);
      console.error(`Telegram API error: ${errorBody}`);
      throw new Error("Telegram returned an error");
    }

    return { ok: true as const };
  });

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
