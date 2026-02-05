import axios from "axios";
import Mailgen from "mailgen";

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "CityHelp",
    link: process.env.CLIENT_URL,
  },
});

export const sendEmail = async ({ email, subject, mailgenContent }) => {
  const html = mailGenerator.generate(mailgenContent);

  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          email: process.env.EMAIL_FROM,
          name: "CityHelp",
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
      }
    );

    console.log("📧 Email sent to:", email);
  } catch (err) {
    console.error("❌ EMAIL SEND FAILED:", err.response?.data || err.message);
    throw err;
  }
};
