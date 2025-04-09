// File: /app/api/company/[companyId]/employees/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';


const prisma = new PrismaClient();

// GET: Fetch all employees for a specific company
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = parseInt(params.id, 10);

  if (isNaN(companyId)) {   
    return NextResponse.json({ success: false, message: 'Invalid company ID' }, { status: 400 });
  }

  try {
    const employees = await prisma.employee.findMany({
      where: { companyId , isActive : true },
      select: {
        id: true,
        name: true,
        email: true,
        profileImg: true,
        accessLevel: true,
      },
    });

    return NextResponse.json({ success: true, data: employees }, { status: 200 });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ success: false, message: 'Error fetching employees' }, { status: 500 });
  }
}

// POST: Create a new employee for a specific company
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = parseInt(params.id, 10);
  
  if (isNaN(companyId)) {
    return NextResponse.json({ success: false, message: 'Invalid company ID' }, { status: 400 });
  }

  try {
    const { name, email, accessLevel, profileImg } = await req.json();

    // Validation
    if (!name || !email || !accessLevel) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and access level are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmployee = await prisma.employee.findUnique({ where: { email } });
    if (existingEmployee) {
      return NextResponse.json(
        { success: false, message: 'An employee with this email already exists' },
        { status: 400 }
      );
    }

    // Retrieve company details and employee/admin count
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        employees: true,
        admins: true,
      },
    });

    if (!company) {
      return NextResponse.json({ success: false, message: 'Company not found' }, { status: 404 });
    }

    // Check if adding a new employee would exceed the license count
    const currentEmployeeCount = company.employees.length + company.admins.length;
    if (currentEmployeeCount >= company.licenseCount) {
      return NextResponse.json(
        { success: false, message: 'License limit reached. Cannot add more employees.' },
        { status: 403 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("welcome@123", 10); // Salt rounds set to 10

    // Create the employee with hashed password
    const newEmployee = await prisma.employee.create({
      data: {
        name,
        email,
        password: hashedPassword, // Store the hashed password
        accessLevel,
        profileImg,
        companyId,
      },
    });

    return NextResponse.json({ success: true, data: newEmployee }, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ success: false, message: 'Error creating employee' }, { status: 500 });
  }
}


// PUT: Update an existing employee for a specific company
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const companyId = parseInt(params.id, 10);
  const { searchParams } = new URL(req.url);
  const employeeId = parseInt(searchParams.get('employeeId') || '', 10);

  if (isNaN(companyId) || isNaN(employeeId)) {
    return NextResponse.json({ success: false, message: 'Invalid company or employee ID' }, { status: 400 });
  }

  try {
    const { name, email, accessLevel, profileImg } = await req.json();

    // Validation
    if (!name || !email || !accessLevel) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and access level are required' },
        { status: 400 }
      );
    }

    // Update the employee
    const updatedEmployee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        name,
        email,
        accessLevel,
        profileImg,
      },
    });

    return NextResponse.json({ success: true, data: updatedEmployee }, { status: 200 });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ success: false, message: 'Error updating employee' }, { status: 500 });
  }
}

// DELETE: Remove an employee for a specific company

export async function DELETE(req: NextRequest, { params }: { params: { id: Number } }) {
  const companyId = params.id;
  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get('employeeId');

  if (!employeeId || isNaN(Number(employeeId))) {
    return NextResponse.json(
      { success: false, message: 'Invalid or missing employee ID' },
      { status: 400 }
    );
  }

  try {
    // Convert employeeId to a number for type consistency
    const employeeIdInt = parseInt(employeeId, 10);

    // Check if the employee exists and belongs to the company
    const employee = await prisma.employee.findUnique({
      where: { id: employeeIdInt },
    });


    // Delete the employee
    await prisma.employee.update({ where: { id: employeeIdInt } , data : { isActive : false} });

    return NextResponse.json({ success: true, message: 'Employee deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ success: false, message: 'Error deleting employee' }, { status: 500 });
  }
}