import nodemailer from "nodemailer";
import { google } from "googleapis";
import Mail from "nodemailer/lib/mailer";
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
  });

  const accessToken = await oauth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    // @ts-expect-error
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_SENDER,
      accessToken,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  });

  return transporter;
};

export const sendEmail = async (emailOptions: Mail.Options) => {
  let emailTransporter = await createTransporter();
  await emailTransporter.sendMail(emailOptions);
};
