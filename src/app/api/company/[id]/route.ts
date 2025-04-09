// File: /app/api/auth/company/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = parseInt(params.id, 10);

    // Check if the provided id is a valid number
    if (isNaN(companyId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid company ID' },
        { status: 400 }
      );
    }

    // Fetch the company details by ID
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: company },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching company details:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching company details' },
      { status: 500 }
    );
  }
}
