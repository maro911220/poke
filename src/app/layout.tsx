import "@/style/globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "Maro Poke",
  description: "Maro Poke Page",
  metadataBase: new URL("https://maro-poke.vercel.app"),
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Maro Poke",
    siteName: "Maro Poke",
    url: "https://maro-poke.vercel.app",
    description: "Maro Poke Page",
    images: "/tumb.png",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="main">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
