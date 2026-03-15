import { TanstackQueryProvider } from "../../provider/tanstack-query";
import { Geist, Geist_Mono } from "next/font/google";
import "../../styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <main>
          <TanstackQueryProvider>
            <div className="min-w-screen min-h-screen flex flex-col items-center justify-center">
              {children}
            </div>
          </TanstackQueryProvider>
        </main>
      </body>
    </html>
  );
}
