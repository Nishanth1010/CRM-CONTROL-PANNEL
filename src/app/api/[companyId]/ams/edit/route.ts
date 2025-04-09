import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, AMSStatus } from '@prisma/client'; // Ensure AMSStatus enum is imported

const prisma = new PrismaClient();

export async function PUT(req: NextRequest, { params }: { params: { companyId: string } }) {
  const { searchParams } = new URL(req.url);
  const amsId = searchParams.get('id');

  try {
    if (!amsId) {
      return NextResponse.json(
        { success: false, message: 'AMS ID is required' },
        { status: 400 }
      );
    }

    let updateData = await req.json();

    // Ensure valid updateData
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No update data provided' },
        { status: 400 }
      );
    }

    // Extract only allowed fields
    const allowedUpdates: {
      visitDate?: string;
      status?: AMSStatus;
      amsCost?: number;
    } = {};

    if (updateData.visitDate) {
      const parsedDate = new Date(updateData.visitDate);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { success: false, message: 'Invalid visitDate format. Expected ISO-8601 format.' },
          { status: 400 }
        );
      }
      allowedUpdates.visitDate = parsedDate.toISOString(); // Convert to ISO-8601 format
    }

    if (updateData.status !== undefined) {
      if (!Object.values(AMSStatus).includes(updateData.status)) {
        return NextResponse.json(
          { success: false, message: 'Invalid status value' },
          { status: 400 }
        );
      }
      allowedUpdates.status = updateData.status; // Ensure it's a valid enum value
    }

    if (updateData.amsCost !== undefined) {
      allowedUpdates.amsCost = updateData.amsCost;
    }

    // Check if there's any valid data to update
    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields provided for update' },
        { status: 400 }
      );
    }

    // Update only the specified fields
    const updatedAMSRecord = await prisma.aMS.update({
      where: { id: Number(amsId) },
      data: allowedUpdates,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'AMS record updated successfully',
        data: updatedAMSRecord,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating AMS record:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating AMS record' },
      { status: 500 }
    );
  }
}
