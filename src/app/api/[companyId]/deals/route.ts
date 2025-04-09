
import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch all deals for a company

export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
  const { companyId } = params;
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get('page') || '0'); // Default to page 0
  const rowsPerPage = parseInt(searchParams.get('rowsPerPage') || '10'); // Default to 10 rows per page
  const searchQuery = searchParams.get('search') || ''; // Default to an empty search query
  const orderBy = searchParams.get('orderBy') || 'dealID'; // Default to sorting by dealID
  const order = searchParams.get('order') || 'asc'; // Default to ascending order

  if (!companyId || isNaN(Number(companyId))) {
    return NextResponse.json({ error: 'Invalid companyId' }, { status: 400 });
  }

  try {
    // Filtering and searching logic
    const whereCondition = {
      companyId: Number(companyId),
      OR: [
        {
          dealID: {
            contains: searchQuery,
            mode: Prisma.QueryMode.insensitive, // Correct usage of QueryMode
          },
        },
        {
          customer: {
            customerName: {
              contains: searchQuery,
              mode: Prisma.QueryMode.insensitive, // Correct usage of QueryMode
            },
          },
        },
        {
          requirement: {
            contains: searchQuery,
            mode: Prisma.QueryMode.insensitive, // Correct usage of QueryMode
          },
        },
      ],
    };

    // Calculate total records for pagination
    const totalRecords = await prisma.deal.count({
      where: whereCondition,
    });

    // Fetch paginated and sorted data
    const deals = await prisma.deal.findMany({
      where: whereCondition,
      include: { customer: true },
      orderBy: {
        [orderBy]: order === 'asc' ? 'asc' : 'desc',
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
  } catch (error : any) {
    return NextResponse.json(
      { error: 'Failed to fetch deals', details: error.message },
      { status: 500 }
    );
  }
}

  

// POST: Create a new deal for a company
export async function POST(req: NextRequest, { params }: { params: { companyId: string } }) {
  const { companyId } = params;
  const body = await req.json(); // Parse JSON body
  const { customerId, requirement, dealValue, dealApprovalValue, advancePayment, balanceAmount } = body;

  // Validate companyId
  if (!companyId || isNaN(Number(companyId))) {
    return NextResponse.json({ error: 'Invalid companyId' }, { status: 400 });
  }

  // Validate customerId
  if (!customerId) {
    return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
  }

  // Check if customer exists
  const existingCustomer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!existingCustomer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  try {
    // Extract the first four characters of the customer's name
    let customerNamePrefix = existingCustomer.customerName.replace(/[^a-zA-Z]/g, '');
    customerNamePrefix = customerNamePrefix.substring(0, 4).toUpperCase();
    
    // Get the current date in DDMM format
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const datePrefix = `${day}${month}`;

    // Generate the sequence number for the dealID
    const existingDealsCount = await prisma.deal.count({
      where: {
        customerId: customerId,
        dealID: {
          startsWith: `${customerNamePrefix}${datePrefix}`,
        },
      },
    });

    const sequenceNumber = String(existingDealsCount + 1).padStart(3, '0');

    // Generate the dealID
    const dealID = `${customerNamePrefix}${datePrefix}${sequenceNumber}`;

    // Create the new deal
    const newDeal = await prisma.deal.create({
      data: {
        customerId, // Link the deal to the customer
        dealID,
        requirement,
        dealValue,
        dealApprovalValue,
        advancePayment,
        balanceAmount,
        companyId: Number(companyId),
      },
    });

    // If advancePayment is greater than 0, create a corresponding Payment record
    if (advancePayment > 0) {
      await prisma.payment.create({
        data: {
          amount: advancePayment,
          paymentDate: new Date(), // Use the current date and time
          paymentType: 'Advance', // Indicate this is an advance payment
          dealId: newDeal.id, // Link the payment to the newly created deal
        },
      });
    }

    return NextResponse.json(newDeal, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create deal', details: error.message }, { status: 500 });
  }
}

  
  
  
// PUT: Update an existing deal
export async function PUT(req: NextRequest, { params }: { params: { companyId: string } }) {
    const { companyId } = params;
    const body = await req.json();
    const { id, requirement, dealValue, dealApprovalValue, advancePayment, balanceAmount } = body;
  
    if (!companyId || isNaN(Number(companyId))) {
      return NextResponse.json({ error: 'Invalid companyId' }, { status: 400 });
    }
  
    if (!id) {
      return NextResponse.json({ error: 'Deal ID is required for update' }, { status: 400 });
    }
  
    try {
      // Update only the specified fields
      const updatedDeal = await prisma.deal.update({
        where: { id: Number(id) },
        data: {
          ...(requirement && { requirement }),
          ...(dealValue && { dealValue }),
          ...(dealApprovalValue && { dealApprovalValue }),
          ...(advancePayment && { advancePayment }),
          balanceAmount: dealApprovalValue - advancePayment, 
        },
      });
  
      return NextResponse.json(updatedDeal, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({ error: 'Failed to update deal', details: error.message }, { status: 500 });
    }
  }
  
  

// DELETE: Delete a deal
export async function DELETE(req: NextRequest, { params }: { params: { companyId: string } }) {
  const { companyId } = params;
  const body = await req.json(); // Parse JSON body
  const { id } = body;

  // Validate companyId
  if (!companyId || isNaN(Number(companyId))) {
    return NextResponse.json({ error: 'Invalid companyId' }, { status: 400 });
  }

  // Validate deal ID
  if (!id) {
    return NextResponse.json({ error: 'Deal ID is required for deletion' }, { status: 400 });
  }

  try {
    // Check if the deal exists
  
    const existingDeal = await prisma.deal.findUnique({
      where: { id: Number(id) },
    });

    if (!existingDeal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    await prisma.payment.deleteMany({
      where: { dealId: Number(id) },
    })
    // Delete the deal
    await prisma.deal.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Deal deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete deal', details: error.message }, { status: 500 });
  }
}