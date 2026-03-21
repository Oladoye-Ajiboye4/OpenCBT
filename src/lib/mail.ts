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
