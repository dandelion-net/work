import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { subHours, subDays } from "date-fns";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "newest";
    const timeFrame = searchParams.get("timeFrame");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    let dateFilter = {};
    if (timeFrame) {
      const now = new Date();
      dateFilter = {
        createdAt: {
          gte: timeFrame === "24h" 
            ? subHours(now, 24)
            : timeFrame === "7d"
            ? subDays(now, 7)
            : timeFrame === "30d"
            ? subDays(now, 30)
            : undefined,
        },
      };
    }

    const where = {
      AND: [
        {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        status ? { status } : {},
        dateFilter,
      ],
    };

    const orderBy = {
      ...(sortBy === "newest" && { createdAt: "desc" }),
      ...(sortBy === "oldest" && { createdAt: "asc" }),
      ...(sortBy === "mostVoted" && { votes: { _count: "desc" } }),
      ...(sortBy === "mostSolutions" && { solutions: { _count: "desc" } }),
    };

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        include: {
          author: {
            select: {
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              solutions: true,
              votes: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.problem.count({ where }),
    ]);

    return NextResponse.json({
      problems,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
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