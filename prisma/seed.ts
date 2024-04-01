import { $Enums, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";
import moment from "moment";

const prisma = new PrismaClient();
async function main() {
  const passwd = await bcrypt.hash("sixtyNine69)^", 10);
  const operator = await prisma.operator.create({
    data: {
      name: "Foo Express",
      registrationEmail: "foo@outlook.com",
    },
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

  for (let i = 0; i < 5; i++) {
    await prisma.trip.create({
      data: {
        operatorId: operator.id,
        name: faker.lorem.words({ min: 2, max: 5 }),
        departureLocation: faker.helpers.arrayElement(Cities),
        arrivalLocation: faker.helpers.arrayElement(Cities),
        intermediateStops: faker.helpers.multiple(
          () => faker.lorem.words({ min: 1, max: 2 }),
          {
            count: { min: 4, max: 8 },
          }
        ),
        departureTime: moment().toDate(),
        distance: faker.number.float({ min: 10, max: 100, fractionDigits: 2 }),
        arrivalTime: moment()
          .add(faker.number.int({ min: 4, max: 48 }), "hours")
          .toDate(),
        price: faker.commerce.price({ min: 10000, max: 50000 }),
        amenities: faker.helpers.arrayElements(busAmenities, {
          min: 2,
          max: 5,
        }),
        additional: faker.lorem.lines({ min: 1, max: 5 }),
        seats: {
          createMany: {
            data: faker.helpers.multiple(
              () => ({
                number: `${faker.string.alpha({
                  casing: "upper",
                  length: 1,
                })}${faker.number.int({ min: 1, max: 32 })}`,
                location: faker.helpers.arrayElements(seatLocations, {
                  min: 1,
                  max: 2,
                }),
                features: faker.helpers.arrayElements(seatFeatures, {
                  min: 2,
                  max: 5,
                }),
                additional: faker.lorem.lines({ min: 1, max: 5 }),
              }),
              {
                count: { min: 12, max: 24 },
              }
            ),
          },
        },
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

const Cities: string[] = [
  "Yangon",
  "Mandalay",
  "Naypyidaw",
  "Bago",
  "Mawlamyine",
  "Taunggyi",
  "Pyay",
  "Myitkyina",
  "Magway",
  "Pathein",
];
const busAmenities: string[] = [
  "Wi-Fi",
  "Power outlets/USB ports",
  "On-board entertainment",
  "Restrooms",
  "Refreshments (complimentary or for purchase)",
  "Luggage storage compartments",
  "Safety features (emergency exits, first aid kits)",
  "Air conditioning/Heating",
  "GPS tracking and real-time updates",
  "Comfortable seating",
  "Accessibility features (e.g., wheelchair ramps)",
  "Individual reading lights",
  "Reclining seats",
  "Cup holders",
  "Individual air vents",
];

const seatLocations: string[] = [
  "Front",
  "Middle",
  "Rear",
  "Window",
  "Aisle",
  "Emergency exit row",
  "Near restroom",
];

const seatFeatures: string[] = [
  "Reclining function",
  "Adjustable headrests",
  "Extra legroom",
  "Armrests",
  "Cup holders",
  "Personal tray tables",
  "Individual reading lights",
  "USB charging ports",
  "Power outlets",
  "Privacy curtains",
  "Fold-down tables",
  "Footrests",
  "Seatback pockets",
  "Seatbelt extension",
  "Heated seats",
];
