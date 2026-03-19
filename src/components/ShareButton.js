"use client";

export default function ShareButton({ office, style = {} }) {
  const share = async () => {
    const url = window.location.href;
    const text = [
      office.name,
      office.address,
      office.hours,
    ]
      .filter(Boolean)
      .join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: office.name, text, url });
        return;
      } catch {
        // user cancelled or share failed — fall through to WhatsApp
      }
    }

    // Fallback: open WhatsApp with pre-filled message
    const msg = encodeURIComponent(`${text}\n\n${url}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener,noreferrer");
  };

  return (
    <button onClick={share} style={{ cursor: "pointer", ...style }}>
      📤 Share
    </button>
  );
}
