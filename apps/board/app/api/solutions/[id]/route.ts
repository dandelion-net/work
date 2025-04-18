import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { dispatchWebhook } from "@/lib/webhooks";

const updateSolutionSchema = z.object({
  content: z.string().min(1),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const solution = await prisma.solution.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    });

    if (!solution) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (
      solution.authorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const json = await req.json();
    const body = updateSolutionSchema.parse(json);

    const updatedSolution = await prisma.solution.update({
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
      type: "solution.updated",
      data: updatedSolution,
    });

    return NextResponse.json(updatedSolution);
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

    const solution = await prisma.solution.findUnique({
      where: { id: params.id },
      select: { authorId: true },
    });

    if (!solution) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (
      solution.authorId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.solution.delete({
      where: { id: params.id },
    });

    await dispatchWebhook({
      type: "solution.deleted",
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