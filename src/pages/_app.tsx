import { Header } from "@/components/header";
import "@/styles/globals.css"
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
}
