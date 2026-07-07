import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

export async function sendOtpEmail(email: string, code: string): Promise<boolean> {
  try {
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; background: #0B0F19; color: #F5F7FF; padding: 40px; border-radius: 24px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 32px; font-weight: 700; color: #4F46E5;">FlexiCart</div>
          <div style="font-size: 14px; color: #A7B1C8; margin-top: 4px;">Order Anything. Delivered in Minutes.</div>
        </div>
        <div style="background: #141B2A; border-radius: 16px; padding: 28px; text-align: center; border: 1px solid rgba(79,70,229,0.2);">
          <div style="font-size: 14px; color: #A7B1C8; margin-bottom: 16px;">Your verification code is</div>
          <div style="font-size: 48px; font-weight: 700; letter-spacing: 8px; color: #4F46E5; font-family: 'Space Grotesk', monospace; margin: 16px 0;">${code}</div>
          <div style="font-size: 13px; color: #A7B1C8; margin-top: 16px;">This code expires in 10 minutes.</div>
        </div>
        <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #A7B1C8;">
          If you didn't request this code, you can safely ignore this email.
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"FlexiCart" <${process.env.SMTP_USER || "noreply@flexicart.com"}>`,
      to: email,
      subject: "FlexiCart - Your Verification Code",
      html,
    });

    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return false;
  }
}
