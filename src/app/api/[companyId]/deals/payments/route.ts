import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

// POST: Create a new payment for a deal
export async function POST(req: NextRequest, { params }: { params: { companyId: string } }) {
  const { companyId } = params;
  const body = await req.json();
  const { dealId, amount, paymentDate, paymentType, remarks, createdById } = body;

  // Validate companyId
  if (!companyId || isNaN(Number(companyId))) {
    return NextResponse.json({ error: 'Invalid companyId' }, { status: 400 });
  }

  // Validate required fields
  if (!dealId || !amount || !paymentDate || !paymentType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Check if the deal exists and belongs to the company
    const deal = await prisma.deal.findUnique({
      where: { id: Number(dealId), companyId: Number(companyId) },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found or does not belong to the company' }, { status: 404 });
    }

    // Check if employee exists if createdById is provided
    if (createdById) {
      const employee = await prisma.employee.findUnique({
        where: { id: Number(createdById) },
      });
      if (!employee) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      }
    }

    // Create the new payment
    const newPayment = await prisma.payment.create({
      data: {
        dealId: Number(dealId),
        amount,
        paymentDate: new Date(paymentDate),
        paymentType,
        remarks: remarks || '',
        createdById: createdById ? Number(createdById) : null,
      },
      include: {
        createdBy: true, // Include the employee details in the response
      },
    });

    // Update the deal's balance amount
    const updatedDeal = await prisma.deal.update({
      where: { id: Number(dealId) },
      data: {
        balanceAmount: deal.balanceAmount - amount,
      },
    });

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create payment', details: error.message }, { status: 500 });
  }
}

// GET: Fetch all payments for a deal
export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
  const { companyId } = params;
  const { searchParams } = new URL(req.url);

  const dealId = searchParams.get('dealId');

  // Validate companyId
  if (!companyId || isNaN(Number(companyId))) {
    return NextResponse.json({ error: 'Invalid companyId' }, { status: 400 });
  }

  // Validate dealId
  if (!dealId) {
    return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 });
  }

  try {
    // Check if the deal exists and belongs to the company
    const deal = await prisma.deal.findUnique({
      where: { id: Number(dealId), companyId: Number(companyId) },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found or does not belong to the company' }, { status: 404 });
    }

    // Fetch all payments for the deal with createdBy information
    const payments = await prisma.payment.findMany({
      where: { dealId: Number(dealId) },
      orderBy: { paymentDate: 'desc' },
      include: {
        createdBy: true, // Include the employee details
      },
    });

    return NextResponse.json({ payments }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch payments', details: error.message }, { status: 500 });
  }
}

// PUT: Update an existing payment
export async function PUT(req: NextRequest, { params }: { params: { companyId: string } }) {
  const { companyId } = params;
  const body = await req.json();
  const { id, amount, paymentDate, paymentType, remarks, createdById } = body;

  // Validate companyId
  if (!companyId || isNaN(Number(companyId))) {
    return NextResponse.json({ error: 'Invalid companyId' }, { status: 400 });
  }

  // Validate required fields
  if (!id || !amount || !paymentDate || !paymentType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Check if the payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id: Number(id) },
    });

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Check if employee exists if createdById is provided
    if (createdById) {
      const employee = await prisma.employee.findUnique({
        where: { id: Number(createdById) },
      });
      if (!employee) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      }
    }

    // Update the payment
    const updatedPayment = await prisma.payment.update({
      where: { id: Number(id) },
      data: {
        amount,
        paymentDate: new Date(paymentDate),
        paymentType,
        remarks: remarks || '',
        createdById: createdById ? Number(createdById) : null,
      },
      include: {
        createdBy: true, // Include the employee details in the response
      },
    });

    return NextResponse.json(updatedPayment, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update payment', details: error.message }, { status: 500 });
  }
}

// DELETE: Delete a payment
export async function DELETE(req: NextRequest, { params }: { params: { companyId: string } }) {
  const { companyId } = params;
  const body = await req.json();
  const { id } = body;

  // Validate companyId
  if (!companyId || isNaN(Number(companyId))) {
    return NextResponse.json({ error: 'Invalid companyId' }, { status: 400 });
  }

  // Validate payment ID
  if (!id) {
    return NextResponse.json({ error: 'Payment ID is required for deletion' }, { status: 400 });
  }

  try {
    // Check if the payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id: Number(id) },
      include: {
        deal: true, // Include deal to check company ownership
      },
    });

    if (!existingPayment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Verify the payment belongs to the company
    if (existingPayment.deal.companyId !== Number(companyId)) {
      return NextResponse.json({ error: 'Payment does not belong to this company' }, { status: 403 });
    }

    // Delete the payment
    await prisma.payment.delete({
      where: { id: Number(id) },
    });

    // Update the deal's balance amount by adding back the deleted payment amount
    await prisma.deal.update({
      where: { id: existingPayment.dealId },
      data: {
        balanceAmount: {
          increment: existingPayment.amount,
        },
      },
    });

    return NextResponse.json({ message: 'Payment deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete payment', details: error.message }, { status: 500 });
  }
}