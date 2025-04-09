import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  try {
    const {  newPassword, employeeId, role } = await req.json();

    // Validate inputs
    if ( !newPassword || !employeeId || !role) {
      return NextResponse.json(
        { success: false, message: 'Current password, new password, employee ID, and role are required' },
        { status: 400 }
      );
    }

    // Fetch the user based on role
    let user;
    if (role === 'admin') {
      user = await prisma.admin.findUnique({
        where: { id: parseInt(employeeId, 10) },
      });
    } else {
      user = await prisma.employee.findUnique({
        where: { id: parseInt(employeeId, 10) },
      });
    }

    // If user is not found or unauthorized
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found or unauthorized' }, { status: 404 });
    }

   

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    if (role === 'admin') {
      await prisma.admin.update({
        where: { id: user.id },
        data: { password: hashedNewPassword , isActive : true , failedLoginAttempts: 0 },
      });
    } else {
      await prisma.employee.update({
        where: { id: user.id },
        data: { password: hashedNewPassword , isActive : true , failedLoginAttempts: 0 },
      });
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json({ success: false, message: 'Error updating password' }, { status: 500 });
  }
}
