import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword, confirmPassword } = await req.json();

    // Validate input
    if (!email || !newPassword ) {
      return NextResponse.json(
        { error: 'Email, newPassword are required' },
        { status: 400 }
      );
    }

   

    // Check if OTP is verified
    const otpRecord = await prisma.otp.findUnique({ where: { email } });
    if (!otpRecord || !otpRecord.verified) {
      return NextResponse.json(
        { error: 'OTP not verified. Please verify your OTP first.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Check if the user exists as an Admin
    let user = await prisma.admin.findUnique({ where: { email } });

    if (user) {
      // Update password for Admin
      await prisma.admin.update({
        where: { email },
        data: { 
          password: hashedPassword, 
          isActive: true, 
          failedLoginAttempts: 0 
        },
      });
    } else {
      // Check if the user exists as an Employee
      user = await prisma.employee.findUnique({ where: { email } });

      if (user) {
        // Update password for Employee
        await prisma.employee.update({
          where: { email },
          data: { 
            password: hashedPassword, 
            isActive: true, 
            failedLoginAttempts: 0 
          },
        });
      } else {
        // If no user is found
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    }

    // Delete the OTP record after successful password reset
    await prisma.otp.delete({ where: { email } });

    return NextResponse.json(
      { message: 'Password updated successfully' , auth : true},
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}