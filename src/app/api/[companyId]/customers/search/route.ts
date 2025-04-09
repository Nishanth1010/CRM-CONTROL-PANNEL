import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
  const { companyId } = params;
  const query = req.nextUrl.searchParams.get('query'); // Extract query from URL search params

  // Validate the companyId and query parameters
  if (!companyId || isNaN(Number(companyId))) {
    return NextResponse.json({ error: 'Invalid companyId' }, { status: 400 });
  }

  if (!query || typeof query !== 'string') {
    return NextResponse.json({ error: 'Query parameter is required and should be a string.' }, { status: 400 });
  }

  try {
    // Search for customers within the specified company with names matching the query
    const customers = await prisma.customer.findMany({
      where: {
        companyId: Number(companyId),
        customerName: {
          contains: query, // Partial match
          mode: 'insensitive', // Case-insensitive
        },
      },
      select: {
        id: true,
        customerName: true,
      },
      take: 10, // Limit results for better performance
    });

    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to search customers', details: error }, { status: 500 });
  }
}
