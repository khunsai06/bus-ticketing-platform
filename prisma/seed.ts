import { $Enums, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
async function main() {
  await prisma.operatorPersonnel.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.operator.deleteMany();
  const passwd = await bcrypt.hash("sixtyNine69)^", 10);
  const operator = await prisma.operator.create({
    data: { name: "foo", registrationEmail: "foo@outlook.com" },
  });
  const credential = await prisma.credential.create({
    data: { uname: "johndoe", passwd, userType: $Enums.UserType.OPERATOR },
  });
  await prisma.operatorPersonnel.create({
    data: {
      cid: credential.id,
      operatorId: operator.id,
    },
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
