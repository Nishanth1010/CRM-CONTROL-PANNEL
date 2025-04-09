// File: /app/api/auth/company/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function POST(req: NextRequest) {
  try {
    const {
      companyName,
      companyDomain,
      logoUrl,
      gstin,
      cin,
      licenseCount,
      registerAddress,
      mobile,
      email,
      CompanyAccess
    } = await req.json();

    // Validate required fields
    if (!companyName || !companyDomain || !gstin || !cin || !registerAddress || !mobile || !email || !CompanyAccess) {
      return NextResponse.json(
        {
          success: false,
          message: 'All fields are required: companyName, companyDomain, gstin, cin, registerAddress, mobile, email',
        },
        { status: 400 }
      );
    }

    // Check if company domain already exists
    const existingCompany = await prisma.company.findUnique({
      where: { domain: companyDomain },
    });

    if (existingCompany) {
      return NextResponse.json(
        {
          success: false,
          message: 'Company with this domain already exists',
        },
        { status: 400 }
      );
    }

    // Create the company
    const company = await prisma.company.create({
      data: {
        name: companyName,
        domain: companyDomain,
        logoUrl,
        licenseCount,
        gstin,
        cin,
        registerAddress,
        mobile,
        email,
        CompanyAccess 
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Company created successfully',
        data: company,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error during company registration',
      },
      { status: 500 }
    );
  }
}
