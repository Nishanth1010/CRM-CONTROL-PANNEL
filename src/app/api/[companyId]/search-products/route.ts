// File: /app/api/product/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


// CREATE a new product (POST)
export async function POST(req: NextRequest) {
  try {
    const { name, price, companyId, description } = await req.json();

    if (!name || !price || !companyId || !description) {
      return NextResponse.json({
        success: false,
        message: 'Name, price, and companyId are required',
      }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price,
        companyId,
        description,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: product,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error creating product',
    }, { status: 500 });
  }
}

// READ all products or a single product (GET)
export async function GET(req: NextRequest, { params }: { params: { companyId: number } }) {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('id'); // If `id` is provided, fetch a single product
    const companyId = Number(params.companyId);
  
    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10); // Default page 1
    const limit = parseInt(searchParams.get('limit') || '10', 10); // Default limit 10
    const skip = (page - 1) * limit; // Skip for pagination
  
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // Default sorting by creation date
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'; // Default order is descending
  
    // Filtering (Optional product name search)
    const searchQuery = searchParams.get('search') || ''; // Search query for product name
  
    try {
      if (productId) {
        // Get single product by ID
        const product = await prisma.product.findUnique({
          where: { id: Number(productId) , companyId },
        });
  
        if (!product) {
          return NextResponse.json(
            {
              success: false,
              message: 'Product not found',
            },
            { status: 404 }
          );
        }
  
        return NextResponse.json(
          {
            success: true,
            data: product,
          },
          { status: 200 }
        );
      }
  
      // Fetch all products with optional search query, sorting, and pagination
      const products = await prisma.product.findMany({
        where: {
          companyId,
          name: {
            contains: searchQuery, // Filter by partial match for product name
            mode: 'insensitive', // Case-insensitive search
          },
        },
        skip, // Apply pagination (skip X items)
        take: limit, // Limit to X items per page
        orderBy: {
          [sortBy]: sortOrder, // Apply sorting
        },
      });
  
      // Get the total number of products (for pagination)
      const totalProducts = await prisma.product.count({
        where: {
          companyId,
          name: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
      });
  
      return NextResponse.json(
        {
          success: true,
          data: products,
          total: totalProducts,
          page,
          totalPages: Math.ceil(totalProducts / limit),
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Error fetching products',
        },
        { status: 500 }
      );
    }
  }
  

// UPDATE a product (PUT)
export async function PUT(req: NextRequest , { params }: { params: { companyId: number } }) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('id'); // Product ID to be updated
  const companyId = Number(params.companyId);


  try {
    if (!productId) {
      return NextResponse.json({
        success: false,
        message: 'Product ID is required',
      }, { status: 400 });
    }

    const { name, price, companyId, description} = await req.json();

    const updatedProduct = await prisma.product.update({
      where: { id: Number(productId) },
      data: {
        name: name || undefined,
        price: price || undefined,
        companyId: companyId || undefined,
        description: description || undefined
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error updating product',
    }, { status: 500 });
  }
}

// DELETE a product (DELETE)
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('id'); // Product ID to be deleted

  try {
    if (!productId) {
      return NextResponse.json({
        success: false,
        message: 'Product ID is required',
      }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: Number(productId) },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error deleting product',
    }, { status: 500 });
  }
}
