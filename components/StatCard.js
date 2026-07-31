export default function StatCard({ accent, accentPale, accentSoft, icon, label, value, change, changeClass }) {
  return (
    <div
      className="stat-card"
      style={{ "--card-accent": accent, "--card-accent-pale": accentPale, "--card-accent-soft": accentSoft }}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${changeClass || ""}`} style={changeClass ? undefined : { color: "var(--t3)" }}>
        {change}
      </div>
    </div>
  );
}
