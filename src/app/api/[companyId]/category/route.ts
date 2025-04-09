import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper for pagination
const getPagination = (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  return { offset, limit };
};

// GET: Fetch all categories for a specific company with pagination
export async function GET(req: Request, { params }: { params: { companyId: string } }) {
  try {
    const companyId = parseInt(params.companyId);
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const searchQuery = searchParams.get('query') || '';
    const { offset } = getPagination(page, limit);

    const categories = await prisma.category.findMany({
      where: {
        companyId,
        categoryName: {
          contains: searchQuery,
          mode: 'insensitive',
        },
      },
      skip: offset,
      take: limit,
      orderBy: {
        categoryName: 'asc',
      },
    });

    const totalCategories = await prisma.category.count({
      where: {
        companyId,
        categoryName: {
          contains: searchQuery,
          mode: 'insensitive',
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
      total: totalCategories,
      page,
      totalPages: Math.ceil(totalCategories / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// POST: Create a new category for a company
export async function POST(req: Request, { params }: { params: { companyId: string } }) {
  try {
    const companyId = parseInt(params.companyId);
    const { categoryName } = await req.json();

    if (!categoryName) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    const newCategory = await prisma.category.create({
      data: {
        categoryName,
        companyId,
      },
    });

    return NextResponse.json(
      { success: true, message: "Category created successfully", data: newCategory },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

// PUT: Update a category by ID
export async function PUT(req: Request, { params }: { params: { companyId: string } }) {
  try {
    const { id, categoryName } = await req.json();
    if (!id || !categoryName) {
      return NextResponse.json(
        { success: false, message: "Category ID and name are required" },
        { status: 400 }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { categoryName },
    });

    return NextResponse.json(
      { success: true, message: "Category updated successfully", data: updatedCategory },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// DELETE: Delete a category by ID
export async function DELETE(req: Request, { params }: { params: { companyId: string } }) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Category ID is required" },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json(
      { success: true, message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
