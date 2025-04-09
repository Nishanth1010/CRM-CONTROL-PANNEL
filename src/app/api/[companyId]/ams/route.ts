import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// CREATE a new AMS record (POST)
export async function POST(req: NextRequest, { params }: { params: { companyId: string } }) {
  try {
    const { customerId, productId, visitDate, employeeId, status, amsCost, noOfVisitsPerYear } = await req.json();

    if (!customerId || !productId || !visitDate || !amsCost || !noOfVisitsPerYear || !employeeId) {
      return NextResponse.json(
        {
          success: false,
          message: 'CustomerId, productId, visitDate, amsCost, noOfVisitsPerYear , EmployeeID are required',
        },
        { status: 400 }
      );
    }

    const initialVisitDate = new Date(visitDate);
    const visits = [];

    // Calculate interval in months to distribute visits evenly within a year
    const intervalMonths = Math.floor(12 / noOfVisitsPerYear);

    for (let i = 1; i <= noOfVisitsPerYear; i++) {
      const nextVisitDate = new Date(initialVisitDate);
      nextVisitDate.setMonth(nextVisitDate.getMonth() + i * intervalMonths);

      // Create an AMS record for each visit
      const amsRecord = await prisma.aMS.create({
        data: {
          customerId,
          companyId: params.companyId,
          productId,
          visitDate: nextVisitDate,
          employeeId: employeeId || null,
          status: status || 'SCHEDULED',
          amsCost,
        },
      });

      visits.push({ visitNumber: i, visitDate: nextVisitDate, amsRecord });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'AMS records created successfully',
        data: { visits },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating AMS records:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error creating AMS records',
      },
      { status: 500 }
    );
  }
}

// READ AMS records or Search Products (GET)


export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
  try {
    const { searchParams } = new URL(req.url);
    const amsId = searchParams.get('id');
    const productQuery = searchParams.get('productQuery');
    const todayParam = searchParams.get('today');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'visitDate';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    // Fetch products if `productQuery` is provided
    if (productQuery) {
      const products = await prisma.product.findMany({
        where: {
          name: {
            contains: productQuery,
            mode: 'insensitive',
          },
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: products,
        },
        { status: 200 }
      );
    }

    // If `amsId` is provided, fetch the specific AMS record
    if (amsId) {
      const amsRecord = await prisma.aMS.findUnique({
        where: { id: Number(amsId) },
        include: { product: true, customer: true, employee: true },
      });

      if (!amsRecord) {
        return NextResponse.json(
          {
            success: false,
            message: 'AMS record not found',
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: amsRecord,
        },
        { status: 200 }
      );
    }

    // Initialize `whereCondition`
    let whereCondition: any = { companyId: params.companyId };

    // Apply date filtering if `todayParam` is provided
    if (todayParam) {
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);
    
      whereCondition.visitDate = {
        gte: today,
        lte: thirtyDaysLater,
      };
    }

    // Apply status filtering if `status` is provided
    if (status) {
      whereCondition.status = { equals: 'SCHEDULED' };
    }

    // Fix: Correctly filter `customer.customerName` using a separate query
    let customerIds: string[] = [];
    if (search) {
      const matchingCustomers = await prisma.customer.findMany({
        where: {
          customerName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        select: { id: true },
      });

      customerIds = matchingCustomers.map((customer) => customer.id);
      if (customerIds.length > 0) {
        whereCondition.customerId = { in: customerIds };
      } else {
        return NextResponse.json(
          {
            success: true,
            data: [],
            total: 0,
            page,
            totalPages: 0,
          },
          { status: 200 }
        );
      }
    }

    // Fetch paginated AMS records
    const amsRecords = await prisma.aMS.findMany({
      skip,
      take: limit,
      where: whereCondition,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: { product: true, customer: true, employee: true },
    });

    // Count total AMS records
    const totalAMSRecords = await prisma.aMS.count({ where: whereCondition });

    return NextResponse.json(
      {
        success: true,
        data: amsRecords,
        total: totalAMSRecords,
        page,
        totalPages: Math.ceil(totalAMSRecords / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching AMS records or products:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching data',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


// UPDATE an AMS record (PUT)
export async function PUT(req: NextRequest, { params }: { params: { companyId: string } }) {
  const { searchParams } = new URL(req.url);
  const amsId = searchParams.get('id');

  try {
    if (!amsId) {
      return NextResponse.json(
        {
          success: false,
          message: 'AMS ID is required',
        },
        { status: 400 }
      );
    }

    const { status } = await req.json();

    const updatedAMSRecord = await prisma.aMS.update({
      where: { id: Number(amsId) },
      data: {
        status,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'AMS record updated successfully',
        data: { updatedAMSRecord },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating AMS record:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error updating AMS record',
      },
      { status: 500 }
    );
  }
}

// DELETE an AMS record (DELETE)
export async function DELETE(req: NextRequest, { params }: { params: { companyId: string } }) {
  const { searchParams } = new URL(req.url);
  const amsId = searchParams.get('id');

  try {
    if (!amsId) {
      return NextResponse.json(
        {
          success: false,
          message: 'AMS ID is required',
        },
        { status: 400 }
      );
    }

    await prisma.aMS.delete({
      where: { id: Number(amsId) },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'AMS record deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting AMS record:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error deleting AMS record',
      },
      { status: 500 }
    );
  }
}
