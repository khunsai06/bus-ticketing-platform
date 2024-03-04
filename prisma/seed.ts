import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
async function main() {
    await prisma.user.deleteMany();
    const passwd = await bcrypt.hash("qwerqwerQ1!", 10);
    await prisma.user.create({
        data: {
            uname: "johndoe.admin",
            email: "johndoe.admin@example.com",
            passwd,
            role: "ADMIN",
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
