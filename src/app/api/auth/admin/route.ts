// File: /app/api/auth/admin/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { adminEmail, adminPassword, name, companyId, accessLevel } = await req.json();

    if (!adminEmail || !adminPassword || !name || !companyId) {
      return NextResponse.json({
        success: false,
        message: 'Admin email, password, name, and companyId are required',
      }, { status: 400 });
    }

    // Check if admin email already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Admin with this email already exists',
      }, { status: 400 });
    }

    // Hash the admin's password before saving
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    try {
      // Create the admin and associate with the company
      const admin = await prisma.admin.create({
        data: {
          name: name,
          email: adminEmail,
          password: hashedPassword,
          companyId: companyId,
          accessLevel: accessLevel || 'ALL_ACCESS', // Default to ALL_ACCESS if accessLevel is not provided
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Admin created successfully',
        data: admin,
      }, { status: 201 });
    } catch (prismaError: any) {
      if (prismaError.code === 'P2002') {
        return NextResponse.json({
          success: false,
          message: 'Admin with this email already exists',
        }, { status: 400 });
      }
      throw prismaError;
    }

  } catch (error: any) {
    console.error('Error during admin registration:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal Server Error',
      message: 'Error during admin registration',
    }, { status: 500 });
  }
}
