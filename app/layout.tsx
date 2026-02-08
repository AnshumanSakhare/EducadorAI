import type { Metadata } from "next";
import { Source_Sans_3 as FontSans } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/common/header";
import Footer from "@/components/ui/common/footer";
import { ClerkProvider } from "@clerk/nextjs";
import BgGradient from "@/components/ui/common/bg-gradient";


const fontSans = FontSans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});


export const metadata: Metadata = {
  title: "educadorai",
  description: "educadorai is a platform for learning and teaching",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="light">
        <body
          className={`${fontSans.variable} font-sans antialiased page-fade-in`}
        >
          <div className="relative flex flex-col min-h-screen page-fade-in">
            <BgGradient />
            <Header />
            <main className="flex-1 page-fade-in">{children}</main>
            <Footer />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
