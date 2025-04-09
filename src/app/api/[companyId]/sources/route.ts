// File: /app/api/source/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { companyId: string } }) {
  try {
    const companyId = Number(params.companyId);
    const { source } = await req.json();

    if (!source || !companyId) {
      return NextResponse.json({
        success: false,
        message: 'Source and companyId are required',
      }, { status: 400 });
    }

    const newSource = await prisma.source.create({
      data: {
        source,
        companyId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Source created successfully',
      data: newSource,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error creating source',
    }, { status: 500 });
  }
}

// READ all sources or a single source (GET)
export async function GET(req: NextRequest, { params }: { params: { companyId: string } }) {
  const companyId = Number(params.companyId);

  const { searchParams } = new URL(req.url);

  const sourceId = searchParams.get('id'); // For fetching a single source
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const skip = (page - 1) * limit;
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';
  const searchQuery = searchParams.get('search') || ''; // <-- match with frontend param 'search'

  try {
    if (sourceId) {
      const source = await prisma.source.findUnique({
        where: { id: Number(sourceId) },
      });

      if (!source) {
        return NextResponse.json(
          { success: false, message: 'Source not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, data: source },
        { status: 200 }
      );
    }

    // Get sources with filters, search, pagination, and sorting
    const sources = await prisma.source.findMany({
      where: {
        companyId,
        source: {
          contains: searchQuery,
          mode: 'insensitive',
        },
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const totalSources = await prisma.source.count({
      where: {
        companyId, // <-- this was missing!
        source: {
          contains: searchQuery,
          mode: 'insensitive',
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: sources,
        total: totalSources,
        page,
        totalPages: Math.ceil(totalSources / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching sources' },
      { status: 500 }
    );
  }
}

// UPDATE a source (PUT)
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sourceId = searchParams.get('sourceId'); // Source ID to be updated

  try {
    if (!sourceId) {
      return NextResponse.json({
        success: false,
        message: 'Source ID is required',
      }, { status: 400 });
    }

    const { source, companyId } = await req.json();

    const updatedSource = await prisma.source.update({
      where: { id: Number(sourceId) },
      data: {
        source: source || undefined,
        companyId: companyId || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Source updated successfully',
      data: updatedSource,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error updating source',
    }, { status: 500 });
  }
}

// DELETE a source (DELETE)
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sourceId = searchParams.get('sourceId'); // Source ID to be deleted

  try {
    if (!sourceId) {
      return NextResponse.json({
        success: false,
        message: 'Source ID is required',
      }, { status: 400 });
    }

    await prisma.source.delete({
      where: { id: Number(sourceId) },
    });

    return NextResponse.json({
      success: true,
      message: 'Source deleted successfully',
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error deleting source',
    }, { status: 500 });
  }
}