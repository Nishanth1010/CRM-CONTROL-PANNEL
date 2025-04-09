import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
  const companyId = parseInt(params.companyId, 10);

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (isNaN(companyId)) {
    return NextResponse.json({ success: false, message: 'Invalid Company ID' }, { status: 400 });
  }

  try {
    // Parse startDate and endDate with time
    const startDateTime = startDate ? new Date(startDate) : undefined;
    const endDateTime = endDate ? new Date(endDate) : undefined;

    if (startDateTime) {
      // Set start date time to the beginning of the day (00:00:00)
      startDateTime.setHours(0, 0, 0, 0);
    }

    if (endDateTime) {
      // Set end date time to the end of the day (23:59:59)
      endDateTime.setHours(23, 59, 59, 999);
    }

    // Fetch employee performance data
    const performers = await prisma.employee.findMany({
      where: {
        companyId,
        leads: {
          some: {
            nextFollowupDate: {
              gte: startDateTime,
              lte: endDateTime,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        leads: {
          select: {
            status: true,
          },
        },
      },
    });

    // Process data to calculate required metrics for each employee
    let bestPerformers = performers.map((employee) => {
      const totalLeads = employee.leads.length;
      const inProgress = employee.leads.filter((lead) => lead.status === 'IN_PROGRESS').length;
      const customer = employee.leads.filter((lead) => lead.status === 'CUSTOMER').length;
      const rejected = employee.leads.filter((lead) => lead.status === 'REJECTED').length;

      return {
        name: employee.name,
        totalLeads,
        inProgress,
        customer,
        rejected,
      };
    });

    // Filter out employees with no leads in any category
    bestPerformers = bestPerformers.filter((performer) => {
      return performer.inProgress > 0 || performer.customer > 0 || performer.rejected > 0;
    });

    // Sort by customer count in descending order
    bestPerformers.sort((a, b) => b.customer - a.customer);

    // Add ranking to each performer
    bestPerformers = bestPerformers.map((performer, index) => ({
      rank: index + 1,
      ...performer,
    }));

    return NextResponse.json({
      success: true,
      data: {
        bestPerformers,
        followupLeaders: [], // Assuming this will still need to be handled elsewhere
      },
    });
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    return NextResponse.json({ success: false, message: 'Error fetching leaderboard data' }, { status: 500 });
  }
}
