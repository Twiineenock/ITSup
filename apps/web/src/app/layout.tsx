import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ITSup | Premium IT Support Marketplace",
  description: "Connect with expert IT officers for hardware, software, and networking services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <script src="https://checkout.flutterwave.com/v3.js" async></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
