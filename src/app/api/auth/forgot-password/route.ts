// src/pages/api/forgot-password.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Check if the user exists as an Admin
    let user = await prisma.admin.findUnique({ where: { email } });
    let userType: 'admin' | 'employee' = 'admin';

    // If not found, check in Employee table
    if (!user) {
      user = await prisma.employee.findUnique({ where: { email } });
      userType = 'employee';
    }

    // If user is still not found, return an error response
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Generate OTP
    const otp_code = Math.floor(100000 + Math.random() * 900000).toString();

    // Upsert OTP in the database
    await prisma.otp.upsert({
      where: { email },
      update: {
        otp_code,
        expires_at: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiration
      },
      create: {
        otp_code,
        email,
        admin_id: userType === 'admin' ? user.id : undefined, // Use undefined instead of null
        employee_id: userType === 'employee' ? user.id : undefined, // Use undefined instead of null
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
        created_at: new Date(),
      },
    });

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send OTP via email
    await transporter.sendMail({
      from: `"XY-CRM" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset OTP - XY-CRM',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; line-height: 1.6;">
          <h2 style="color: #0066cc; margin-bottom: 20px;">XY-CRM</h2>
          <p style="font-size: 14px; margin-bottom: 15px;">Dear ${userType === 'admin' ? 'Admin' : 'Employee'},</p>
          <div style="font-size: 16px; font-weight: bold; color: #d9534f; padding: 10px; background-color: #f9f9f9; border-left: 4px solid #0066cc; margin-bottom: 25px;">
            Your OTP for password reset is: <span style="font-family: 'Times New Roman', serif; font-size: 18px;">${otp_code}</span>
          </div>
          <p style="font-size: 12px; color: #555;">This OTP will expire in 5 minutes.</p>
          <p style="font-size: 14px; margin-top: 30px;">Thank you for using <strong>XY-CRM</strong>.</p>
          <p style="font-size: 14px; margin-top: 15px;">Best Regards,<br>Team XY-CRM</p>
        </div>
      `,
    });

    return NextResponse.json({ message: 'OTP sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ message: 'Failed to send OTP' }, { status: 500 });
  }
}
