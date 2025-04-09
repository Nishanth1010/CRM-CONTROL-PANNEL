import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, newPassword } = body;

    // Validate input
    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email and newPassword are required' }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Check if the user exists as an Admin
    let user = await prisma.admin.findUnique({
      where: { email },
    });

    if (user) {
      // Update password for Admin
      await prisma.admin.update({
        where: { email },
        data: { password: hashedPassword , isActive : true , failedLoginAttempts: 0 },
      });
      return NextResponse.json({ message: 'Password updated successfully for Admin' }, { status: 200 });
    }

    // Check if the user exists as an Employee
    user = await prisma.employee.findUnique({
      where: { email },
    });

    if (user) {
      // Update password for Employee
      await prisma.employee.update({
        where: { email },
        data: { password: hashedPassword , isActive: true , failedLoginAttempts : 0 },
      });
      return NextResponse.json({ message: 'Password updated successfully for Employee NAme' }, { status: 200 });
    }

    // If no user is found
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json({ error: 'An error occurred while updating password' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }

}
