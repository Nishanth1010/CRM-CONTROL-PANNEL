// File: /app/api/auth/employee/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();


export async function POST(req: NextRequest) {
  try {
    const { employeeEmail, employeePassword, name, companyId, accessLevel } = await req.json();

    if (!employeeEmail || !employeePassword || !name || !companyId) {
      return NextResponse.json({
        success: false,
        message: 'Employee email, password, name, and companyId are required',
      }, { status: 400 });
    }

    // Check if employee email already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: employeeEmail },
    });

    if (existingEmployee) {
      return NextResponse.json({
        success: false,
        message: 'Employee with this email already exists',
      }, { status: 400 });
    }

    // Hash the employee's password before saving
    const hashedPassword = await bcrypt.hash(employeePassword, 10);

    // Create the employee and associate with the company
    const employee = await prisma.employee.create({
      data: {
        email: employeeEmail,
        password: hashedPassword,
        name: name,
        companyId: companyId,
        accessLevel: accessLevel || 'LEAD', // Adjust default as needed
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    }, { status: 201 });

  } catch (error) {
    console.error('Error during employee registration:', error);
    return NextResponse.json({
      success: false,
      message: 'Error during employee registration',
    }, { status: 500 });
  }
}
