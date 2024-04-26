import { Inter } from "next/font/google";
import { useEffect } from "react";
import { getCookie, getCookies } from "cookies-next";
import { GetServerSideProps } from "next";
import { AuthLib } from "@/lib/auth";
import { OPERATOR_SESSION_COOKIE_NAME } from "@/constants";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  useEffect(() => {
    console.log({ client: getCookies() });
  }, []);
  return <h1>Operator root</h1>;
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const sessionCookie = getCookie(OPERATOR_SESSION_COOKIE_NAME, { req })!;
  const sessionData = AuthLib.getSessionData(sessionCookie);
  console.log({ server: sessionData });

  return {
    props: {},
  };
};
