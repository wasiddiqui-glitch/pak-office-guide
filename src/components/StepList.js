import { colors, type, space } from "@/lib/ui";

// Numbered steps, shared by the guide and embassy pages. Each item can be a
// plain string, or {title, body} for guides that name each step.
export default function StepList({ steps }) {
  return (
    <div style={{ display: "grid", gap: space.md }}>
      {steps.map((step, i) => {
        const hasTitle = typeof step === "object" && step !== null;
        return (
          <div key={i} style={{ display: "flex", gap: space.md }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: colors.green,
                color: "white",
                fontWeight: 800,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              {i + 1}
            </div>
            <div style={{ paddingTop: hasTitle ? 0 : 4 }}>
              {hasTitle && (
                <div style={{ ...type.h3, color: colors.text, marginBottom: 4 }}>{step.title}</div>
              )}
              <div style={type.body}>{hasTitle ? step.body : step}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
