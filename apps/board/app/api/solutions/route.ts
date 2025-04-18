import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { dispatchWebhook } from "@/lib/webhooks";

const solutionSchema = z.object({
  content: z.string().min(1),
  problemId: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json();
    const body = solutionSchema.parse(json);

    const problem = await prisma.problem.findUnique({
      where: { id: body.problemId },
    });

    if (!problem) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    const solution = await prisma.solution.create({
      data: {
        content: body.content,
        problemId: body.problemId,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    await dispatchWebhook({
      type: "solution.created",
      data: solution,
    });

    return NextResponse.json(solution);
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