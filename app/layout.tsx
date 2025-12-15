import type { Metadata } from "next";
import "./globals.css";
import "./webflow-styles.css";

export const metadata: Metadata = {
  title: "Our Stories - Petite Geneve",
  description: "Discover the latest news, events, and stories from the world of luxury jewelry",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.webflow.com" />
        <link rel="stylesheet" href="https://cdn.prod.website-files.com/636a16f770681aa10bfb0cbc/css/petite-geneve.webflow.shared.a9f51d34d.min.css" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
