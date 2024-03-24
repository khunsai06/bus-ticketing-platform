import { Inter } from "next/font/google";
import { useEffect } from "react";
import { getCookies } from "cookies-next";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  useEffect(() => {
    console.log(getCookies());
  }, []);
  return <h1>Root</h1>;
}
