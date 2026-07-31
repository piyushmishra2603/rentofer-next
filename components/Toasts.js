const ICONS = { success: "✅", error: "❌", warning: "⚠️", info: "ℹ️" };

export default function Toasts({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type || ""}`}>
          <span style={{ fontSize: 16 }}>{ICONS[t.type] || ICONS.info}</span>
          <div>
            <div className="toast-title">{t.title}</div>
            <div className="toast-msg">{t.msg}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
