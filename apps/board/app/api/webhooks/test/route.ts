import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dispatchWebhook } from "@/lib/webhooks";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testEvent = {
      type: "test.event" as const,
      data: {
        message: "This is a test webhook event",
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };

    await dispatchWebhook(testEvent);

    return NextResponse.json({ success: true, message: "Test webhook dispatched" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}