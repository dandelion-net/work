import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { dispatchWebhook } from "@/lib/webhooks";

const weightedVoteSchema = z.object({
  weight: z.number().min(0).max(1),
  problemId: z.string().optional(),
  solutionId: z.string().optional(),
  commentId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const body = weightedVoteSchema.parse(json);

    if (!body.problemId && !body.solutionId && !body.commentId) {
      return NextResponse.json(
        { error: "Must provide a target to vote on" },
        { status: 400 }
      );
    }

    const weightedVote = await prisma.weightedVote.create({
      data: {
        weight: body.weight,
        userId: session.user.id,
        problemId: body.problemId,
        solutionId: body.solutionId,
        commentId: body.commentId,
      },
    });

    await dispatchWebhook({
      type: "weightedVote.created",
      data: weightedVote,
    });

    return NextResponse.json(weightedVote);
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