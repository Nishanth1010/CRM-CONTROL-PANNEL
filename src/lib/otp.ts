import nodemailer from 'nodemailer';
import twilio, { Twilio } from 'twilio';

// Load environment variables (ensure your .env file is properly configured)
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER || 'noreply.xyloinc@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'cmxtfrisnkzdhsnu';

const accountSid: string = process.env.TWILIO_ACCOUNT_SID as string;
const authToken: string = process.env.TWILIO_AUTH_TOKEN as string;
const twilioPhoneNumber: string = process.env.TWILIO_PHONE_NUMBER as string;

const client: Twilio = twilio(accountSid, authToken);

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTP(mobile: string, otp: string): Promise<string> {
  try {
    const message = await client.messages.create({
      body: `Your verification code is ${otp}`,
      from: twilioPhoneNumber,
      to: mobile,
    });

    return message.sid;
  } catch (error) {
    throw new Error('Failed to send OTP');
  }
}

export async function sendOTPEmail(email: string, otp: string) {
  try {
    // Create a transporter object using the SMTP transport
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: false, // true for 465, false for other ports (like 587)
      auth: {
        user: SMTP_USER, // Your SMTP username (email)
        pass: SMTP_PASS, // Your SMTP password (app-specific password if using Gmail)
      },
    });

    // Prepare email options with enhanced styling
    const mailOptions = {
      from: `"BNI SA" <${SMTP_USER}>`, // Sender address
      to: email, // List of receivers
      subject: 'Your BNI SA OTP Code', // Subject line
      text: `Your One Time Password (OTP) is: ${otp}`, // Plain text body
      html: `
       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f0f4f8, #d9e2ec); border-radius: 12px; border: 1px solid #d3dce6; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);">
  <div style="text-align: center; padding: 10px 0;">
    <h2 style="color: #2e86de; font-size: 28px; font-weight: bold; letter-spacing: 1px; margin-bottom: 5px;">BNI SA</h2>
    <p style="font-size: 18px; color: #4a4a4a; margin-top: 0;">Secure OTP Verification</p>
  </div>
  <div style="padding: 20px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
    <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Hello,</p>
    <p style="font-size: 16px; color: #555;">We received a request to verify your email for <strong>BNI SA</strong>. Please use the following OTP to complete your verification:</p>
    <div style="text-align: center; padding: 30px 0;">
      <p style="font-size: 32px; font-weight: bold; color: #2e86de; letter-spacing: 6px; background: #f1f9ff; padding: 15px; border-radius: 10px; display: inline-block; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">${otp}</p>
    </div>
    <p style="font-size: 16px; color: #555;">This OTP is valid for 5 minutes. Please do not share this code with anyone.</p>
  </div>
  <div style="text-align: center; padding-top: 20px;">
    <p style="font-size: 14px; color: #888; margin-bottom: 10px;">If you did not request this OTP, please ignore this email.</p>
    <p style="font-size: 14px; color: #888;">&copy; ${new Date().getFullYear()} BNI SA. All rights reserved.</p>
  </div>
</div>

      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    return true;
  } catch (error) {
    return false;
  }
}
