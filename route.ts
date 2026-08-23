import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export async function POST(request: Request) {
  try {
    const { email, name, contractId } = await request.json();

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_mock_key') {
      console.log('--- EMAIL SEND SIMULATED ---');
      console.log(`To: ${email}`);
      console.log(`Subject: Your Affiliate Contract - Funded Cobra (${contractId})`);
      console.log('Provide a valid RESEND_API_KEY in .env.local to send actual emails.');
      console.log('----------------------------');
      await new Promise(r => setTimeout(r, 1500)); // Simulate network latency
      return NextResponse.json({ success: true, mocked: true, message: 'Simulated email sent (Missing API Key)' });
    }

    const { data, error } = await resend.emails.send({
      from: 'Funded Cobra <contracts@fundedcobra.com>',
      to: [email],
      subject: `Your Affiliate Contract - Funded Cobra (${contractId})`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0B0614; color: #F8F5FF; padding: 40px; border-radius: 12px; border: 1px solid #2E1A4D;">
          <h1 style="color: #7C3AED; margin-bottom: 24px;">Welcome to Funded Cobra, ${name}!</h1>
          <p style="color: #C4B5FD; font-size: 16px; line-height: 1.6;">Your official Affiliate Partnership Agreement has been successfully generated.</p>
          <p style="color: #C4B5FD; font-size: 16px; line-height: 1.6;">Contract ID: <strong>${contractId}</strong></p>
          <hr style="border-color: #2E1A4D; margin: 24px 0;" />
          <p style="color: #C4B5FD; font-size: 14px;">This is an automated message from the Cobra Vault system.</p>
        </div>
      `
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
