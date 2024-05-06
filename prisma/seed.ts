import { faker } from "@faker-js/faker";
import { $Enums, PrismaClient, Seat, Trip } from "@prisma/client";
import bcrypt from "bcryptjs";
import moment from "moment";

const operatorId = "abcdefghijklmnop";
const consumerId = "qrstuvwxyzaabbccd";
const prisma = new PrismaClient();
async function main() {
  await init();
  await generateTrips(20, operatorId, "past", "LAUNCHED");
  await generateTrips(5, operatorId, "future", "IDLE");
  await generateTrips(5, operatorId, "future", "LAUNCHED");
  await generateOperators(3);
  await generateConsumers(10);
  const tripList = await prisma.trip.findMany({ where: { operatorId } });
  tripList.forEach(async (trip) => {
    await makeBooking(consumerId, trip.id);
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

async function init() {
  const passwd = await bcrypt.hash("password", 10);
  await prisma.settings.create({
    data: {
      commissionRate: 0.05,
      taxRate: 0.1,
      refundTimeFrame: 12 * 60,
      tocFile: "toc.html",
      policyFile: "pp.html",
    },
  });
  await prisma.credential.create({
    data: { uname: "admin", passwd, userType: $Enums.UserType.ADMIN },
  });
  await prisma.operator.create({
    data: {
      id: operatorId,
      name: "Foo Operator",
      registrationEmail: "operator@foo.mm",
      Credential: {
        create: {
          uname: "operator",
          passwd: passwd,
          userType: $Enums.UserType.OPERATOR,
        },
      },
    },
  });
  await prisma.consumer.create({
    data: {
      id: consumerId,
      name: "John Doe",
      dob: moment().subtract(24, "years").toDate(),
      gender: "male",
      phone: "1234567890",
      Credential: {
        create: {
          email: "consumer@foo.mm",
          passwd,
          userType: $Enums.UserType.CONSUMER,
        },
      },
    },
  });
}

async function generateConsumers(count: number) {
  for (let i = 0; i < count; i++) {
    const person = faker.person;
    const fullName = person.fullName() + 1;
    const hashedPasswd = await bcrypt.hash(faker.internet.password(), 10);
    await prisma.consumer.create({
      data: {
        name: fullName,
        dob: faker.date.birthdate({ min: 18, max: 80, mode: "age" }),
        gender: person.sex(),
        phone: faker.phone.number(),
        Credential: {
          create: {
            email: faker.internet.email({ firstName: fullName }),
            passwd: hashedPasswd,
            userType: $Enums.UserType.CONSUMER,
            createdAt: faker.date.past(),
          },
        },
      },
    });
  }
}

async function generateOperators(count: number) {
  for (let i = 0; i < count; i++) {
    const companyName = faker.company.name() + i;
    const hashedPasswd = await bcrypt.hash(faker.internet.password(), 10);
    await prisma.operator.create({
      data: {
        name: companyName,
        registrationEmail: faker.internet.email({ firstName: companyName }),
        Credential: {
          create: {
            uname: faker.internet.userName({ firstName: companyName }),
            passwd: hashedPasswd,
            userType: $Enums.UserType.OPERATOR,
            createdAt: faker.date.past(),
          },
        },
      },
    });
  }
}

async function generateTrips(
  count: number,
  operatorId: string,
  type: "past" | "future",
  status: $Enums.TripStatus
) {
  for (let i = 0; i < count; i++) {
    const maxSeatLength = faker.number.int({ min: 10, max: 24 });
    let depDate = faker.date.soon({ days: 7 });
    if (type === "past") {
      depDate = faker.date.past();
    }
    const arrDate = moment(depDate).add(
      faker.number.int({ min: 6, max: 12 }),
      "hours"
    );
    await prisma.trip.create({
      data: {
        name: faker.lorem.word(),
        departureLocation: faker.helpers.arrayElement(cities),
        distance: faker.number.float({ min: 100, max: 500 }),
        amenities: faker.helpers.arrayElements(amenities, { min: 3, max: 6 }),
        departureTime: depDate,
        arrivalLocation: faker.helpers.arrayElement(cities),
        arrivalTime: arrDate.toDate(),
        price: faker.finance.amount({ min: 10000, max: 50000 }),
        operatorId: operatorId,
        status: status,
        Seats: {
          createMany: {
            data: Array.from({ length: maxSeatLength }, (_, i) => ({
              number: faker.random
                .alpha({ count: 1, casing: "upper" })
                .concat((i + 1).toString()),
              location: faker.helpers.arrayElements(seatLocList, {
                min: 1,
                max: 1,
              }),
            })),
          },
        },
      },
    });
  }
}

async function makeBooking(consumerId: string, tripId: string) {
  const seat = await prisma.seat.findFirstOrThrow({
    where: { tripId: tripId, status: $Enums.SeatStatus.FREE },
    take: 1,
  });
  const booking = await prisma.booking.create({
    data: {
      isCanceled: !faker.datatype.boolean(0.8),
      taxRate: 0.1,
      commissionRate: 0.05,
      totalAmount: faker.finance.amount({ min: 10000, max: 100000 }),
      consumerId: consumerId,
      bookedAt: faker.date.past(),
    },
  });
  await prisma.bookedSeat.create({
    data: { bookingId: booking.id, seatId: seat.id },
  });
  await prisma.seat.update({
    where: { id: seat.id },
    data: { status: $Enums.SeatStatus.BOOKED },
  });
}

const amenities: string[] = [
  "Comfortable seating",
  "Air conditioning/Heating",
  "Wi-Fi",
  "Power outlets",
  "Onboard restroom",
  "Overhead storage",
  "Undercarriage storage",
  "Entertainment systems",
  "Onboard catering",
  "Seatback trays",
  "Reading lights",
  "Wheelchair accessibility",
  "GPS tracking",
  "Blankets and pillows",
  "Security cameras",
  "Friendly staff",
];

const cities: string[] = [
  "Yangon",
  "Mandalay",
  "Naypyidaw",
  "Bagan",
  "Taunggyi",
  "Pyay",
  "Mawlamyine",
  "Sittwe",
  "Pathein",
  "Myeik",
  "Dawei",
  "Hpa-An",
  "Magway",
  "Pakokku",
  "Monywa",
  "Loikaw",
  "Kalay",
  "Meiktila",
  "Thayet",
  "Kyaukse",
  "Sagaing",
  "Mawlamyinegyun",
  "Bogale",
  "Hinthada",
  "Chauk",
  "Lashio",
  "Pyin Oo Lwin",
  "Thanlyin",
  "Thaton",
  "Yenangyaung",
  "Yeoju",
  "Ye",
  "Taungoo",
  "Nyaung-U",
  "Myitkyina",
  "Kyaukpyu",
  "Namtu",
  "Mohnyin",
  "Maubin",
  "Meiktila",
];

const seatLocList: string[] = [
  "Front",
  "Middle",
  "Back",
  "Window",
  "Aisle",
  "Near restroom",
  "Near exit",
  "Upper deck",
  "Lower deck",
];
