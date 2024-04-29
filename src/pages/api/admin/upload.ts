import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { isString } from "util";
import fs from "fs";
export const config = {
  api: {
    bodyParser: false,
  },
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const name = req.query.name;
  if (!isString(name)) return res.status(400).end();

  try {
    const uploadDir = "./public/uploads";
    // fs.unlink(uploadDir.concat(name, ".", ext), (err: any) => {
    //   if (err) {
    //     console.error("Error deleting file:", err);
    //   } else {
    //     console.log("File deleted successfully");
    //   }
    // });
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      filename() {
        return name.concat(".html");
      },
    });
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(500).end();
      console.log(files);
    });
  } catch (error) {
    console.error(error);
    return res.status(500).end();
  }
  res.status(200).end();
}
