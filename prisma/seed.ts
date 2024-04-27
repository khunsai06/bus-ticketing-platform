import { $Enums, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
async function main() {
  const passwd = await bcrypt.hash("password", 10);
  await prisma.credential.create({
    data: { uname: "admin", passwd, userType: $Enums.UserType.ADMIN },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
