import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendLecturerWelcomeEmail = async (
  email: string,
  name: string,
  staffId: string,
  tempPassword: string
) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to OpenCBT</title>
      <style>
        body { font-family: 'Inter', sans-serif; background-color: #F4EFEA; color: #4A3131; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(74, 49, 49, 0.05); }
        .header { text-align: center; margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: 900; color: #4A3131; margin-bottom: 10px; }
        .content { font-size: 16px; line-height: 1.6; color: #5D6065; }
        .credentials-box { background: #F4EFEA; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #E4D4CC; }
        .credential-item { margin-bottom: 12px; }
        .credential-label { font-weight: 700; color: #4A3131; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; }
        .credential-value { font-family: monospace; font-size: 18px; font-weight: bold; color: #4A3131; display: block; margin-top: 4px; }
        .button { display: inline-block; background-color: #4A3131; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; margin-top: 20px; text-align: center; }
        .footer { margin-top: 40px; font-size: 14px; text-align: center; color: #8c8e91; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">Welcome to OpenCBT</h1>
        </div>
        <div class="content">
          <p>Hello ${name || 'Faculty Member'},</p>
          <p>Your lecturer account has been successfully provisioned on the OpenCBT platform. You can now log in to access your assigned courses and manage your assessments.</p>
          
          <div class="credentials-box">
            <div class="credential-item">
              <span class="credential-label">Staff ID</span>
              <span class="credential-value">${staffId}</span>
            </div>
            <div class="credential-item">
              <span class="credential-label">Temporary Password</span>
              <span class="credential-value">${tempPassword}</span>
            </div>
          </div>

          <p>Please log in using your Staff ID and the temporary password provided above. We strongly recommend changing your password immediately after your first login.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://opencbt.vercel.app'}/sign-in" class="button">Log In to OpenCBT</a>
          </div>
        </div>
        <div class="footer">
          <p>If you have any questions or did not request this account, please contact the institution's IT Support.</p>
          <p>&copy; ${new Date().getFullYear()} OpenCBT. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: '"OpenCBT Platform" <' + process.env.SMTP_USER + '>',
      to: email,
      subject: "Your OpenCBT Lecturer Account Access",
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { error: "Failed to send email" };
  }
};

export const sendExamCredentialEmail = async (
  email: string,
  firstName: string,
  examTitle: string,
  pin: string,
  scheduledDate: Date
) => {
  const formattedDate = scheduledDate.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Exam Access PIN - OpenCBT</title>
      <style>
        body { font-family: 'Inter', sans-serif; background-color: #F4EFEA; color: #4A3131; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(74, 49, 49, 0.05); }
        .header { text-align: center; margin-bottom: 30px; }
        .badge { display: inline-block; background: #F4EFEA; color: #4A3131; font-size: 12px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; padding: 6px 14px; border-radius: 99px; border: 1px solid #E4D4CC; margin-bottom: 16px; }
        .title { font-size: 26px; font-weight: 900; color: #4A3131; margin: 0 0 8px; }
        .subtitle { font-size: 16px; color: #5D6065; margin: 0; }
        .content { font-size: 16px; line-height: 1.6; color: #5D6065; }
        .pin-box { background: linear-gradient(135deg, #4A3131, #7a5050); border-radius: 16px; padding: 28px; margin: 28px 0; text-align: center; }
        .pin-label { font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.6); margin-bottom: 12px; }
        .pin-value { font-family: 'Courier New', monospace; font-size: 42px; font-weight: 900; color: #ffffff; letter-spacing: 0.25em; }
        .info-row { display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid #F4EFEA; }
        .info-label { font-weight: 700; color: #4A3131; font-size: 14px; }
        .info-value { color: #5D6065; font-size: 14px; text-align: right; }
        .portal-button { display: block; background-color: #4A3131; color: #ffffff !important; text-decoration: none; padding: 16px 28px; border-radius: 12px; font-weight: 900; font-size: 16px; margin: 28px auto 0; text-align: center; letter-spacing: -0.01em; }
        .warning { background: #FFF8F0; border: 1px solid #FDDCB5; border-radius: 12px; padding: 16px 20px; margin: 24px 0; font-size: 14px; color: #92400e; }
        .footer { margin-top: 40px; font-size: 14px; text-align: center; color: #8c8e91; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="badge">🔐 Secure Exam Credentials</div>
          <h1 class="title">Your Exam Access PIN</h1>
          <p class="subtitle">OpenCBT Computer-Based Testing Platform</p>
        </div>
        <div class="content">
          <p>Hello <strong>${firstName}</strong>,</p>
          <p>Your exam access credentials for the upcoming assessment have been generated. Use the PIN below to authenticate on exam day.</p>

          <div class="pin-box">
            <div class="pin-label">Your Secure Access PIN</div>
            <div class="pin-value">${pin}</div>
          </div>

          <div>
            <div class="info-row">
              <span class="info-label">Exam</span>
              <span class="info-value">${examTitle}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Scheduled Date & Time</span>
              <span class="info-value">${formattedDate}</span>
            </div>
          </div>

          <div style="text-align: center; margin-top: 28px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/portal" class="portal-button">Access Examination Portal →</a>
          </div>

          <div class="warning">
            ⚠️ <strong>Keep this PIN confidential.</strong> Do not share it with anyone. This PIN is unique to you and is required to begin your exam. Sharing it may result in disciplinary action.
          </div>
        </div>
        <div class="footer">
          <p>This is an automated message from the OpenCBT examination system. Do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} OpenCBT. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: '"OpenCBT Exams" <' + process.env.SMTP_USER + '>',
      to: email,
      subject: `🔐 Your Exam PIN for: ${examTitle}`,
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send exam credential email:", error);
    return { error: "Failed to send email" };
  }
};
