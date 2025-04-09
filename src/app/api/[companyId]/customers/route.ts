import { NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";
import { log } from "node:console";

const prisma = new PrismaClient();

// POST: Create a new customer for a specific company

export async function POST(request: Request, { params }: { params: { companyId: string } }) {
  try {
    const companyId = parseInt(params.companyId, 10);

    if (isNaN(companyId)) {
      return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      customerName,
      email,
      categoryId,
      address,
      stateDistrictPin,
      gstNumber,
      cinNumber,
      businessLegalName,
      authorizedPersonName,
      mobileNumber,
      whatsappNumber,
      leadId,
    } = body;

    if (!customerName || !email || !address || !stateDistrictPin || !mobileNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newCustomer = await prisma.customer.create({
      data: {
        customerName,
        email,
        address,
        stateDistrictPin,
        gstNumber,
        cinNumber,
        businessLegalName,
        authorizedPersonName,
        mobileNumber,
        whatsappNumber,
        category: {
          connect: categoryId ? { id: categoryId } : undefined
        },
        company: {
          connect: { id: companyId },
        },
        lead: leadId ? { connect: { id: leadId } } : undefined,
      },
    });

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.log(error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle unique constraint violations
      if (error.code === 'P2002') {
        const meta = error.meta as { target: string[] };
        const uniqueField = meta?.target?.[0];

        return NextResponse.json(
          { error: `${uniqueField} must be unique` },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Retrieve customers for a specific company with pagination and filters
export async function GET(request: Request, { params }: { params: { companyId: string } }) {
  try {
    const companyId = parseInt(params.companyId, 10);

    if (isNaN(companyId)) {
      return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
    }

    const url = new URL(request.url);
    const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
    const pageSize = Math.max(parseInt(url.searchParams.get("pageSize") || "10", 10), 1);
    const search = url.searchParams.get("search") || "";
    const sortField = url.searchParams.get("sortField") || "createdAt";
    let sortOrder = url.searchParams.get("sortOrder") || "desc";
    const categoryIdParam = url.searchParams.get("category");

    // Ensure sortOrder is either "asc" or "desc"
    if (!["asc", "desc"].includes(sortOrder.toLowerCase())) {
      sortOrder = "desc";
    }

    // Convert categoryId to a number if it exists
    const categoryId = categoryIdParam ? parseInt(categoryIdParam, 10) : undefined;

   

    const whereClause: Prisma.CustomerWhereInput = {
      companyId,
      AND: [
        search
          ? {
              OR: [
                { customerName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { mobileNumber: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        categoryId !== undefined ? { categoryId } : {}, // ✅ Ensure categoryId is a number
      ],
    };

    const totalCount = await prisma.customer.count({ where: whereClause });

    const customers = await prisma.customer.findMany({
      where: whereClause,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: true },
      orderBy: { [sortField]: sortOrder as Prisma.SortOrder },
    });

    return NextResponse.json({
      data: customers,
      meta: {
        totalCount,
        currentPage: page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


// PUT: Update a customer by ID
export async function PUT(request: Request, { params }: { params: { companyId: string } }) {
  try {
    const companyId = parseInt(params.companyId, 10);
    if (isNaN(companyId)) {
      return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
    }

    const url = new URL(request.url);
    const customerId = url.searchParams.get("id");
    if (!customerId) {
      return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      customerName,
      email,
      address,
      stateDistrictPin,
      gstNumber,
      cinNumber,
      businessLegalName,
      authorizedPersonName,
      mobileNumber,
      whatsappNumber,
      categoryId,
    } = body;

    // Validate required fields (optional, adjust as needed)
    if (!customerName || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Update customer
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        customerName,
        email,
        address,
        stateDistrictPin,
        gstNumber,
        cinNumber,
        businessLegalName,
        authorizedPersonName,
        mobileNumber,
        whatsappNumber,
        category: categoryId
          ? { connect: { id: categoryId } }
          : existingCustomer.categoryId
          ? { connect: { id: existingCustomer.categoryId } }
          : undefined, // Ensures valid category connection
      },
    });

    return NextResponse.json(updatedCustomer, { status: 200 });
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
  

// DELETE: Delete a customer by ID

export async function DELETE(request: Request, { params }: { params: { companyId: string } }) {
    try {
        const companyId = parseInt(params.companyId, 10);

        if (isNaN(companyId)) {
            return NextResponse.json({ error: "Invalid company ID" }, { status: 400 });
        }

        const url = new URL(request.url);
        const customerId = url.searchParams.get("id");

        if (!customerId) {
            return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 });
        }

        // Step 1: Get all deals associated with the customer
        const deals = await prisma.deal.findMany({
            where: { customerId: customerId },
            select: { id: true }, // Only fetch deal IDs
        });

        const dealIds = deals.map(deal => deal.id);

        // Step 2: Delete payments related to the deals
        if (dealIds.length > 0) {
            await prisma.payment.deleteMany({
                where: { dealId: { in: dealIds } },
            });
        }

        // Step 3: Delete deals associated with the customer
        await prisma.deal.deleteMany({
            where: { customerId: customerId },
        });

        // Step 4: Delete AMS records related to the customer
        await prisma.aMS.deleteMany({
            where: { customerId: customerId },
        });

        // Step 5: Finally, delete the customer
        await prisma.customer.delete({
            where: { id: customerId },
        });

        return NextResponse.json({ message: "Customer deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
