import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/activity-logger";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { moderationStatus: status }),
      ...(type && {
        OR: [
          type === "problem" ? { id: { not: null } } : { id: null },
          type === "solution" ? { id: { not: null } } : { id: null },
          type === "comment" ? { id: { not: null } } : { id: null },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.$transaction([
        prisma.problem.findMany({
          where: {
            ...where,
            moderationStatus: status || undefined,
          },
          include: {
            author: {
              select: {
                name: true,
                email: true,
              },
            },
            moderationActions: {
              include: {
                moderator: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
          skip: type === "problem" ? skip : 0,
          take: type === "problem" ? limit : undefined,
        }),
        prisma.solution.findMany({
          where: {
            ...where,
            moderationStatus: status || undefined,
          },
          include: {
            author: {
              select: {
                name: true,
                email: true,
              },
            },
            moderationActions: {
              include: {
                moderator: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
          skip: type === "solution" ? skip : 0,
          take: type === "solution" ? limit : undefined,
        }),
        prisma.comment.findMany({
          where: {
            ...where,
            moderationStatus: status || undefined,
          },
          include: {
            author: {
              select: {
                name: true,
                email: true,
              },
            },
            moderationActions: {
              include: {
                moderator: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
          skip: type === "comment" ? skip : 0,
          take: type === "comment" ? limit : undefined,
        }),
      ]),
      prisma.$transaction([
        prisma.problem.count({
          where: {
            ...where,
            moderationStatus: status || undefined,
          },
        }),
        prisma.solution.count({
          where: {
            ...where,
            moderationStatus: status || undefined,
          },
        }),
        prisma.comment.count({
          where: {
            ...where,
            moderationStatus: status || undefined,
          },
        }),
      ]),
    ]);

    const [problems, solutions, comments] = items;
    const [problemCount, solutionCount, commentCount] = total;

    return NextResponse.json({
      items: [...problems, ...solutions, ...comments],
      counts: {
        problem: problemCount,
        solution: solutionCount,
        comment: commentCount,
      },
      pagination: {
        total: problemCount + solutionCount + commentCount,
        pages: Math.ceil((problemCount + solutionCount + commentCount) / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}