import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
  const { companyId } = params;
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get("page") || "0", 10); // Default to page 0
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "10", 10); // Default to 10 rows per page
  const searchQuery = searchParams.get("search") || ""; // Default to an empty search query
  const orderBy = searchParams.get("orderBy") || "dealID"; // Default to sorting by dealID
  const order = searchParams.get("order") || "asc"; // Default to ascending order
  const customerId = searchParams.get("customerId");

  if (!companyId || isNaN(Number(companyId))) {
    return NextResponse.json({ error: "Invalid companyId" }, { status: 400 });
  }

  try {
    // Construct the where condition
    const whereCondition: Prisma.DealWhereInput = {
      customerId: customerId || undefined, // Filter by customerId if provided
      customer: {
        companyId: Number(companyId), // Ensure the deal is associated with the correct company
        OR: searchQuery
          ? [
              { customerName: { contains: searchQuery, mode: "insensitive" } },
              { email: { contains: searchQuery, mode: "insensitive" } },
            ]
          : undefined,
      },
    };

    // Calculate total records for pagination
    const totalRecords = await prisma.deal.count({
      where: whereCondition,
    });

    // Fetch paginated and sorted data
    const deals = await prisma.deal.findMany({
      where: whereCondition,
      include: { customer: true }, // Include customer details
      orderBy: {
        [orderBy]: order === "asc" ? "asc" : "desc",
      },
      skip: page * rowsPerPage,
      take: rowsPerPage,
    });

    return NextResponse.json(
      {
        deals,
        totalRecords,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch deals", details: error.message },
      { status: 500 }
    );
  }
}
