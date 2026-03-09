import BottomNav from "@/components/BottomNav";
import "./globals.css";

export const metadata = {
  title: "Pakistan Office Guide",
  description: "Requirements & steps for government offices in Pakistan.",
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
      </body>
    </html>
  );
}


