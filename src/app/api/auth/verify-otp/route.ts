import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { otp, email } = await req.json();

    // ✅ Validate input
    if (!otp || !email || typeof otp !== 'string' || typeof email !== 'string' ) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }

    console.log(`Checking OTP for email: ${email}`);

    // ✅ Find the latest OTP record for this email
    const otpRecord = await prisma.otp.findFirst({
      where: { email },
      orderBy: { created_at: 'desc' },
    });

    console.log('OTP Record:', otpRecord);

    // ❌ OTP not found
    if (!otpRecord) {
      return NextResponse.json({ message: 'OTP not found' }, { status: 404 });
    }

    // Trim both OTPs before comparison
    const storedOtp = otpRecord.otp_code.trim();
    const inputOtp = otp.trim();

    console.log('Stored OTP:', storedOtp);
    console.log('Input OTP:', inputOtp);

    // ❌ OTP mismatch
    if (storedOtp !== inputOtp) {
      return NextResponse.json({ message: 'Incorrect OTP' }, { status: 400 });
    }

    // ❌ OTP expired
    const now = new Date();
    const expiresAt = new Date(otpRecord.expires_at);

    console.log('Current Time:', now);
    console.log('OTP Expires At:', expiresAt);

    if (now > expiresAt) {
      return NextResponse.json({ message: 'OTP has expired' }, { status: 400 });
    }

    // ✅ Mark OTP as verified
    const updatedOtpRecord = await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    console.log('Updated OTP Record:', updatedOtpRecord);

    console.log('OTP verified successfully');
    return NextResponse.json({ message: 'OTP verified successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ message: 'Error verifying OTP' }, { status: 500 });
  }
}