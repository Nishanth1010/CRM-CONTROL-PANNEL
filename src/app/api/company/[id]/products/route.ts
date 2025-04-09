import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Fetch all products for a specific company
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = parseInt(params.id, 10);

  if (isNaN(companyId)) {
    return NextResponse.json({ success: false, message: 'Invalid company ID' }, { status: 400 });
  }

  try {
    const products = await prisma.product.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
      },
    });

    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, message: 'Error fetching products' }, { status: 500 });
  }
}

// POST: Create a new product for a specific company
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = parseInt(params.id, 10);

  if (isNaN(companyId)) {
    return NextResponse.json({ success: false, message: 'Invalid company ID' }, { status: 400 });
  }

  try {
    const { name, price, description } = await req.json();

    // Validation
    if (!name || !price || !description ) {
      return NextResponse.json(
        { success: false, message: 'Name, price are required' },
        { status: 400 }
      );
    }

    // Create the product
    const newProduct = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        description,
        companyId,
      },
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, message: 'Error creating product', error }, { status: 500 });
  }
}

// PUT: Update an existing product
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = parseInt(params.id, 10);
  const { searchParams } = new URL(req.url);
  const productId = parseInt(searchParams.get('productId') || '', 10);

  if (isNaN(companyId) || isNaN(productId)) {
    return NextResponse.json({ success: false, message: 'Invalid company or product ID' }, { status: 400 });
  }

  try {
    const { name, price, description } = await req.json();

    // Validation
    if (!name || !price || !description) {
      return NextResponse.json(
        { success: false, message: 'Name, price are required' },
        { status: 400 }
      );
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        price: parseFloat(price),
        description,
      },
    });

    return NextResponse.json({ success: true, data: updatedProduct }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, message: 'Error updating product' }, { status: 500 });
  }
}

// DELETE: Delete a product by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = parseInt(params.id, 10);
  const { searchParams } = new URL(req.url);
  const productId = parseInt(searchParams.get('productId') || '', 10);

  if (isNaN(companyId) || isNaN(productId)) {
    return NextResponse.json({ success: false, message: 'Invalid company or product ID' }, { status: 400 });
  }

  try {

    
    // Check if the product exists and belongs to the company
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    await prisma.aMS.deleteMany({where : {  productId : productId}})
    // Delete the product
    await prisma.product.delete({ where: { id: productId } });

    return NextResponse.json({ success: true, message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, message: 'Error deleting product' }, { status: 500 });
  }
}
