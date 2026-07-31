"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Chart, registerables } from "chart.js";
import { db, auth } from "@/lib/firebase";
import StatCard from "@/components/StatCard";
import FilterTabs from "@/components/FilterTabs";
import Toasts from "@/components/Toasts";
import ConfirmModal from "@/components/ConfirmModal";
import "./admin.css";

Chart.register(...registerables);

const ADMIN_EMAIL = "piyushmishra1903@gmail.com";

/* ── shared helpers (ported 1:1 from admin.html) ── */
function isSubLive(s) {
  if (!s) return false;
  if (s.status !== "active" && s.status !== "trial_active") return false;
  const exp = s.trialEndDate || s.expiresAt;
  if (exp) {
    const e = exp.toDate ? exp.toDate() : new Date(exp);
    if (e < new Date()) return false;
  }
  return true;
}
function isServiceActive(s) {
  return s.__src === "services" ? s.status === "active" : s.active === true;
}
function timeAgo(date) {
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export default function AdminPage() {
  const router = useRouter();

  /* ── auth ── */
  const [authReady, setAuthReady] = useState(false);
  const [adminUserEmail, setAdminUserEmail] = useState("");

  /* ── live collections ── */
  const [properties, setProperties] = useState([]);
  const [commercial, setCommercial] = useState([]);
  const [servicesA, setServicesA] = useState([]); // 'services' coll (plumber/electrician)
  const [servicesB, setServicesB] = useState([]); // 'service_providers' coll
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [subs, setSubs] = useState([]);
  const services = useMemo(() => [...servicesA, ...servicesB], [servicesA, servicesB]);

  /* ── ui state ── */
  const [activePage, setActivePage] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState(null);
  const [payDetail, setPayDetail] = useState(null);

  /* ── filters per tab ── */
  const [payFilter, setPayFilter] = useState("all");
  const [subFilter, setSubFilter] = useState("all");
  const [propFilter, setPropFilter] = useState("all");
  const [commFilter, setCommFilter] = useState("all");
  const [svcFilter, setSvcFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  const paymentsRef = useRef(payments);
  paymentsRef.current = payments;

  const addToast = (title, msg, type = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, title, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  /* ═══════════════════════════════════════
     AUTH GUARD
  ═══════════════════════════════════════ */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      if (user.email !== ADMIN_EMAIL) {
        alert("Unauthorized!");
        router.push("/login");
        return;
      }
      setAdminUserEmail(user.email);
      setAuthReady(true);
    });
    return () => unsub();
  }, [router]);

  /* ═══════════════════════════════════════
     LIVE LISTENERS — every collection updates
     the UI the instant Firestore changes
  ═══════════════════════════════════════ */
  useEffect(() => {
    if (!authReady) return;
    const touch = () => setLastUpdated(new Date());

    const unsubs = [
      onSnapshot(collection(db, "properties"), (snap) => {
        setProperties(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        touch();
      }),
      onSnapshot(
        collection(db, "commercialProperties"),
        (snap) => {
          setCommercial(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          touch();
        },
        () => setCommercial([])
      ),
      onSnapshot(
        collection(db, "services"),
        (snap) => {
          setServicesA(snap.docs.map((d) => ({ id: d.id, __src: "services", ...d.data() })));
          touch();
        },
        () => {}
      ),
      onSnapshot(
        collection(db, "service_providers"),
        (snap) => {
          setServicesB(snap.docs.map((d) => ({ id: d.id, __src: "service_providers", ...d.data() })));
          touch();
        },
        () => {}
      ),
      onSnapshot(collection(db, "users"), (snap) => {
        setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        touch();
      }),
      onSnapshot(collection(db, "payments"), (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        rows.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setPayments(rows);
        touch();
      }),
      onSnapshot(
        collection(db, "subscriptions"),
        (snap) => {
          setSubs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          touch();
        },
        () => setSubs([])
      ),
    ];

    return () => unsubs.forEach((u) => u());
  }, [authReady]);

  /* Reminder toast for pending payments every 30s */
  useEffect(() => {
    const t = setInterval(() => {
      const pending = paymentsRef.current.filter((p) => p.paymentStatus === "pending").length;
      if (pending > 0) {
        addToast(
          "Pending Payments",
          `${pending} payment${pending > 1 ? "s" : ""} need${pending === 1 ? "s" : ""} verification`,
          "warning"
        );
      }
    }, 30000);
    return () => clearInterval(t);
  }, []);

  /* ═══════════════════════════════════════
     DERIVED STATS
  ═══════════════════════════════════════ */
  const pendingProps = properties.filter((p) => !p.approved).length;
  const pendingComm = commercial.filter((p) => !p.approved).length;
  const pendingPay = payments.filter((p) => p.paymentStatus === "pending").length;
  const verifiedPay = payments.filter((p) => p.paymentStatus === "verified").length;
  const rejectedPay = payments.filter((p) => p.paymentStatus === "rejected").length;
  const revenue = payments.filter((p) => p.paymentStatus === "verified").reduce((s, p) => s + (p.amount || 0), 0);
  const activeSubs = subs.filter(isSubLive).length;
  const totalListings = properties.length + commercial.length;
  const approvedCount = properties.filter((p) => p.approved).length + commercial.filter((p) => p.approved).length;
  const approvalRate = totalListings ? Math.round((approvedCount / totalListings) * 100) : 0;

  /* ═══════════════════════════════════════
     CHARTS — dashboard + analytics
  ═══════════════════════════════════════ */
  const revenueCanvas = useRef(null);
  const categoryCanvas = useRef(null);
  const payStatusCanvas = useRef(null);
  const anaRevCanvas = useRef(null);
  const anaUsersCanvas = useRef(null);
  const anaPropStatusCanvas = useRef(null);
  const anaPlanRevCanvas = useRef(null);
  const anaCityCanvas = useRef(null);
  const anaPayTlCanvas = useRef(null);
  const chartInstances = useRef({});

  function draw(ref, key, config) {
    if (!ref.current) return;
    if (chartInstances.current[key]) chartInstances.current[key].destroy();
    chartInstances.current[key] = new Chart(ref.current, config);
  }

  useEffect(() => {
    const gc = "rgba(15,23,42,.06)";
    const tc = "#94a3b8";

    const monthsMap = {};
    payments
      .filter((p) => p.paymentStatus === "verified")
      .forEach((p) => {
        if (!p.createdAt) return;
        const m = new Date(p.createdAt).toLocaleString("default", { month: "short" });
        monthsMap[m] = (monthsMap[m] || 0) + (p.amount || 0);
      });
    if (!Object.keys(monthsMap).length) monthsMap["—"] = 0;

    draw(revenueCanvas, "revenue", {
      type: "line",
      data: {
        labels: Object.keys(monthsMap),
        datasets: [
          {
            label: "₹",
            data: Object.values(monthsMap),
            borderColor: "#2563eb",
            backgroundColor: "rgba(37,99,235,.08)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#2563eb",
            pointRadius: 4,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: gc }, ticks: { color: tc, font: { family: "JetBrains Mono", size: 10 } } },
          y: { grid: { color: gc }, ticks: { color: tc, font: { family: "JetBrains Mono", size: 10 } } },
        },
      },
    });

    draw(categoryCanvas, "category", {
      type: "doughnut",
      data: {
        labels: ["Residential", "Commercial", "Services"],
        datasets: [
          {
            data: [properties.length, commercial.length, services.length],
            backgroundColor: ["rgba(37,99,235,.75)", "rgba(124,58,237,.75)", "rgba(8,145,178,.75)"],
            borderWidth: 0,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: "bottom", labels: { color: tc, font: { family: "JetBrains Mono", size: 10 }, padding: 10, boxWidth: 10 } },
        },
        cutout: "62%",
      },
    });

    draw(payStatusCanvas, "payStatus", {
      type: "doughnut",
      data: {
        labels: ["Pending", "Verified", "Rejected"],
        datasets: [
          {
            data: [pendingPay, verifiedPay, rejectedPay],
            backgroundColor: ["rgba(217,119,6,.8)", "rgba(5,150,105,.8)", "rgba(220,38,38,.8)"],
            borderWidth: 0,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: "bottom", labels: { color: tc, font: { family: "JetBrains Mono", size: 10 }, padding: 10, boxWidth: 10 } },
        },
        cutout: "65%",
      },
    });

    draw(anaRevCanvas, "anaRev", {
      type: "bar",
      data: { labels: Object.keys(monthsMap), datasets: [{ label: "₹", data: Object.values(monthsMap), backgroundColor: "rgba(217,119,6,.35)", borderColor: "#d97706", borderWidth: 2, borderRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: gc }, ticks: { color: tc } }, y: { grid: { color: gc }, ticks: { color: tc } } } },
    });

    const planMap = {};
    users.forEach((u) => (planMap[u.plan || "Free"] = (planMap[u.plan || "Free"] || 0) + 1));
    draw(anaUsersCanvas, "anaUsers", {
      type: "bar",
      data: { labels: Object.keys(planMap), datasets: [{ data: Object.values(planMap), backgroundColor: ["rgba(124,58,237,.5)", "rgba(217,119,6,.5)", "rgba(37,99,235,.5)"].slice(0, Object.keys(planMap).length), borderRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: tc } }, y: { grid: { color: gc }, ticks: { color: tc } } } },
    });

    const approved = properties.filter((p) => p.approved).length;
    const pendingP = properties.filter((p) => !p.approved).length;
    draw(anaPropStatusCanvas, "anaPropStatus", {
      type: "pie",
      data: { labels: ["Approved", "Pending"], datasets: [{ data: [approved, pendingP], backgroundColor: ["rgba(5,150,105,.7)", "rgba(217,119,6,.7)"], borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: "bottom", labels: { color: tc, font: { family: "JetBrains Mono", size: 10 } } } } },
    });

    const planRevMap = {};
    payments
      .filter((p) => p.paymentStatus === "verified")
      .forEach((p) => (planRevMap[p.planName || "Unknown"] = (planRevMap[p.planName || "Unknown"] || 0) + (p.amount || 0)));
    draw(anaPlanRevCanvas, "anaPlanRev", {
      type: "bar",
      data: {
        labels: Object.keys(planRevMap).length ? Object.keys(planRevMap) : ["No Data"],
        datasets: [{ data: Object.values(planRevMap).length ? Object.values(planRevMap) : [0], backgroundColor: "rgba(5,150,105,.35)", borderColor: "#059669", borderWidth: 2, borderRadius: 6 }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: tc, font: { size: 9 } } }, y: { grid: { color: gc }, ticks: { color: tc } } } },
    });

    const cityMap = {};
    properties.forEach((p) => (cityMap[p.city || "Unknown"] = (cityMap[p.city || "Unknown"] || 0) + 1));
    draw(anaCityCanvas, "anaCity", {
      type: "bar",
      data: { labels: Object.keys(cityMap), datasets: [{ data: Object.values(cityMap), backgroundColor: "rgba(37,99,235,.5)", borderRadius: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: tc, font: { size: 9 } } }, y: { grid: { color: gc }, ticks: { color: tc } } } },
    });

    const dayMap = {};
    payments.forEach((p) => {
      if (p.createdAt) {
        const d = new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        dayMap[d] = (dayMap[d] || 0) + 1;
      }
    });
    draw(anaPayTlCanvas, "anaPayTl", {
      type: "line",
      data: { labels: Object.keys(dayMap).length ? Object.keys(dayMap) : ["—"], datasets: [{ label: "Payments", data: Object.values(dayMap).length ? Object.values(dayMap) : [0], borderColor: "#7c3aed", backgroundColor: "rgba(124,58,237,.08)", fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: gc }, ticks: { color: tc, font: { size: 10 } } }, y: { grid: { color: gc }, ticks: { color: tc } } } },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties, commercial, services, users, payments]);

  /* ═══════════════════════════════════════
     ACTIVITY FEED (derived, not stored)
  ═══════════════════════════════════════ */
  const activityLog = useMemo(() => {
    const log = [];
    properties.forEach((p) =>
      log.push({
        icon: "🏠",
        text: `Property "${p.title || "Untitled"}" ${p.approved ? "approved" : "submitted"}`,
        time: p.createdAt && p.createdAt.seconds ? new Date(p.createdAt.seconds * 1000) : new Date(0),
        color: p.approved ? "var(--green-pale)" : "var(--gold-pale)",
      })
    );
    commercial.forEach((p) =>
      log.push({
        icon: "🏢",
        text: `Commercial "${p.name || "Untitled"}" ${p.approved ? "approved" : "submitted"}`,
        time: p.createdAt && p.createdAt.seconds ? new Date(p.createdAt.seconds * 1000) : new Date(0),
        color: p.approved ? "var(--green-pale)" : "var(--violet-pale)",
      })
    );
    users.forEach((u) =>
      log.push({
        icon: "👤",
        text: `User "${u.name || u.email || "Unknown"}" registered`,
        time: u.createdAt && u.createdAt.seconds ? new Date(u.createdAt.seconds * 1000) : new Date(0),
        color: "var(--blue-pale)",
      })
    );
    payments.slice(0, 20).forEach((p) =>
      log.push({
        icon: "💳",
        text: `Payment "${p.planName || "—"}" by ${p.userName || p.userEmail || "—"} — ${p.paymentStatus}`,
        time: new Date(p.createdAt || Date.now()),
        color: p.paymentStatus === "verified" ? "var(--green-pale)" : p.paymentStatus === "rejected" ? "var(--red-pale)" : "var(--gold-pale)",
      })
    );
    return log.sort((a, b) => b.time - a.time).slice(0, 50);
  }, [properties, commercial, users, payments]);

  /* ═══════════════════════════════════════
     ACTIONS — Payments
  ═══════════════════════════════════════ */
  async function verifyPayment(p) {
    setConfirmModal({
      title: "Verify Payment?",
      sub: `Activate "${p.planName}" for ${p.userEmail || p.userId}? This will create their subscription and notify them via Firestore.`,
      confirmLabel: "✅ Verify & Activate",
      danger: false,
      onConfirm: async () => {
        try {
          const now = new Date();
          const expiry = p.expiresAt ? new Date(p.expiresAt) : new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

          await updateDoc(doc(db, "payments", p.id), { paymentStatus: "verified", verifiedAt: now.toISOString(), verifiedBy: adminUserEmail });

          if (p.userId && p.userId !== "guest") {
            await setDoc(
              doc(db, "subscriptions", p.userId),
              {
                userId: p.userId,
                userEmail: p.userEmail || "",
                plan: p.planRole || p.planName,
                planName: p.planName,
                planRole: p.planRole,
                planCategory: p.planCategory,
                status: "active",
                activatedAt: now.toISOString(),
                trialEndDate: expiry.toISOString(),
                expiresAt: expiry.toISOString(),
                paymentId: p.id,
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            );
            await updateDoc(doc(db, "users", p.userId), {
              plan: p.planName,
              subscriptionStatus: "active",
              subscriptionExpiry: expiry.toISOString(),
            }).catch(() => {});
          }
          addToast("Payment Verified", `Subscription activated for ${p.userEmail || p.userId}`, "success");
        } catch (err) {
          console.error(err);
          addToast("Error", "Could not verify payment. Check console.", "error");
        }
      },
    });
  }

  function rejectPayment(p) {
    setConfirmModal({
      title: "Reject Payment?",
      sub: `Mark payment from "${p.userName || "Unknown"}" as rejected? The user will be notified via the plans page.`,
      confirmLabel: "❌ Reject",
      danger: true,
      onConfirm: async () => {
        await updateDoc(doc(db, "payments", p.id), { paymentStatus: "rejected", rejectedAt: new Date().toISOString(), rejectedBy: adminUserEmail });
        addToast("Payment Rejected", `Payment from ${p.userName || "Unknown"} has been rejected`, "warning");
      },
    });
  }

  function copyRef(ref) {
    navigator.clipboard.writeText(ref || "").then(() => addToast("Copied", "UTR reference copied", "success"));
  }

  /* ═══════════════════════════════════════
     ACTIONS — Subscriptions
  ═══════════════════════════════════════ */
  function expireSub(uid) {
    setConfirmModal({
      title: "Expire Subscription?",
      sub: `This immediately deactivates the subscription for user ${uid}.`,
      confirmLabel: "Expire Now",
      danger: true,
      onConfirm: async () => {
        await updateDoc(doc(db, "subscriptions", uid), {
          status: "cancelled",
          expiresAt: new Date().toISOString(),
          trialEndDate: new Date().toISOString(),
        });
        addToast("Subscription Expired", `Subscription for ${uid} deactivated`, "warning");
      },
    });
  }

  /* ═══════════════════════════════════════
     ACTIONS — Properties (residential)
  ═══════════════════════════════════════ */
  async function approveProperty(id) {
    await updateDoc(doc(db, "properties", id), { approved: true, status: "active" });
    addToast("Property Approved", "Listing is now live", "success");
  }
  async function revokeProperty(id) {
    await updateDoc(doc(db, "properties", id), { approved: false, status: "pending" });
    addToast("Approval Revoked", "Property moved to pending", "warning");
  }
  function deleteProperty(id, name) {
    setConfirmModal({
      title: "Delete Property?",
      sub: `"${name}" will be permanently deleted.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: async () => {
        await deleteDoc(doc(db, "properties", id));
        addToast("Deleted", `"${name}" removed`, "error");
      },
    });
  }

  /* ═══════════════════════════════════════
     ACTIONS — Commercial
  ═══════════════════════════════════════ */
  async function approveCommercial(id) {
    await updateDoc(doc(db, "commercialProperties", id), { approved: true, verified: true, status: "active", available: true });
    addToast("Commercial Listing Approved", "Now live on the Commercial marketplace", "success");
  }
  async function revokeCommercial(id) {
    await updateDoc(doc(db, "commercialProperties", id), { approved: false, verified: false, status: "pending" });
    addToast("Approval Revoked", "Listing moved to pending", "warning");
  }
  function deleteCommercial(id, name) {
    setConfirmModal({
      title: "Delete Commercial Listing?",
      sub: `"${name}" will be permanently deleted.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: async () => {
        await deleteDoc(doc(db, "commercialProperties", id));
        addToast("Deleted", `"${name}" removed`, "error");
      },
    });
  }

  /* ═══════════════════════════════════════
     ACTIONS — Services
  ═══════════════════════════════════════ */
  async function toggleServiceActive(s) {
    const currentlyActive = isServiceActive(s);
    if (s.__src === "services") await updateDoc(doc(db, "services", s.id), { status: currentlyActive ? "inactive" : "active" });
    else await updateDoc(doc(db, "service_providers", s.id), { active: !currentlyActive });
    addToast(currentlyActive ? "Listing Deactivated" : "Listing Activated", "Status updated", currentlyActive ? "warning" : "success");
  }
  function deleteService(s) {
    const name = s.businessName || s.name || s.ownerName || "this listing";
    setConfirmModal({
      title: "Delete Service Listing?",
      sub: `"${name}" will be permanently deleted.`,
      confirmLabel: "Delete",
      danger: true,
      onConfirm: async () => {
        await deleteDoc(doc(db, s.__src, s.id));
        addToast("Deleted", `"${name}" removed`, "error");
      },
    });
  }

  /* ═══════════════════════════════════════
     ACTIONS — Users
  ═══════════════════════════════════════ */
  async function upgradeUser(id, cur) {
    const plans = ["Free", "Pro", "Premium"];
    const next = plans[(plans.indexOf(cur) + 1) % plans.length];
    await updateDoc(doc(db, "users", id), { plan: next });
    addToast("Plan Updated", `User upgraded to ${next}`, "success");
  }
  function banUser(id, name) {
    setConfirmModal({
      title: "Ban User?",
      sub: `"${name}" will be banned.`,
      confirmLabel: "Ban User",
      danger: true,
      onConfirm: async () => {
        await updateDoc(doc(db, "users", id), { status: "banned" });
        addToast("User Banned", `${name} has been banned`, "error");
      },
    });
  }

  function exportCSV() {
    const rows = [["Customer", "Email", "Phone", "Plan", "Category", "Amount", "UTR", "Status", "Submitted"]];
    payments.forEach((p) => rows.push([p.userName || "", p.userEmail || "", p.userPhone || "", p.planName || "", p.planCategory || "", p.amount || 0, p.txnRefId || "", p.paymentStatus || "", p.createdAt || ""]));
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `smartrent_payments_${Date.now()}.csv`;
    a.click();
    addToast("Export Complete", "CSV downloaded", "success");
  }

  /* ═══════════════════════════════════════
     FILTERED VIEWS (recomputed on every render —
     cheap given dataset size, and always in sync
     with the live listeners above)
  ═══════════════════════════════════════ */
  const q = search.trim().toLowerCase();

  const filteredPayments = useMemo(() => {
    let f = payments;
    if (payFilter === "pending") f = f.filter((p) => p.paymentStatus === "pending");
    else if (payFilter === "verified") f = f.filter((p) => p.paymentStatus === "verified");
    else if (payFilter === "rejected") f = f.filter((p) => p.paymentStatus === "rejected");
    else if (payFilter === "rental") f = f.filter((p) => p.planCategory === "rental");
    else if (payFilter === "services") f = f.filter((p) => p.planCategory === "services");
    if (q) f = f.filter((p) => (p.userName || "").toLowerCase().includes(q) || (p.userEmail || "").toLowerCase().includes(q) || (p.planName || "").toLowerCase().includes(q) || (p.txnRefId || "").toLowerCase().includes(q));
    return f;
  }, [payments, payFilter, q]);

  const filteredSubs = useMemo(() => {
    let f = subs;
    if (subFilter === "active") f = f.filter((s) => s.status === "active");
    else if (subFilter === "trial_active") f = f.filter((s) => s.status === "trial_active");
    else if (subFilter === "expired") f = f.filter((s) => !isSubLive(s));
    return f;
  }, [subs, subFilter]);

  const filteredProperties = useMemo(() => {
    let f = properties;
    if (propFilter === "pending") f = f.filter((p) => !p.approved);
    else if (propFilter === "approved") f = f.filter((p) => p.approved);
    else if (propFilter === "paid") f = f.filter((p) => p.paid);
    if (q) f = f.filter((p) => (p.title || "").toLowerCase().includes(q) || (p.city || "").toLowerCase().includes(q));
    return f;
  }, [properties, propFilter, q]);

  const filteredCommercial = useMemo(() => {
    let f = commercial;
    if (commFilter === "pending") f = f.filter((p) => !p.approved);
    else if (commFilter === "approved") f = f.filter((p) => p.approved);
    if (q) f = f.filter((p) => (p.name || "").toLowerCase().includes(q) || (p.city || "").toLowerCase().includes(q));
    return f;
  }, [commercial, commFilter, q]);

  const filteredServices = useMemo(() => {
    let f = services;
    if (svcFilter === "active") f = f.filter(isServiceActive);
    else if (svcFilter === "inactive") f = f.filter((s) => !isServiceActive(s));
    if (q) f = f.filter((s) => (s.businessName || s.name || "").toLowerCase().includes(q) || (s.city || "").toLowerCase().includes(q));
    return f;
  }, [services, svcFilter, q]);

  const filteredUsers = useMemo(() => {
    let f = userFilter === "all" ? users : users.filter((u) => (u.plan || "Free") === userFilter);
    if (q) f = f.filter((u) => (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q));
    return f;
  }, [users, userFilter, q]);

  const propCountByOwner = useMemo(() => {
    const m = {};
    properties.forEach((p) => (m[p.ownerUid || p.ownerId] = (m[p.ownerUid || p.ownerId] || 0) + 1));
    return m;
  }, [properties]);
  const subCountByUser = useMemo(() => {
    const m = {};
    payments.filter((p) => p.paymentStatus === "verified").forEach((p) => (m[p.userId] = (m[p.userId] || 0) + 1));
    return m;
  }, [payments]);

  if (!authReady) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font)" }}>
        <div className="spinner" />
      </div>
    );
  }

  const PAGE_TITLES = {
    dashboard: "Dashboard",
    analytics: "Analytics",
    payments: "Payments & Subscriptions",
    subscriptions: "Subscriptions",
    properties: "Property Management",
    commercial: "Commercial Properties",
    services: "Service Providers",
    users: "User Management",
    activity: "Activity Log",
    settings: "Settings",
  };

  return (
    <div className="app-wrap">
      <Toasts toasts={toasts} />
      <ConfirmModal modal={confirmModal} onClose={() => setConfirmModal(null)} />

      {/* Payment detail modal */}
      <div className={`modal-overlay ${payDetail ? "open" : ""}`} onClick={(e) => e.target === e.currentTarget && setPayDetail(null)}>
        <div className="detail-modal">
          {payDetail && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{ fontSize: 15, fontWeight: 800 }}>Payment Details</div>
                <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setPayDetail(null)}>
                  ✕ Close
                </button>
              </div>
              <div>
                {[
                  ["Customer", payDetail.userName || "—"],
                  ["Email", payDetail.userEmail || "—"],
                  ["Phone", payDetail.userPhone || "—"],
                  ["User ID", payDetail.userId || "—"],
                  ["Plan", `${payDetail.planName || "—"} (${payDetail.planRole || "—"})`],
                  ["Category", payDetail.planCategory || "—"],
                  ["Amount", inr(payDetail.amount)],
                  ["UTR / Ref", payDetail.txnRefId || "—"],
                  ["UPI ID", payDetail.upiId || "—"],
                  ["Payment Mode", payDetail.paymentMode || "UPI"],
                  ["Status", payDetail.paymentStatus || "—"],
                  ["Submitted", payDetail.createdAt ? new Date(payDetail.createdAt).toLocaleString("en-IN") : "—"],
                  ["Expires", payDetail.expiresAt ? new Date(payDetail.expiresAt).toLocaleDateString("en-IN") : "—"],
                  ["Payment Doc ID", payDetail.id],
                ].map(([k, v]) => (
                  <div className="detail-row" key={k}>
                    <div className="detail-key">{k}</div>
                    <div className="detail-val">{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                {payDetail.paymentStatus === "pending" ? (
                  <>
                    <button
                      className="btn-primary-green"
                      onClick={() => {
                        verifyPayment(payDetail);
                        setPayDetail(null);
                      }}
                    >
                      ✅ Verify & Activate
                    </button>
                    <button
                      className="btn-primary-red"
                      onClick={() => {
                        rejectPayment(payDetail);
                        setPayDetail(null);
                      }}
                    >
                      ❌ Reject
                    </button>
                  </>
                ) : null}
                <button className="btn-secondary" onClick={() => setPayDetail(null)}>
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">💎</div>
          <div>
            <div className="logo-text">SmartRent</div>
            <div className="logo-sub">ADMIN PANEL</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Overview</div>
          <NavItem id="dashboard" active={activePage} onClick={setActivePage} label="Dashboard" />
          <NavItem id="analytics" active={activePage} onClick={setActivePage} label="Analytics" />

          <div className="nav-section-title">Finance</div>
          <NavItem id="payments" active={activePage} onClick={setActivePage} label="Payments" badge={pendingPay} badgeClass="badge-amber" />
          <NavItem id="subscriptions" active={activePage} onClick={setActivePage} label="Subscriptions" />

          <div className="nav-section-title">Listings</div>
          <NavItem id="properties" active={activePage} onClick={setActivePage} label="Properties" badge={pendingProps} />
          <NavItem id="commercial" active={activePage} onClick={setActivePage} label="Commercial" badge={pendingComm} />
          <NavItem id="services" active={activePage} onClick={setActivePage} label="Services" />

          <div className="nav-section-title">People</div>
          <NavItem id="users" active={activePage} onClick={setActivePage} label="Users" />

          <div className="nav-section-title">System</div>
          <NavItem id="activity" active={activePage} onClick={setActivePage} label="Activity Log" />
          <NavItem id="settings" active={activePage} onClick={setActivePage} label="Settings" />
        </nav>

        <div className="sidebar-footer">
          <div className="admin-profile">
            <div className="avatar">A</div>
            <div>
              <div className="profile-name">Admin</div>
              <div className="profile-role">SUPER ADMIN</div>
            </div>
            <div className="live-dot" style={{ marginLeft: "auto" }} title="Online" />
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-title">
            <span className="grad-text">{PAGE_TITLES[activePage]}</span>
          </div>
          <div className="live-updated">
            <span className="live-dot" />{" "}
            <span>{lastUpdated ? `Live · updated ${lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : "Live"}</span>
          </div>
          <div className="search-bar">
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--t3)", flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input placeholder="Search payments, listings, users..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="topbar-actions">
            <div className="icon-btn" onClick={() => addToast("Refreshed", "Live data is already up to date", "success")} title="Refresh">
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div
              className="icon-btn"
              onClick={() => (pendingPay > 0 ? addToast(`${pendingPay} Pending Payments`, "Click Payments to verify", "warning") : addToast("All Clear", "No pending payments", "success"))}
              title="Alerts"
            >
              🔔
              {pendingPay > 0 && <span className="notif-dot" />}
            </div>
            <button className="btn-logout" onClick={() => signOut(auth).then(() => router.push("/login"))}>
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        <div className="content-area">
          {activePage === "dashboard" && (
            <div className="page-section active">
              <div className="stats-grid stagger-in">
                <StatCard accent="var(--blue)" accentPale="var(--blue-pale)" accentSoft="var(--blue-soft)" icon="🏠" label="Total Listings" value={totalListings.toLocaleString("en-IN")} change={`↑ ${properties.length} residential · ${commercial.length} commercial`} changeClass="up" />
                <StatCard accent="var(--green)" accentPale="var(--green-pale)" accentSoft="var(--green-soft)" icon="👥" label="Registered Users" value={users.length.toLocaleString("en-IN")} change={`↑ ${users.length} total registered`} changeClass="up" />
                <StatCard accent="var(--gold)" accentPale="var(--gold-pale)" accentSoft="var(--gold-soft)" icon="💳" label="Total Revenue" value={inr(revenue)} change="from verified payments" changeClass="up" />
                <StatCard accent="var(--red)" accentPale="var(--red-pale)" accentSoft="var(--red-soft)" icon="⏳" label="Pending Payments" value={pendingPay.toLocaleString("en-IN")} change="Awaiting review" />
              </div>
              <div className="stats-grid stagger-in" style={{ marginBottom: 24 }}>
                <StatCard accent="var(--violet)" accentPale="var(--violet-pale)" accentSoft="var(--violet-soft)" icon="🏢" label="Commercial Listings" value={commercial.length.toLocaleString("en-IN")} change={`↑ ${pendingComm} pending review`} changeClass="up" />
                <StatCard accent="var(--teal)" accentPale="var(--teal-pale)" accentSoft="var(--teal-soft)" icon="🔧" label="Service Providers" value={services.length.toLocaleString("en-IN")} change={`↑ ${services.filter(isServiceActive).length} currently active`} changeClass="up" />
                <StatCard accent="var(--green)" accentPale="var(--green-pale)" accentSoft="var(--green-soft)" icon="✅" label="Active Subscriptions" value={activeSubs.toLocaleString("en-IN")} change={`↑ ${subs.length} total ever created`} changeClass="up" />
                <StatCard accent="var(--gold)" accentPale="var(--gold-pale)" accentSoft="var(--gold-soft)" icon="📈" label="Approval Rate" value={`${approvalRate}%`} change="of all listings" />
              </div>

              <div className="charts-grid">
                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Revenue Trend</div>
                      <div className="chart-sub">Verified payments over time</div>
                    </div>
                    <span className="chart-badge" style={{ color: "var(--green)", borderColor: "var(--green-soft)", background: "var(--green-pale)" }}>
                      LIVE
                    </span>
                  </div>
                  <div className="chart-canvas-wrap" style={{ height: 180 }}>
                    <canvas ref={revenueCanvas} />
                  </div>
                </div>
                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Listings by Category</div>
                      <div className="chart-sub">Across all collections</div>
                    </div>
                  </div>
                  <div className="chart-canvas-wrap" style={{ height: 180 }}>
                    <canvas ref={categoryCanvas} />
                  </div>
                </div>
                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <div className="chart-title">Payment Status</div>
                      <div className="chart-sub">Verification breakdown</div>
                    </div>
                  </div>
                  <div className="chart-canvas-wrap" style={{ height: 180 }}>
                    <canvas ref={payStatusCanvas} />
                  </div>
                </div>
              </div>

              <div className="quick-actions">
                <div className="quick-action" style={{ "--card-accent": "var(--gold)" }} onClick={() => setActivePage("payments")}>
                  <div className="qa-icon" style={{ background: "var(--gold-pale)" }}>💳</div>
                  <div><div className="qa-label">Verify Payments</div><div className="qa-sub">Approve pending UPI</div></div>
                </div>
                <div className="quick-action" style={{ "--card-accent": "var(--blue)" }} onClick={() => setActivePage("properties")}>
                  <div className="qa-icon" style={{ background: "var(--blue-pale)" }}>🏠</div>
                  <div><div className="qa-label">Review Listings</div><div className="qa-sub">Approve or reject</div></div>
                </div>
                <div className="quick-action" style={{ "--card-accent": "var(--violet)" }} onClick={() => setActivePage("commercial")}>
                  <div className="qa-icon" style={{ background: "var(--violet-pale)" }}>🏢</div>
                  <div><div className="qa-label">Commercial Review</div><div className="qa-sub">Approve or reject</div></div>
                </div>
                <div className="quick-action" style={{ "--card-accent": "var(--green)" }} onClick={exportCSV}>
                  <div className="qa-icon" style={{ background: "var(--green-pale)" }}>📥</div>
                  <div><div className="qa-label">Export Payments</div><div className="qa-sub">Download CSV</div></div>
                </div>
              </div>

              <div className="section">
                <div className="section-header">
                  <div className="section-title">🕐 Recent Activity <span className="live-dot" /></div>
                </div>
                <ActivityFeed items={activityLog} />
              </div>
            </div>
          )}

          {activePage === "analytics" && (
            <div className="page-section active">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div className="chart-card"><div className="chart-header"><div className="chart-title">Revenue by Month</div></div><div style={{ height: 250 }}><canvas ref={anaRevCanvas} /></div></div>
                <div className="chart-card"><div className="chart-header"><div className="chart-title">Users by Plan</div></div><div style={{ height: 250 }}><canvas ref={anaUsersCanvas} /></div></div>
                <div className="chart-card"><div className="chart-header"><div className="chart-title">Residential Property Status</div></div><div style={{ height: 250 }}><canvas ref={anaPropStatusCanvas} /></div></div>
                <div className="chart-card"><div className="chart-header"><div className="chart-title">Subscription Plan Revenue</div></div><div style={{ height: 250 }}><canvas ref={anaPlanRevCanvas} /></div></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div className="chart-card"><div className="chart-header"><div className="chart-title">Properties by City</div></div><div style={{ height: 220 }}><canvas ref={anaCityCanvas} /></div></div>
                <div className="chart-card"><div className="chart-header"><div className="chart-title">Payment Volume Timeline</div></div><div style={{ height: 220 }}><canvas ref={anaPayTlCanvas} /></div></div>
              </div>
            </div>
          )}

          {activePage === "payments" && (
            <div className="page-section active">
              <div className="pay-stats-grid stagger-in">
                <StatCard accent="var(--gold)" accentPale="var(--gold-pale)" accentSoft="var(--gold-soft)" icon="💳" label="Total Payments" value={payments.length} change="All time" />
                <StatCard accent="var(--red)" accentPale="var(--red-pale)" accentSoft="var(--red-soft)" icon="⏳" label="Pending" value={pendingPay} change={pendingPay > 0 ? `${pendingPay} need action` : "All clear ✓"} changeClass="down" />
                <StatCard accent="var(--green)" accentPale="var(--green-pale)" accentSoft="var(--green-soft)" icon="✅" label="Verified" value={verifiedPay} change={`${verifiedPay} activated`} changeClass="up" />
                <StatCard accent="var(--blue)" accentPale="var(--blue-pale)" accentSoft="var(--blue-soft)" icon="₹" label="Revenue Collected" value={inr(revenue)} change={`${inr(revenue)} earned`} changeClass="up" />
              </div>

              <div className="pay-summary-bar">
                <div className="psb-item"><div className="psb-dot" style={{ background: "var(--gold)" }} />{pendingPay} Pending</div>
                <div className="psb-item"><div className="psb-dot" style={{ background: "var(--green)" }} />{verifiedPay} Verified</div>
                <div className="psb-item"><div className="psb-dot" style={{ background: "var(--red)" }} />{rejectedPay} Rejected</div>
                <div className="psb-item"><div className="psb-dot" style={{ background: "var(--blue)" }} />{inr(revenue)} Collected</div>
              </div>

              <div className="section-header">
                <div className="section-title">
                  💳 All Subscription Payments <span className="section-count">{filteredPayments.length}</span> <span className="live-dot" />
                </div>
                <FilterTabs
                  value={payFilter}
                  onChange={setPayFilter}
                  options={[
                    { value: "all", label: "All" },
                    { value: "pending", label: "⏳ Pending" },
                    { value: "verified", label: "✅ Verified" },
                    { value: "rejected", label: "❌ Rejected" },
                    { value: "rental", label: "🏠 Rental" },
                    { value: "services", label: "🔧 Services" },
                  ]}
                />
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th><th>Plan</th><th>Category</th><th>Amount</th><th>UTR / Ref</th><th>Submitted</th><th>Expires</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length === 0 ? (
                      <tr><td colSpan={9}><div className="empty-state"><div className="icon">💳</div><p>No payments found</p></div></td></tr>
                    ) : (
                      filteredPayments.map((p) => {
                        const statusClass = p.paymentStatus === "verified" ? "verified" : p.paymentStatus === "rejected" ? "rejected" : "pending";
                        const statusLabel = p.paymentStatus === "verified" ? "✅ Verified" : p.paymentStatus === "rejected" ? "❌ Rejected" : "⏳ Pending";
                        const catClass = p.planCategory === "rental" ? "cat-rental" : "cat-services";
                        const isExpired = p.expiresAt && new Date(p.expiresAt) < new Date();
                        return (
                          <tr key={p.id}>
                            <td>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{p.userName || "—"}</div>
                              <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--mono)" }}>{p.userEmail || "—"}</div>
                              <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--mono)" }}>{p.userPhone || "—"}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, fontSize: 12 }}>{p.planName || "—"}</div>
                              <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--mono)" }}>{p.planRole || "—"}</div>
                            </td>
                            <td><span className={`cat-chip ${catClass}`}>{p.planCategory || "—"}</span></td>
                            <td style={{ fontFamily: "var(--mono)", fontWeight: 800, color: "var(--gold)" }}>{inr(p.amount)}</td>
                            <td>
                              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--blue)", cursor: "pointer" }} onClick={() => copyRef(p.txnRefId)}>
                                {(p.txnRefId || "—").substring(0, 14)}
                                {(p.txnRefId || "").length > 14 ? "…" : ""}
                              </div>
                              <div style={{ fontSize: 10, color: "var(--t3)" }}>UPI · {p.upiId || "—"}</div>
                            </td>
                            <td style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--t2)" }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                            <td style={{ fontFamily: "var(--mono)", fontSize: 10, color: isExpired && p.paymentStatus === "verified" ? "var(--red)" : "var(--t2)" }}>{p.expiresAt ? new Date(p.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—"}</td>
                            <td><span className={`pay-status ${statusClass}`}>{statusLabel}</span></td>
                            <td>
                              <div style={{ display: "flex", gap: 5, flexWrap: "nowrap" }}>
                                {p.paymentStatus === "pending" && (
                                  <>
                                    <button className="btn btn-verify" style={{ minWidth: 70, padding: "6px 8px", fontSize: 11 }} onClick={() => verifyPayment(p)}>✅ Verify</button>
                                    <button className="btn btn-pay-reject" style={{ minWidth: 64, padding: "6px 8px", fontSize: 11 }} onClick={() => rejectPayment(p)}>❌ Reject</button>
                                  </>
                                )}
                                {p.paymentStatus === "verified" && <span className="sub-active-badge">🟢 Active</span>}
                                {p.paymentStatus === "rejected" && (
                                  <button className="btn btn-verify" style={{ padding: "5px 8px", fontSize: 10 }} onClick={() => verifyPayment(p)}>↩ Re-verify</button>
                                )}
                                <button className="btn btn-view" style={{ padding: "6px 8px", fontSize: 11 }} onClick={() => setPayDetail(p)}>👁 View</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activePage === "subscriptions" && (
            <div className="page-section active">
              <div className="section-header">
                <div className="section-title">✅ All Subscriptions <span className="section-count">{filteredSubs.length}</span> <span className="live-dot" /></div>
                <FilterTabs
                  value={subFilter}
                  onChange={setSubFilter}
                  options={[
                    { value: "all", label: "All" },
                    { value: "active", label: "Active" },
                    { value: "trial_active", label: "Trial" },
                    { value: "expired", label: "Expired" },
                  ]}
                />
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>User ID</th><th>Plan</th><th>Status</th><th>Started</th><th>Expires</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredSubs.length === 0 ? (
                      <tr><td colSpan={6}><div className="empty-state"><div className="icon">✅</div><p>No subscriptions found</p></div></td></tr>
                    ) : (
                      filteredSubs.map((s) => {
                        const plan = s.plan || s.planName || "—";
                        const started = s.trialStartDate || s.activatedAt;
                        const expires = s.trialEndDate || s.expiresAt;
                        const live = isSubLive(s);
                        const statusClass = live ? "verified" : s.status === "active" || s.status === "trial_active" ? "rejected" : "pending";
                        const statusLabel = live ? "✅ Live" : s.status === "active" || s.status === "trial_active" ? "⏰ Expired" : s.status || "—";
                        return (
                          <tr key={s.id}>
                            <td style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{s.id}</td>
                            <td style={{ fontWeight: 700 }}>{plan}</td>
                            <td><span className={`pay-status ${statusClass}`}>{statusLabel}</span></td>
                            <td style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--t2)" }}>{started ? new Date(started).toLocaleDateString("en-IN") : "—"}</td>
                            <td style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--t2)" }}>{expires ? new Date(expires).toLocaleDateString("en-IN") : "—"}</td>
                            <td><button className="td-btn danger" onClick={() => expireSub(s.id)}>Expire Now</button></td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activePage === "properties" && (
            <div className="page-section active">
              <div className="section-header">
                <div className="section-title">🏠 Residential Properties <span className="section-count">{filteredProperties.length}</span></div>
                <FilterTabs
                  value={propFilter}
                  onChange={setPropFilter}
                  options={[
                    { value: "all", label: "All" },
                    { value: "pending", label: "Pending" },
                    { value: "approved", label: "Approved" },
                    { value: "paid", label: "Paid Boost" },
                  ]}
                />
              </div>
              <div className="property-grid">
                {filteredProperties.length === 0 ? (
                  <div className="empty-state" style={{ gridColumn: "1/-1" }}><div className="icon">🏠</div><p>No properties found</p></div>
                ) : (
                  filteredProperties.map((p, i) => (
                    <div className="property-card" key={p.id}>
                      <div className="property-img">
                        {["🏠", "🏢", "🏗️", "🏡", "🏘️", "🏬"][i % 6]}
                        <span className={`property-status-badge ${p.approved ? "badge-approved" : "badge-pending"}`}>{p.approved ? "✓ APPROVED" : "⏳ PENDING"}</span>
                      </div>
                      <div className="property-body">
                        <div className="property-name">{p.title || "Untitled Property"}</div>
                        <div className="property-meta">
                          <span>📍 {p.city || "—"}</span>
                          <span>{p.bhk || "—"}</span>
                          <span>{inr(p.price)}/mo</span>
                          {p.paid && <span style={{ color: "var(--green)" }}>💳 Paid</span>}
                        </div>
                        <div className="property-owner">👤 {(p.owner && p.owner.name) || p.ownerId || "Unknown"}</div>
                        <div className="property-actions">
                          {!p.approved && <button className="btn btn-approve" onClick={() => approveProperty(p.id)}>✓ Approve</button>}
                          {p.approved && <button className="btn btn-reject" onClick={() => revokeProperty(p.id)}>↩ Revoke</button>}
                          <button className="btn btn-delete" onClick={() => deleteProperty(p.id, p.title || "this")}>🗑 Delete</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activePage === "commercial" && (
            <div className="page-section active">
              <div className="section-header">
                <div className="section-title">🏢 Commercial Properties <span className="section-count">{filteredCommercial.length}</span></div>
                <FilterTabs
                  value={commFilter}
                  onChange={setCommFilter}
                  options={[
                    { value: "all", label: "All" },
                    { value: "pending", label: "Pending" },
                    { value: "approved", label: "Approved" },
                  ]}
                />
              </div>
              <div className="property-grid">
                {filteredCommercial.length === 0 ? (
                  <div className="empty-state" style={{ gridColumn: "1/-1" }}><div className="icon">🏢</div><p>No commercial listings found</p></div>
                ) : (
                  filteredCommercial.map((p, i) => (
                    <div className="property-card" key={p.id}>
                      <div className="property-img">
                        {["🏢", "🏬", "🏭", "🏗️", "🖥️", "🚗"][i % 6]}
                        <span className={`property-status-badge ${p.approved ? "badge-approved" : "badge-pending"}`}>{p.approved ? "✓ APPROVED" : "⏳ PENDING"}</span>
                      </div>
                      <div className="property-body">
                        <div className="property-name">{p.name || "Untitled Commercial Space"}</div>
                        <div className="property-meta">
                          <span>📍 {p.city || "—"}</span>
                          <span>{p.type || "—"}</span>
                          <span>{inr(p.price)}/{p.per || "mo"}</span>
                          {p.verified && <span style={{ color: "var(--green)" }}>✓ Verified</span>}
                        </div>
                        <div className="property-owner">👤 {(p.owner && p.owner.name) || p.ownerUid || "Unknown"}</div>
                        <div className="property-actions">
                          {!p.approved && <button className="btn btn-approve" onClick={() => approveCommercial(p.id)}>✓ Approve</button>}
                          {p.approved && <button className="btn btn-reject" onClick={() => revokeCommercial(p.id)}>↩ Revoke</button>}
                          <button className="btn btn-delete" onClick={() => deleteCommercial(p.id, p.name || "this")}>🗑 Delete</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activePage === "services" && (
            <div className="page-section active">
              <div className="section-header">
                <div className="section-title">🔧 Service Providers <span className="section-count">{filteredServices.length}</span></div>
                <FilterTabs
                  value={svcFilter}
                  onChange={setSvcFilter}
                  options={[
                    { value: "all", label: "All" },
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                />
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Provider</th><th>Category</th><th>City</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredServices.length === 0 ? (
                      <tr><td colSpan={6}><div className="empty-state"><div className="icon">🔧</div><p>No service listings found</p></div></td></tr>
                    ) : (
                      filteredServices.map((s) => {
                        const name = s.businessName || s.name || s.ownerName || "—";
                        const active = isServiceActive(s);
                        const price = s.priceFrom || s.startingPrice || 0;
                        return (
                          <tr key={`${s.__src}-${s.id}`}>
                            <td>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{name}</div>
                              <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "var(--mono)" }}>{s.phone || "—"}</div>
                            </td>
                            <td><span className="cat-chip cat-services">{s.category || "—"}</span></td>
                            <td style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{s.city || "—"}</td>
                            <td style={{ fontFamily: "var(--mono)", fontWeight: 700, color: "var(--teal)" }}>{inr(price)}</td>
                            <td><span className={`status-dot ${active ? "status-active" : "status-inactive"}`}>{active ? "Active" : "Inactive"}</span></td>
                            <td>
                              <div className="td-actions">
                                <button className="td-btn" onClick={() => toggleServiceActive(s)}>{active ? "Deactivate" : "Activate"}</button>
                                <button className="td-btn danger" onClick={() => deleteService(s)}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activePage === "users" && (
            <div className="page-section active">
              <div className="section-header">
                <div className="section-title">👥 All Users <span className="section-count">{filteredUsers.length}</span></div>
                <FilterTabs
                  value={userFilter}
                  onChange={setUserFilter}
                  options={[
                    { value: "all", label: "All" },
                    { value: "Pro", label: "Pro" },
                    { value: "Premium", label: "Premium" },
                    { value: "Free", label: "Free" },
                  ]}
                />
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>User</th><th>Plan</th><th>Status</th><th>Joined</th><th>Properties</th><th>Subscriptions</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={7}><div className="empty-state"><div className="icon">👤</div><p>No users found</p></div></td></tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div className="user-avatar">{(u.name || u.email || "?")[0].toUpperCase()}</div>
                              <div><div className="user-name">{u.name || "Anonymous"}</div><div className="user-email">{u.email || "N/A"}</div></div>
                            </div>
                          </td>
                          <td><span className={`plan-badge ${u.plan === "Pro" ? "plan-pro" : u.plan === "Premium" ? "plan-premium" : "plan-free"}`}>{u.plan || "Free"}</span></td>
                          <td><span className={`status-dot ${u.status === "banned" ? "status-banned" : u.status === "inactive" ? "status-inactive" : "status-active"}`}>{u.status || "Active"}</span></td>
                          <td style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--t3)" }}>{u.createdAt && u.createdAt.seconds ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : "-"}</td>
                          <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--blue)" }}>{propCountByOwner[u.id] || 0}</td>
                          <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--green)" }}>{subCountByUser[u.id] || 0} active</td>
                          <td>
                            <div className="td-actions">
                              <button className="td-btn" onClick={() => upgradeUser(u.id, u.plan || "Free")}>Upgrade</button>
                              <button className="td-btn danger" onClick={() => banUser(u.id, u.name || u.email || "Unknown")}>Ban</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activePage === "activity" && (
            <div className="page-section active">
              <div className="section-header"><div className="section-title">🕐 Activity Log</div></div>
              <ActivityFeed items={activityLog} full />
            </div>
          )}

          {activePage === "settings" && (
            <div className="page-section active">
              <div style={{ maxWidth: 560 }}>
                <div className="chart-card" style={{ marginBottom: 16 }}>
                  <div className="chart-title" style={{ marginBottom: 16 }}>⚙️ Admin Settings</div>
                  <div className="mini-metric"><span className="mini-metric-label">Admin Email</span><span className="mini-metric-value" style={{ color: "var(--blue)" }}>{adminUserEmail || "—"}</span></div>
                  <div className="mini-metric"><span className="mini-metric-label">Firebase Project</span><span className="mini-metric-value">smart-property-portal</span></div>
                  <div className="mini-metric"><span className="mini-metric-label">Data Refresh</span><span className="mini-metric-value" style={{ color: "var(--green)" }}>Real-time (onSnapshot)</span></div>
                  <div className="mini-metric"><span className="mini-metric-label">Collections Watched</span><span className="mini-metric-value">7 live listeners</span></div>
                  <div className="mini-metric"><span className="mini-metric-label">Stack</span><span className="mini-metric-value">Next.js App Router</span></div>
                </div>
                <div className="chart-card">
                  <div className="chart-title" style={{ marginBottom: 16 }}>🔔 Notifications</div>
                  <div className="mini-metric"><span className="mini-metric-label">Auto-alert on pending payments</span><span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 11, color: "var(--green)", fontFamily: "var(--mono)", fontWeight: 700 }}>ENABLED</span><div className="live-dot" /></span></div>
                  <div className="mini-metric"><span className="mini-metric-label">Real-time listener</span><span className="mini-metric-value">Firestore onSnapshot</span></div>
                  <div className="mini-metric"><span className="mini-metric-label">On verification</span><span className="mini-metric-value" style={{ color: "var(--green)" }}>Subscription auto-created</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ── small local components ── */
function NavItem({ id, active, onClick, label, badge, badgeClass }) {
  return (
    <a className={`nav-item ${active === id ? "active" : ""}`} onClick={() => onClick(id)}>
      {label}
      {!!badge && <span className={badgeClass || "badge"}>{badge}</span>}
    </a>
  );
}

function ActivityFeed({ items, full }) {
  return (
    <div className="activity-feed" style={full ? { maxHeight: "none" } : undefined}>
      {items.length === 0 ? (
        <div className="empty-state"><div className="icon">🕐</div><p>No activity</p></div>
      ) : (
        items.map((a, i) => (
          <div className="activity-item" key={i}>
            <div className="activity-icon" style={{ background: a.color }}>{a.icon}</div>
            <div className="activity-text">
              <div className="activity-main">{a.text}</div>
              <div className="activity-time">{timeAgo(a.time)}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
