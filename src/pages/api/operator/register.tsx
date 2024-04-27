import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import prisma from "@/lib/prisma-client";
import { isArray, isString } from "util";
import { UtilLib } from "@/lib/util";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const uploadDir = "./public/uploads";
  const form = formidable({ uploadDir, keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).end();
    const fileList = files["files[]"];
    if (!isArray(fileList)) return res.status(500).end();
    const fileNameList = fileList.map(
      (f) => f.originalFilename?.concat(";", f.newFilename)!
    );
    console.log(fileNameList);
    const companyName = fields.companyName![0];
    const companyEmail = fields.companyEmail![0];
    try {
      await prisma.application.create({
        data: { companyName, companyEmail, files: fileNameList },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).end();
    }
    res.status(200).end();
  });
}
