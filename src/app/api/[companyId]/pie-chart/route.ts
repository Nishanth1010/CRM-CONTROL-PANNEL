// pages/api/[companyId]/piechart.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
  const companyId = parseInt(params.companyId, 10);

  if (isNaN(companyId)) {
    return NextResponse.json({ success: false, message: 'Invalid Company ID' }, { status: 400 });
  }

  try {
    const [newLeads, contactedLeads, qualifiedLeads] = await Promise.all([
      prisma.lead.count({ where: { status: 'NEW', companyId } }),
      prisma.lead.count({ where: { status: 'IN_PROGRESS', companyId } }),
      prisma.lead.count({ where: { status: 'CUSTOMER', companyId } }),
    ]);

    const data = [newLeads, contactedLeads, qualifiedLeads];
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching pie chart data:', error);
    return NextResponse.json({ success: false, message: 'Error fetching pie chart data' }, { status: 500 });
  }
}
