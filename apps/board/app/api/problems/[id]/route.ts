import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { dispatchWebhook } from "@/lib/webhooks";

const updateProblemSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(["OPEN", "CLOSED", "RESOLVED"]).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        solutions: {
          include: {
            author: {
              select: {
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                votes: true,
              },
            },
          },
        },
        _count: {
          select: {
            votes: true,
            solutions: true,
          },
        },
      },
    });

    if (!problem) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(problem);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    });

    if (!problem) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (
      problem.authorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const json = await req.json();
    const body = updateProblemSchema.parse(json);

    const updatedProblem = await prisma.problem.update({
      where: { id: params.id },
      data: body,
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
      type: "problem.updated",
      data: updatedProblem,
    });

    return NextResponse.json(updatedProblem);
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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const problem = await prisma.problem.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    });

    if (!problem) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (
      problem.authorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.problem.delete({
      where: { id: params.id },
    });

    await dispatchWebhook({
      type: "problem.deleted",
      data: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}