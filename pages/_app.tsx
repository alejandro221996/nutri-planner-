import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Navbar from "../components/Navbar";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useEffect(() => {
    if (router.pathname !== "/login") {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("nutri_token")
          : null;
      if (!token) {
        router.replace("/login");
      }
    }
  }, [router]);
  const showNavbar = router.pathname !== "/login";
  return (
    <>
      {showNavbar && <Navbar />}
      <Component {...pageProps} />
    </>
  );
}
