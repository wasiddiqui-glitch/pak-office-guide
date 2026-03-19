"use client";

export default function SuggestCorrectionButton({ office, style = {} }) {
  const suggest = () => {
    const url = window.location.href;
    const body = [
      `Office: ${office.name}`,
      `City: ${office.city}`,
      `Link: ${url}`,
      ``,
      `What needs correcting:`,
      `(describe the issue here)`,
    ].join("\n");

    // Always route directly to the app owner's WhatsApp
    const msg = encodeURIComponent(body);
    window.open(`https://wa.me/14087817478?text=${msg}`, "_blank", "noopener,noreferrer");
  };

  return (
    <button onClick={suggest} style={{ cursor: "pointer", ...style }}>
      ✏️ Suggest correction
    </button>
  );
}
