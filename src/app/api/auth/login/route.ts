import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || 'secret-key';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { auth: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Attempt to find the user in the Admin table
    let user = await prisma.admin.findUnique({
      where: { email },
      include: { company: true },
    });
    let userType = 'admin';

    // If not found in Admin, search in Employee
    if (!user) {
      user = await prisma.employee.findUnique({
        where: { email },
        include: { company: true },
      });
      userType = 'employee';
    }

    if (!user) {
      return NextResponse.json(
        { auth: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if the account is inactive
    if (user.isActive === false) {
      return NextResponse.json(
        {
          auth: false,
          message: 'Your account has been inactivated. Please contact admin@xyloinc.com',
        },
        { status: 403 }
      );
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const failedAttempts = user.failedLoginAttempts ?? 0;

      // Increment failed login attempts
      if (userType === 'admin') {
        await prisma.admin.update({
          where: { id: user.id },
          data: { failedLoginAttempts: failedAttempts + 1 },
        });
      } else {
        await prisma.employee.update({
          where: { id: user.id },
          data: { failedLoginAttempts: failedAttempts + 1 },
        });
      }

      // Deactivate account after 3 failed attempts
      if (failedAttempts + 1 >= 3) {
        if (userType === 'admin') {
          await prisma.admin.update({
            where: { id: user.id },
            data: { isActive: false },
          });
        } else {
          await prisma.employee.update({
            where: { id: user.id },
            data: { isActive: false },
          });
        }

        return NextResponse.json(
          {
            auth: false,
            message: 'Your account has been inactivated due to multiple failed login attempts. Please contact admin@xyloinc.com',
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { auth: false, message: `Invalid credentials. You have ${2 - failedAttempts} attempts remaining.` },
        { status: 401 }
      );
      
    }

    // Reset failed login attempts on successful login
    if (userType === 'admin') {
      await prisma.admin.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0 },
      });
    } else {
      await prisma.employee.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0 },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: userType, companyId: user.companyId },
      secret,
      { expiresIn: '1h' }
    );

    // Return successful response with user info
    return NextResponse.json(
      {
        auth: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: userType,
          name: user.name,
          companyId: user.companyId,
          profileImg: user.profileImg,
          companyName: user.company.name,
          accessLevel: user.accessLevel,
          companyAccess: user.company.CompanyAccess,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { auth: false, message: 'Something went wrong' },
      { status: 500 }
    );
  }
}
