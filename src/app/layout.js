import BottomNav from "@/components/BottomNav";

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
          }
          a:visited {
            color: inherit;
          }
        `}</style>

        {children}
        <BottomNav />
      </body>
    </html>
  );
}


