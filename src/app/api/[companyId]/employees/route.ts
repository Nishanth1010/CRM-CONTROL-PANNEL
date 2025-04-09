// File: /app/api/employees/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper for pagination
const getPagination = (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  return { offset, limit };
};

// CREATE a new employee (POST)
export async function POST(req: NextRequest) {
  try {
    const { email, password, name, companyId, profileImg } = await req.json();

    // Validate required fields
    if (!email || !password || !name || !companyId) {
      return NextResponse.json(
        { success: false, message: 'Email, password, firstName, lastName, and companyId are required' },
        { status: 400 }
      );
    }

    const newEmployee = await prisma.employee.create({
      data: {
        email,
        password, // Ideally, you'd hash the password before saving
        name,
        accessLevel : "ALL_ACCESS",
        companyId: Number(companyId), // Ensure companyId is a number
        profileImg: profileImg || null, // Optional field
      },
    });

    return NextResponse.json(
      { success: true, message: 'Employee created successfully', data: newEmployee },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error creating employee' },
      { status: 500 }
    );
  }
}

// READ employees with search query and pagination (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Pagination
  const page = parseInt(searchParams.get('page') || '1', 10); // Default page 1
  const limit = parseInt(searchParams.get('limit') || '10', 10); // Default limit 10

  // Search query (name search)
  const searchQuery = searchParams.get('query') || ''; // Optional search query for name

  const { offset } = getPagination(page, limit);

  try {
    // Get employees with optional name search (firstName or lastName)
    const employees = await prisma.employee.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchQuery, // Partial match search
              mode: 'insensitive', // Case insensitive
            },
          },
        ],
        isActive : true
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: 'desc', // Default order by creation date (newest first)
      },
    });

    // Get total count of employees (with the same filters)
    const totalEmployees = await prisma.employee.count({
      where: {
        OR: [
          {
            name: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: employees,
        total: totalEmployees,
        page,
        totalPages: Math.ceil(totalEmployees / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching employees' },
      { status: 500 }
    );
  }
}

// UPDATE an employee (PUT)
export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get('id'); // Employee ID to update

  try {
    if (!employeeId) {
      return NextResponse.json({ success: false, message: 'Employee ID is required' }, { status: 400 });
    }

    const { name, email, password, companyId, profileImg } = await req.json();

    const updatedEmployee = await prisma.employee.update({
      where: { id: Number(employeeId) },
      data: {
        name : name || undefined,
        email: email || undefined,
        password: password || undefined, // If password is updated, ensure it's hashed
        companyId: companyId || undefined,
        profileImg: profileImg || undefined,
      },
    });

    return NextResponse.json({ success: true, message: 'Employee updated successfully', data: updatedEmployee }, { status: 200 });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ success: false, message: 'Error updating employee' }, { status: 500 });
  }
}

// DELETE an employee (DELETE)
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get('id'); // Employee ID to delete

  try {
    if (!employeeId) {
      return NextResponse.json({ success: false, message: 'Employee ID is required' }, { status: 400 });
    }

    await prisma.employee.update({
      where: { id: Number(employeeId) },
      data : {isActive : false}
    });

    return NextResponse.json({ success: true, message: 'Employee deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ success: false, message: 'Error deleting employee' }, { status: 500 });
  }
}
