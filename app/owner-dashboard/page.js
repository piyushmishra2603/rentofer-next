"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import "./page.css";

const ADMIN_EMAIL = "piyushmishra1903@gmail.com";

/* ── helpers ── */
const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

function toDate(ts) {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate();
  if (ts.seconds) return new Date(ts.seconds * 1000);
  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
}
function fmtDate(ts) {
  const d = toDate(ts);
  return d
    ? d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";
}
function waLink(phone, text) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) digits = "91" + digits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text || "")}`;
}
const initials = (name) =>
  (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

export default function OwnerDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(undefined); // undefined = checking, null = signed out
  const [profile, setProfile] = useState(null);
  const [props, setProps] = useState([]);
  const [enquiries, setEnquiries] = useState([]);

  const [section, setSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [editing, setEditing] = useState(null); // property being edited
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null); // property pending delete confirmation

  const [enqFilter, setEnqFilter] = useState("all");
  const [profForm, setProfForm] = useState({ name: "", phone: "", city: "" });

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  /* ── auth guard ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setUser(null);
        router.push("/login");
        return;
      }
      setUser(u);
    });
    return () => unsub();
  }, [router]);

  /* ── live data ── */
  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    const unsubProps = onSnapshot(
      query(collection(db, "properties"), where("ownerUid", "==", uid)),
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        rows.sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));
        setProps(rows);
      },
      (err) => console.error("properties listener:", err)
    );

    const unsubEnq = onSnapshot(
      query(collection(db, "enquiries"), where("ownerUid", "==", uid)),
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        rows.sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));
        setEnquiries(rows);
      },
      (err) => console.error("enquiries listener:", err)
    );

    const unsubProfile = onSnapshot(
      doc(db, "users", uid),
      (snap) => {
        const data = snap.exists() ? snap.data() : {};
        setProfile(data);
        setProfForm({
          name: data.name || user.displayName || "",
          phone: data.phone || "",
          city: data.city || "",
        });
      },
      (err) => console.error("profile listener:", err)
    );

    return () => {
      unsubProps();
      unsubEnq();
      unsubProfile();
    };
  }, [user]);

  /* ── derived numbers ── */
  const enqByProp = useMemo(() => {
    const m = {};
    enquiries.forEach((e) => {
      m[e.propertyId] = (m[e.propertyId] || 0) + 1;
    });
    return m;
  }, [enquiries]);

  const stats = useMemo(() => {
    const live = props.filter((p) => p.approved).length;
    const views = props.reduce((s, p) => s + (p.views || 0), 0);
    const newEnq = enquiries.filter((e) => (e.status || "new") === "new").length;
    const weekAgo = Date.now() - 7 * 86400000;
    const thisWeek = enquiries.filter((e) => (toDate(e.createdAt)?.getTime() || 0) > weekAgo).length;
    const uniquePeople = new Set(enquiries.map((e) => (e.phone || e.name || "").replace(/\D/g, "") || e.name)).size;
    return { total: props.length, live, pending: props.length - live, views, totalEnq: enquiries.length, newEnq, thisWeek, uniquePeople };
  }, [props, enquiries]);

  const visibleEnq = useMemo(
    () => (enqFilter === "all" ? enquiries : enquiries.filter((e) => e.propertyId === enqFilter)),
    [enquiries, enqFilter]
  );

  /* ── actions ── */
  function go(id) {
    setSection(id);
    setSidebarOpen(false);
    window.scrollTo({ top: 0 });
  }

  function openEdit(p) {
    setEditing(p);
    setForm({
      title: p.title || "",
      price: p.price ?? "",
      deposit: p.deposit ?? "",
      availableFrom: p.availableFrom || "",
      description: p.description || "",
      phone: p.owner?.phone || "",
      whatsapp: p.owner?.whatsapp || "",
    });
  }

  async function saveEdit() {
    if (!editing) return;
    if ((form.title || "").trim().length < 10) return showToast("⚠️ Title must be at least 10 characters");
    if (!form.price || Number(form.price) < 1000) return showToast("⚠️ Enter a valid monthly rent (min ₹1,000)");
    setSaving(true);
    try {
      await updateDoc(doc(db, "properties", editing.id), {
        title: form.title.trim(),
        price: Number(form.price),
        deposit: form.deposit ? Number(form.deposit) : null,
        availableFrom: form.availableFrom || null,
        description: (form.description || "").trim(),
        "owner.phone": (form.phone || "").trim(),
        "owner.whatsapp": (form.whatsapp || form.phone || "").trim(),
        updatedAt: serverTimestamp(),
      });
      showToast("✅ Property updated");
      setEditing(null);
    } catch (e) {
      console.error(e);
      showToast("⚠️ Could not save changes. Please try again.");
    }
    setSaving(false);
  }

  async function confirmDelete() {
    if (!deleting) return;
    try {
      await deleteDoc(doc(db, "properties", deleting.id));
      showToast("🗑️ Property removed");
    } catch (e) {
      console.error(e);
      showToast("⚠️ Could not delete. Please try again.");
    }
    setDeleting(null);
  }

  async function markContacted(e) {
    try {
      await updateDoc(doc(db, "enquiries", e.id), { status: "contacted" });
    } catch (err) {
      console.error(err);
      showToast("⚠️ Could not update status");
    }
  }

  async function saveProfile() {
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { name: profForm.name.trim(), phone: profForm.phone.trim(), city: profForm.city.trim(), email: user.email, updatedAt: serverTimestamp() },
        { merge: true }
      );
      showToast("✅ Profile saved");
    } catch (e) {
      console.error(e);
      showToast("⚠️ Could not save profile");
    }
  }

  async function logout() {
    await signOut(auth);
    router.push("/login");
  }

  /* ── loading ── */
  if (!user) {
    return (
      <div className="owner-dashboard-page" data-theme="light" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text3)", fontSize: 14 }}>Loading your dashboard…</div>
      </div>
    );
  }

  const displayName = profile?.name || user.displayName || (user.email ? user.email.split("@")[0] : "Owner");
  const avatar = profile?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1a56db&color=fff&size=80`;
  const titles = { overview: "Overview", properties: "My Properties", enquiries: "People Who Contacted You", profile: "My Profile" };

  /* ── render ── */
  return (
    <div className="owner-dashboard-page" data-theme="light">
      {/* SIDEBAR */}
      <nav className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">S</div>
          <div>
            <div className="logo-text">Smart<span>Rent</span></div>
            <div className="logo-sub">Owner Dashboard</div>
          </div>
        </div>

        <div className="sidebar-user" onClick={() => go("profile")}>
          <img src={avatar} className="sidebar-avatar" alt="" />
          <div>
            <div className="sidebar-user-name">{displayName}</div>
            <div className="sidebar-user-plan">{user.email}</div>
          </div>
        </div>

        <div className="sidebar-section-label">Manage</div>
        <a className={`nav-item ${section === "overview" ? "active" : ""}`} onClick={() => go("overview")}>
          <div className="nav-icon">🏠</div> Overview
        </a>
        <a className={`nav-item ${section === "properties" ? "active" : ""}`} onClick={() => go("properties")}>
          <div className="nav-icon">🏢</div> My Properties
          {props.length > 0 && <span className="nav-badge" style={{ background: "var(--blue2)" }}>{props.length}</span>}
        </a>
        <a className={`nav-item ${section === "enquiries" ? "active" : ""}`} onClick={() => go("enquiries")}>
          <div className="nav-icon">📬</div> Who Contacted Me
          {stats.newEnq > 0 && <span className="nav-badge">{stats.newEnq}</span>}
        </a>
        <a className={`nav-item ${section === "profile" ? "active" : ""}`} onClick={() => go("profile")}>
          <div className="nav-icon">👤</div> My Profile
        </a>

        <div className="sidebar-section-label">Quick Links</div>
        <Link className="nav-item" href="/post-property"><div className="nav-icon">➕</div> Post a Property</Link>
        <Link className="nav-item" href="/properties"><div className="nav-icon">🔍</div> Browse Listings</Link>
        <Link className="nav-item" href="/"><div className="nav-icon">🌐</div> Home</Link>
        {user.email === ADMIN_EMAIL && (
          <Link className="nav-item" href="/admin"><div className="nav-icon">🛡️</div> Admin Panel</Link>
        )}

        <div className="sidebar-bottom">
          <button className="btn btn-secondary" style={{ width: "100%" }} onClick={logout}>🚪 Sign Out</button>
        </div>
      </nav>
      <div className={`overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* MAIN */}
      <div className="main">
        <div className="topbar">
          <button className="topbar-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="topbar-title">{titles[section]}</div>
          <Link className="btn btn-primary btn-sm" href="/post-property">+ Post Property</Link>
          <img src={avatar} className="topbar-avatar" alt="" onClick={() => go("profile")} />
        </div>

        <div className="content">
          {/* ───────── OVERVIEW ───────── */}
          {section === "overview" && (
            <div className="section active">
              <div className="section-title">Hi, {displayName.split(" ")[0]} 👋 <span>Everything updates live</span></div>

              <div className="grid-4" style={{ marginBottom: 20 }}>
                <div className="stat-card"><div className="stat-icon" style={{ background: "var(--blue5)", color: "var(--blue2)" }}>🏢</div><div className="stat-value">{stats.total}</div><div className="stat-label">Properties Posted</div></div>
                <div className="stat-card"><div className="stat-icon" style={{ background: "var(--green2)", color: "var(--green)" }}>✅</div><div className="stat-value">{stats.live}</div><div className="stat-label">Live Listings</div><div className="stat-change" style={{ color: "var(--text3)" }}>{stats.pending} awaiting review</div></div>
                <div className="stat-card"><div className="stat-icon" style={{ background: "var(--gold2)", color: "var(--gold)" }}>👁️</div><div className="stat-value">{stats.views.toLocaleString("en-IN")}</div><div className="stat-label">Total Views</div></div>
                <div className="stat-card"><div className="stat-icon" style={{ background: "var(--purple2)", color: "var(--purple)" }}>📬</div><div className="stat-value">{stats.totalEnq}</div><div className="stat-label">People Contacted You</div><div className="stat-change stat-up">{stats.thisWeek} in the last 7 days</div></div>
              </div>

              <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                <div className="section-header">
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Latest People Who Contacted You {stats.newEnq > 0 && <span className="badge badge-red" style={{ marginLeft: 8 }}>{stats.newEnq} new</span>}</div>
                  <button className="btn btn-secondary btn-sm" onClick={() => go("enquiries")}>View all</button>
                </div>
                {enquiries.length === 0 ? (
                  <div className="empty-state"><div className="empty-state-icon">📭</div><div className="empty-state-text">No enquiries yet</div><div style={{ fontSize: 13 }}>When someone sends an enquiry on one of your listings, they will show up here.</div></div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Name</th><th>Phone</th><th>Property</th><th>When</th></tr></thead>
                      <tbody>
                        {enquiries.slice(0, 5).map((e) => (
                          <tr key={e.id}>
                            <td><b>{e.name || "—"}</b></td>
                            <td>{e.phone ? <a href={`tel:${e.phone}`} style={{ color: "var(--blue2)" }}>{e.phone}</a> : "—"}</td>
                            <td>{e.propertyTitle || "—"}</td>
                            <td style={{ whiteSpace: "nowrap" }}>{fmtDate(e.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {props.length > 0 && (
                <div className="card" style={{ padding: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Views &amp; Enquiries by Property</div>
                  {props.map((p) => {
                    const max = Math.max(...props.map((x) => x.views || 0), 1);
                    return (
                      <div key={p.id} style={{ marginBottom: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, gap: 10 }}>
                          <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
                          <span style={{ color: "var(--text3)", whiteSpace: "nowrap" }}>👁 {p.views || 0} · 📬 {enqByProp[p.id] || 0}</span>
                        </div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${((p.views || 0) / max) * 100}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ───────── MY PROPERTIES ───────── */}
          {section === "properties" && (
            <div className="section active">
              <div className="section-title">My Properties <span>{props.length} total</span></div>
              {props.length === 0 ? (
                <div className="card" style={{ padding: 10 }}>
                  <div className="empty-state">
                    <div className="empty-state-icon">🏠</div>
                    <div className="empty-state-text">You haven&apos;t posted any property yet</div>
                    <div style={{ fontSize: 13, marginBottom: 16 }}>Post your first listing — it shows up here as soon as you submit it.</div>
                    <Link className="btn btn-primary" href="/post-property">+ Post a Property</Link>
                  </div>
                </div>
              ) : (
                <div className="grid-auto">
                  {props.map((p) => {
                    const img = p.coverImage || (Array.isArray(p.images) && p.images[0]);
                    return (
                      <div className="property-card" key={p.id}>
                        <div className="prop-img-wrap">
                          {img ? <img src={img} alt={p.title} loading="lazy" /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 54 }}>🏠</div>}
                          <div className="prop-status">
                            {p.approved ? <span className="badge badge-green">Live</span> : <span className="badge badge-orange">Pending review</span>}
                          </div>
                        </div>
                        <div className="prop-body">
                          <div className="prop-title">{p.title || "Untitled property"}</div>
                          <div className="prop-location">📍 {[p.locality, p.city].filter(Boolean).join(", ") || "—"}</div>
                          <div className="prop-price">{inr(p.price)} <span>/ month · {p.bhk || p.type || ""}</span></div>
                          <div className="prop-views">
                            👁️ {p.views || 0} views &nbsp;|&nbsp; 📬 <b>{enqByProp[p.id] || 0}</b> contacted you
                          </div>
                        </div>
                        <div className="prop-actions">
                          <Link className="btn btn-secondary btn-sm" href={`/property-details?id=${p.id}`}>👁 View</Link>
                          <button className="btn btn-primary btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleting(p)}>🗑 Remove</button>
                          {(enqByProp[p.id] || 0) > 0 && (
                            <button className="btn btn-secondary btn-sm" onClick={() => { setEnqFilter(p.id); go("enquiries"); }}>Who contacted?</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ───────── ENQUIRIES ───────── */}
          {section === "enquiries" && (
            <div className="section active">
              <div className="section-title">Who Contacted Me <span>{stats.totalEnq} enquiries · {stats.uniquePeople} people</span></div>

              <div className="filter-bar">
                <span style={{ fontSize: 13, color: "var(--text3)" }}>Show enquiries for:</span>
                <select value={enqFilter} onChange={(e) => setEnqFilter(e.target.value)}>
                  <option value="all">All properties</option>
                  {props.map((p) => (
                    <option key={p.id} value={p.id}>{p.title} ({enqByProp[p.id] || 0})</option>
                  ))}
                </select>
              </div>

              {visibleEnq.length === 0 ? (
                <div className="card" style={{ padding: 10 }}>
                  <div className="empty-state"><div className="empty-state-icon">📭</div><div className="empty-state-text">No one has contacted you yet</div><div style={{ fontSize: 13 }}>Enquiries from your listings will appear here instantly.</div></div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {visibleEnq.map((e) => {
                    const isNew = (e.status || "new") === "new";
                    const wa = waLink(e.phone, `Hi ${e.name || ""}, this is regarding your enquiry for "${e.propertyTitle || "my property"}" on SmartRent.`);
                    return (
                      <div className="lead-card" key={e.id}>
                        <div className="lead-avatar">{initials(e.name)}</div>
                        <div>
                          <div className="lead-name">{e.name || "Unknown"} {isNew && <span className="badge badge-red" style={{ marginLeft: 6 }}>New</span>}</div>
                          <div className="lead-prop">🏢 {e.propertyTitle || "—"}</div>
                          {e.message && <div className="lead-msg">&ldquo;{e.message}&rdquo;</div>}
                          <div className="lead-contact">
                            {e.purpose && <span className="badge badge-blue">{e.purpose}</span>}
                            <span style={{ fontSize: 12, color: "var(--text3)" }}>📱 {e.phone || "—"}</span>
                            {e.email && <span style={{ fontSize: 12, color: "var(--text3)" }}>📧 {e.email}</span>}
                            {e.preferredDate && <span style={{ fontSize: 12, color: "var(--text3)" }}>📅 Move-in: {e.preferredDate}</span>}
                            <span style={{ fontSize: 12, color: "var(--text3)" }}>🕐 {fmtDate(e.createdAt)}</span>
                          </div>
                        </div>
                        <div className="lead-actions">
                          {e.phone && <a className="btn btn-primary btn-sm" href={`tel:${e.phone}`}>📞 Call</a>}
                          {wa && <a className="btn btn-green btn-sm" href={wa} target="_blank" rel="noopener">💬 WhatsApp</a>}
                          {isNew ? (
                            <button className="btn btn-secondary btn-sm" onClick={() => markContacted(e)}>✓ Mark contacted</button>
                          ) : (
                            <span className="badge badge-green">Contacted</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ───────── PROFILE ───────── */}
          {section === "profile" && (
            <div className="section active">
              <div className="section-title">My Profile</div>
              <div className="card" style={{ padding: 22, maxWidth: 520 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                  <img src={avatar} alt="" style={{ width: 64, height: 64, borderRadius: "50%", border: "3px solid var(--blue3)" }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18, fontFamily: "var(--font-display)" }}>{displayName}</div>
                    <div style={{ fontSize: 13, color: "var(--text3)" }}>{user.email}</div>
                  </div>
                </div>
                <div className="od-field"><label>Full name</label><input value={profForm.name} onChange={(e) => setProfForm({ ...profForm, name: e.target.value })} /></div>
                <div className="od-field"><label>Phone number</label><input type="tel" value={profForm.phone} onChange={(e) => setProfForm({ ...profForm, phone: e.target.value })} /></div>
                <div className="od-field"><label>City</label><input value={profForm.city} onChange={(e) => setProfForm({ ...profForm, city: e.target.value })} /></div>
                <div className="od-field"><label>Email (cannot be changed here)</label><input value={user.email || ""} disabled /></div>
                <button className="btn btn-primary" onClick={saveProfile}>Save Changes</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="od-modal-bg" onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div className="od-modal">
            <h3>Edit property</h3>
            <div className="od-field"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={90} /></div>
            <div className="od-row">
              <div className="od-field"><label>Monthly rent (₹)</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div className="od-field"><label>Security deposit (₹)</label><input type="number" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} /></div>
            </div>
            <div className="od-field"><label>Available from</label><input type="date" value={form.availableFrom} onChange={(e) => setForm({ ...form, availableFrom: e.target.value })} /></div>
            <div className="od-row">
              <div className="od-field"><label>Contact phone</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="od-field"><label>WhatsApp number</label><input type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
            </div>
            <div className="od-field"><label>Description</label><textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={800} /></div>
            <div className="od-actions">
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving} onClick={saveEdit}>{saving ? "Saving…" : "Save changes"}</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleting && (
        <div className="od-modal-bg" onClick={(e) => e.target === e.currentTarget && setDeleting(null)}>
          <div className="od-modal" style={{ maxWidth: 400 }}>
            <h3>Remove this property?</h3>
            <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6 }}>
              &ldquo;{deleting.title}&rdquo; will be removed from the site permanently. This can&apos;t be undone.
            </p>
            <div className="od-actions">
              <button className="btn btn-secondary" onClick={() => setDeleting(null)}>Keep it</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Yes, remove</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="toast-container"><div className="toast">{toast}</div></div>
      )}
    </div>
  );
}
