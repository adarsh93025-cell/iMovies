const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.ethereal.email",
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || "test@example.com",
        pass: process.env.EMAIL_PASS || "password",
      },
    });
  }
  return transporter;
};

const verifyTransport = async () => {
  try {
    const t = getTransporter();
    await t.verify();
    console.log("✅ Email service connected successfully");
    return true;
  } catch (error) {
    console.log("ℹ️ Email service running in simulated/offline mode (SMTP not configured or unreachable)");
    return false;
  }
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const t = getTransporter();
    const info = await t.sendMail({
      from: `"iMovies Ticketing" <${process.env.EMAIL_USER || "no-reply@imovies.com"}>`,
      to,
      subject,
      text: text || html,
      html,
    });
    console.log(`📧 Notification email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.log(`ℹ️ [Email Simulation] Message for ${to}: "${subject}" (Simulated deliver: OK)`);
    return { success: true, simulated: true };
  }
};

module.exports = {
  verifyTransport,
  sendEmail,
  getTransporter,
};
