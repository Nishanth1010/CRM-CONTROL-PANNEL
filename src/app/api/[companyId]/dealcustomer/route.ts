import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { companyId: string } }) {
  try {
    const companyId = parseInt(params.companyId, 10);

    if (isNaN(companyId)) {
      return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);
    const search = url.searchParams.get("search") || "";
    const sortField = url.searchParams.get("sortField") || "createdAt";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";

    const whereClause: Prisma.CustomerWhereInput = {
      companyId,
      Deal: {
        some: {}, // Ensures the customer has at least one deal
      },
      OR: [
        { customerName: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { mobileNumber: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ],
    };

    const totalCount = await prisma.customer.count({ where: whereClause });

    const customers = await prisma.customer.findMany({
      where: whereClause,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { [sortField]: sortOrder },
      include: {
        Deal: {
          select: {
            dealValue: true,
            balanceAmount: true,
          },
        },
      },
    });

    // Calculate totalDealValue and totalBalanceAmount for each customer
    const enrichedCustomers = customers.map((customer) => {
      const totalDealValue = customer.Deal.reduce((sum, deal) => sum + deal.dealValue, 0);
      const totalBalanceAmount = customer.Deal.reduce((sum, deal) => sum + deal.balanceAmount, 0);

      return {
        ...customer,
        totalDealValue,
        totalBalanceAmount,
        Deal: undefined, // remove Deal array to avoid sending all deals in this list
      };
    });

    return NextResponse.json({
      data: enrichedCustomers,
      meta: {
        totalCount,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching customer deals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
