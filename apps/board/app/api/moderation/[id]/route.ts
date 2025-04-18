import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

const moderationActionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "FLAG", "UNFLAG"]),
  reason: z.string().min(1),
  type: z.enum(["problem", "solution", "comment"]),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const { action, reason, type } = moderationActionSchema.parse(json);

    const moderationStatus = action === "APPROVE" 
      ? "APPROVED" 
      : action === "REJECT" 
      ? "REJECTED"
      : action === "FLAG"
      ? "FLAGGED"
      : "PENDING";

    const model = type === "problem" 
      ? prisma.problem 
      : type === "solution" 
      ? prisma.solution 
      : prisma.comment;

    const [content, moderationAction] = await prisma.$transaction([
      model.update({
        where: { id: params.id },
        data: { moderationStatus },
        include: {
          author: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.moderationAction.create({
        data: {
          action,
          reason,
          moderatorId: session.user.id,
          [type + "Id"]: params.id,
        },
      }),
    ]);

    await logActivity({
      action: "update",
      entityType: type,
      entityId: params.id,
      userId: session.user.id,
      metadata: {
        moderationAction: action,
        reason,
      },
    });

    return NextResponse.json({ content, moderationAction });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}