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
  /* Page fade-in animation */
@keyframes pageFadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-transition {
  animation: pageFadeIn 0.2s ease-out;
}

html { scroll-behavior: smooth; }

`}</style>


        {children}
        <BottomNav />
      </body>
    </html>
  );
}


