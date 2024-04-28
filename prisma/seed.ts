import { faker } from "@faker-js/faker";
import { $Enums, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
async function main() {
  const minutes = 12 * 60;
  // const passwd = await bcrypt.hash("password", 10);
  // const setting = await prisma.settings.create({
  //   data: {
  //     commissionRate: 0.05,
  //     taxRate: 0.1,
  //     refundTimeFrame: minutes,
  //     tocFile: "",
  //     policyFile: "",
  //   },
  // });
  // await prisma.credential.create({
  //   data: { uname: "admin", passwd, userType: $Enums.UserType.ADMIN },
  // });

  const consumer = await prisma.consumer.findFirstOrThrow();
  for (let i = 0; i < 100; i++) {
    await prisma.booking.create({
      data: {
        isCanceled: !faker.datatype.boolean(0.8),
        taxRate: 0.1,
        commissionRate: 0.05,
        totalAmount: faker.finance.amount({ min: 10000, max: 100000 }),
        consumerId: consumer.id,
        bookedAt: faker.date.past(),
      },
    });
  }
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
