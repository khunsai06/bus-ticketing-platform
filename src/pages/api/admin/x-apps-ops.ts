import prisma from "@/lib/prisma-client";
import { NextApiRequest, NextApiResponse } from "next";
import { isString } from "util";
import { generateFromEmail } from "unique-username-generator";
import { generate } from "generate-password";
import { $Enums } from "@prisma/client";
import { createTransport } from "nodemailer";
import { AuthLib } from "@/lib/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const appId = req.query.appId;
  const ops = req.query.ops;
  if (!isString(appId) || !isString(ops)) return res.status(400).end();
  try {
    if (ops === "reject") {
      await prisma.application.delete({
        where: { id: appId },
      });
    }
    if (ops === "approve") {
      const app = await prisma.application.findFirstOrThrow({
        where: { id: appId },
      });
      const uname = generateFromEmail(app.companyEmail, 4);
      const passwd = generate({
        length: 12,
        numbers: true,
        excludeSimilarCharacters: true,
        strict: true,
      });
      sendMail(app.companyEmail, uname, passwd);
      const hashedPasswd = await AuthLib.passwdHash(passwd);
      await prisma.operator.create({
        data: {
          name: app.companyName,
          registrationEmail: app.companyEmail,
          Credential: {
            create: {
              uname,
              passwd: hashedPasswd,
              userType: $Enums.UserType.OPERATOR,
            },
          },
        },
      });
      await prisma.application.delete({
        where: { id: appId },
      });
    }
    res.status(200).end();
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
}

function sendMail(to: string, uname: string, passwd: string) {
  const transporter = createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: "khunsai.dev@gmail.com",
      pass: "ubnl oone agmk fsdi",
    },
  });
  const mailOptions = {
    from: "khunsai.dev@gmail.com",
    to,
    subject: "Congratulations! Your Partner Account is Approved",
    html: prepareMail(uname, passwd),
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error occurred:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

function prepareMail(uname: string, passwd: string) {
  return `
    <p>Dear Partner,</p>
    <br>
    <p>We are thrilled to inform you that your registration as a partner/operator on our ticket sales platform has been approved! Welcome aboard!</p>
    <br>
    <p>To access your account, please find your login credentials below:</p>
    <ul>
        <li><strong>Username:</strong> ${uname}</li>
        <li><strong>Password:</strong> ${passwd}</li>
    </ul>
    <br>
    <p>Please ensure to keep your login details secure and do not share them with anyone. You can now log in to our platform and start selling your services to our users.</p>
    <br>
    <p>If you have any questions or need assistance, feel free to contact our support team at [Support Email/Phone Number].</p>
    <br>
    <p>Thank you for choosing to partner with us.</p>
    <br>
    <p>Best regards,<br>[Company Name] Team</p>
    `;
}
