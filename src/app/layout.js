import BottomNav from "@/components/BottomNav";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata = {
  title: {
    default: "Pakistan Office Guide",
    template: "%s | Pakistan Office Guide",
  },
  description: "Requirements, steps, fees & hours for government offices in Pakistan. Find NADRA, Passport, Driving License, Utilities and more.",
  metadataBase: new URL("https://pk-office-guide.vercel.app"),
  openGraph: {
    siteName: "Pakistan Office Guide",
    type: "website",
    locale: "en_PK",
  },
  twitter: {
    card: "summary",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
    other: [
      { rel: "icon", url: "/icons/icon-192.png", sizes: "192x192" },
      { rel: "icon", url: "/icons/icon-512.png", sizes: "512x512" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b6b3a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, color: "#e7ecf5", background: "#0b0f19" }}>
        {/* Global link style reset */}
        <style>{`
  a {
    color: inherit;
    text-decoration: none;
    transition: transform 0.08s ease, background 0.08s ease;
  }
  a:visited {
    color: inherit;
  }
  a:hover {
    transform: translateY(-1px);
  }
  a:active {
    transform: translateY(0);
  }
  


html { scroll-behavior: smooth; }

`}</style>


        {children}
        <BottomNav />
        <Analytics />
      </body>
    </html>
  );
}


