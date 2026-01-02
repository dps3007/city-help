import nodemailer from "nodemailer";
import Mailgen from "mailgen";

const transporter = nodemailer.createTransport({
  
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "CityHelp",
    link: process.env.FRONTEND_URL || "https://cityhelp.gov.in",  
  },
});

export const sendEmail = async ({ email, subject, mailgenContent }) => {
  const html = mailGenerator.generate(mailgenContent);
  const text = mailGenerator.generatePlaintext(mailgenContent);

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    html,
    text,
  });
};

export const emailVerificationMailgenContent = (username, link) => ({
  body: {
    name: username,
    intro: "Welcome to CityHelp! Please verify your email.",
    action: {
      instructions: "Click the button below:",
      button: {
        color: "#22BC66",
        text: "Verify Email",
        link,
      },
    },
    outro: "If you didn’t create this account, ignore this email.",
  },
});
