import axios from "axios";
import Mailgen from "mailgen";

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "CityHelp",
    link: process.env.CLIENT_URL || "https://city-help-ecru.vercel.app",
  },
});

export const sendEmail = async ({ email, subject, mailgenContent }) => {
  try {
    const html = mailGenerator.generate(mailgenContent);

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "CityHelp",
          email: process.env.EMAIL_FROM,
        },
        to: [{ email }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log("📧 Email sent to:", email);
  } catch (err) {
    console.error("❌ EMAIL SEND FAILED:", err.response?.data || err.message);
    throw err;
  }
};
