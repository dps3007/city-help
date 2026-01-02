import { Router } from "express";
import { sendEmail } from "../utils/mail.js";

const router = Router();

router.get("/test-email", async (req, res) => {
  await sendEmail({
    email: "your_personal_email@gmail.com",
    subject: "CityHelp Email Test",
    mailgenContent: {
      body: {
        name: "Test User",
        intro: "Email system is working perfectly 🎉",
      },
    },
  });

  res.send("Email sent");
});

export default router;
