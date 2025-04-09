import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { startOfToday, endOfToday } from 'date-fns';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
  const companyId = parseInt(params.companyId, 10);
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get('employeeId') ? parseInt(searchParams.get('employeeId')!) : null;

  if (isNaN(companyId)) {
    return NextResponse.json({ success: false, message: 'Invalid Company ID' }, { status: 400 });
  }

  try {
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    // Fetch Lead and Follow-up statistics
    const [
      newLeads,
      contactedLeads,
      rejectedLeads,
      customerLeads,
      totalCustomers,
      totalDeals,
      totalFollowUpTodayCount,
      pendingFollowUpTodayCount,
    ] = await Promise.all([
      prisma.lead.count({
        where: { status: 'NEW', companyId, ...(employeeId ? { employeeId } : {}) },
      }),
      prisma.lead.count({
        where: { status: 'IN_PROGRESS', companyId, ...(employeeId ? { employeeId } : {}) },
      }),
      prisma.lead.count({
        where: { status: 'REJECTED', companyId, ...(employeeId ? { employeeId } : {}) },
      }),
      prisma.lead.count({
        where: { status: 'CUSTOMER', companyId, ...(employeeId ? { employeeId } : {}) },
      }),
      prisma.customer.count({
        where: {
          companyId,
          ...(employeeId ? { lead: { employeeId } } : {}),
        },
      }),
      prisma.deal.count({
        where: {
          companyId,
          ...(employeeId ? { customer: { lead: { employeeId } } } : {}),
        },
      }),
    
      prisma.followup.count({
        where: {
          lead: {
            companyId,
            nextFollowupDate: {
              gte: todayStart,
              lte: todayEnd,
            },
            ...(employeeId ? { employeeId } : {}),
          },
        },
      }),
      prisma.followup.count({
        where: {
          lead: {
            companyId,
            nextFollowupDate: {
              gte: todayStart,
              lte: todayEnd,
            },
            ...(employeeId ? { employeeId } : {}),
          },
          NOT: {
            lead: {
              followups: {
                some: {
                  createdAt: {
                    gte: todayStart,
                    lte: todayEnd,
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    // Fetch Deal statistics
    const [totalDealValue, totalAdvanceReceived, totalOutstanding] = await Promise.all([
      prisma.deal.aggregate({
        _sum: { dealApprovalValue: true },
        where: {
          companyId,
          ...(employeeId ? { customer: { lead: { employeeId } } } : {}),
        },
      }),
      prisma.deal.aggregate({
        _sum: { advancePayment: true },
        where: {
          companyId
        },
      }),
      prisma.deal.aggregate({
        _sum: { balanceAmount: true },
        where: {
          companyId,
          ...(employeeId ? { customer: { lead: { employeeId } } } : {}),
        },
      }),
    ]);

    // Calculate trends
    const calculateTrend = (current: number, previous: number) => {
      const diff = current - previous;
      return { value: current, diff, trend: diff >= 0 ? 'up' : 'down' };
    };

    // Total leads calculation
    const totalLeadsCount = newLeads + contactedLeads + customerLeads + rejectedLeads;


    // Final data to return
    const data = {
      newLeads: calculateTrend(newLeads, 0),
      contactedLeads: calculateTrend(contactedLeads, 0),
      rejectedLeads: calculateTrend(rejectedLeads, 0),
      customerLeads: calculateTrend(customerLeads, 0),
      totalLeads: calculateTrend(totalLeadsCount, 0),
      totalCustomers: calculateTrend(totalCustomers, 0),
      totalDeals: calculateTrend(totalDeals, 0),
      totalFollowUpToday: { value: totalFollowUpTodayCount, diff: 0, trend: 'up' },
      pendingFollowUpToday: { value: pendingFollowUpTodayCount, diff: 0, trend: 'up' },
      totalDealValue: {
        value: parseFloat((totalDealValue._sum?.dealApprovalValue || 0).toFixed(2)),
        diff: 0,
        trend: 'up',
      },
      totalAdvanceReceived: {
        value: parseFloat(((totalAdvanceReceived._sum?.advancePayment || 0)).toFixed(2)),
        diff: 0,
        trend: 'up',
      },
      totalOutstanding: {
        value: parseFloat((totalOutstanding._sum?.balanceAmount || 0).toFixed(2)),
        diff: 0,
        trend: 'up',
      },
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching status card data:', error);
    return NextResponse.json({ success: false, message: 'Error fetching data' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
