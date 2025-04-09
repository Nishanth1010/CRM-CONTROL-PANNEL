import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// READ all follow-ups for a specific lead (GET)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');
    
    if (!leadId) {
      return NextResponse.json({ success: false, message: 'Lead ID is required.' }, { status: 200 });
    }

    const followups = await prisma.followup.findMany({
      where: {
        leadId: Number(leadId),
      },
      orderBy: {
        nextFollowupDate: 'desc',
      },
    });

    if (followups.length === 0) {
      return NextResponse.json({ success: false, message: 'No follow-ups found for this lead' }, { status: 200 });
    }

    return NextResponse.json({ success: true, data: followups }, { status: 200 });
  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    return NextResponse.json({ success: false, message: 'Error fetching follow-ups' }, { status: 500 });
  }
}

// CREATE a new follow-up for a specific lead (POST)
export async function POST(req: NextRequest) {
  try {
    const { nextFollowupDate, lastRequirement, status, leadId } = await req.json();

    if (!nextFollowupDate || !lastRequirement || !status || !leadId ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Next Follow-up Date, Last Requirement, Status, and Lead ID are required.',
        },
        { status: 400 }
      );
    }

    const [newFollowup] = await prisma.$transaction([
      prisma.followup.create({
        data: {
          nextFollowupDate: new Date(nextFollowupDate),
          lastRequirement,
          status,
          lead: {
            connect: { id: Number(leadId) },
          },
        },
      }),
      prisma.lead.update({
        where: { id: Number(leadId) },
        data: { nextFollowupDate: new Date(nextFollowupDate), status: status },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: 'Follow-up created successfully and lead updated with next follow-up date.',
        data: newFollowup,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating follow-up and updating lead:', error);

    return NextResponse.json(
      { success: false, message: 'Error creating follow-up. Please try again later.' },
      { status: 500 }
    );
  }
}

// UPDATE a specific follow-up by ID (PUT)
export async function PUT(req: NextRequest) {
  try {
    const { nextFollowupDate, lastRequirement, status , leadId , id } = await req.json();

    if (!nextFollowupDate || !lastRequirement || !status || !leadId || !id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Next Follow-up Date, Last Requirement, Status, Lead ID, and Follow-up ID are required.',
        },
        { status: 400 }
      );
    }

    // Check if the follow-up exists
    const existingFollowup = await prisma.followup.findUnique({
      where: { id },
    });

    if (!existingFollowup) {
      return NextResponse.json({ success: false, message: 'Follow-up not found' }, { status: 404 });
    }

    // Update follow-up and lead in a transaction
    const [updatedFollowup] = await prisma.$transaction([
      prisma.followup.update({
        where: { id },
        data: {
          nextFollowupDate: new Date(nextFollowupDate),
          lastRequirement,
          status,
        },
      }),
      prisma.lead.update({
        where: { id: leadId },
        data: { nextFollowupDate: new Date(nextFollowupDate), status: status },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        message: 'Follow-up updated successfully and lead updated with new follow-up date.',
        data: updatedFollowup,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating follow-up:', error);

    return NextResponse.json(
      { success: false, message: 'Error updating follow-up. Please try again later.' },
      { status: 500 }
    );
  }
}

// DELETE a specific follow-up by ID
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const followupId = Number(searchParams.get('followupId'));

    // Check if the follow-up exists
    const existingFollowup = await prisma.followup.findUnique({
      where: { id: followupId },
      select: { leadId: true, nextFollowupDate: true },
    });

    if (!existingFollowup) {
      return NextResponse.json({ success: false, message: 'Follow-up not found' }, { status: 404 });
    }

    // Delete the follow-up
    await prisma.followup.delete({
      where: { id: followupId },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Follow-up deleted successfully.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting follow-up:', error);

    return NextResponse.json(
      { success: false, message: 'Error deleting follow-up. Please try again later.' },
      { status: 500 }
    );
  }
}
