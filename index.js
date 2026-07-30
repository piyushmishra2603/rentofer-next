"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import "./page.css";

/* ── static data (ported 1:1 from index.html) ── */
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=75",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=75",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=75",
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1600&q=75",
  "https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?auto=format&fit=crop&w=1600&q=75",
];

const MARQUEE_ITEMS = [
  { i: "✅", t: <><strong>100%</strong> Verified Listings</> },
  { i: "🏙️", t: <><strong>15+</strong> Cities Covered</> },
  { i: "⚡", t: <><strong>Zero Brokerage</strong> Always</> },
  { i: "🔒", t: <><strong>KYC-Verified</strong> Landlords</> },
  { i: "📞", t: <><strong>Direct</strong> Owner Connect</> },
  { i: "🤖", t: <><strong>AI-Matched</strong> Properties</> },
  { i: "⭐", t: <><strong>4.8/5</strong> Avg Rating</> },
  { i: "🔧", t: <><strong>500+</strong> Service Professionals</> },
  { i: "🏡", t: <><strong>Zero</strong> Hidden Charges</> },
  { i: "📱", t: <><strong>Mobile-Friendly</strong> Platform</> },
];

const ACTIVITIES = [
  "New PG listing verified in Kondapur, Hyderabad",
  "Owner from Bangalore just listed a 2BHK flat",
  "Electrician booked in Madhapur",
  "New co-living space listed in Koramangala",
  "Plumber booking confirmed in Gachibowli",
  "Property owner completed KYC verification",
  "New hostel verified in Banjara Hills",
  "Painter booked in HSR Layout, Bangalore",
  "New PG listed near HITEC City",
  "Carpenter service confirmed in Jubilee Hills",
];

const SERVICES = [
  { href: "/plumber", icon: "🔧", name: "Plumber", desc: "Leaks, pipe fitting, bathroom repairs, drainage issues — same-day availability.", price: "From ₹299", c1: "#2563eb", c2: "#3b82f6" },
  { href: "/electrician", icon: "⚡", name: "Electrician", desc: "Wiring, fan & light installation, switchboard repairs, short circuit fixes.", price: "From ₹349", c1: "#10b981", c2: "#10b981" },
  { href: "/carpenter", icon: "🪚", name: "Carpenter", desc: "Furniture assembly, door & window repairs, wardrobes, custom woodwork.", price: "From ₹399", c1: "#2563eb", c2: "#10b981" },
  { href: "/painter", icon: "🎨", name: "Painter", desc: "Interior & exterior painting, waterproofing, texture finish, touch-ups.", price: "From ₹499", c1: "#3b82f6", c2: "#2563eb" },
  { href: "/movers-packers", icon: "🚚", name: "Movers & Packers", desc: "Safe packing, loading, transportation & unloading — complete home shifting.", price: "From ₹1,999", c1: "#10b981", c2: "#2563eb" },
  { href: "/home-cleaner", icon: "🧹", name: "Home Cleaner", desc: "Full flat cleaning, sofa cleaning, bathroom scrub, move-in/out deep cleaning.", price: "From ₹499", c1: "#2563eb", c2: "#3b82f6" },
];

const CATEGORIES = [
  { href: "/pgs-hostels", icon: "🏠", name: "PG", cg: "rgba(37,99,235,.06)" },
  { href: "/pgs-hostels", icon: "🏢", name: "Hostel", cg: "rgba(16,185,129,.05)" },
  { href: "/properties", icon: "🏡", name: "Flat / Apartment", cg: "rgba(37,99,235,.04)" },
  { href: "/properties", icon: "🤝", name: "Co-living", cg: "rgba(16,185,129,.04)" },
  { href: "/properties", icon: "🏗️", name: "Builder Floors", cg: "rgba(37,99,235,.03)" },
  { href: "/commercial", icon: "🏪", name: "Commercial", cg: "rgba(16,185,129,.03)" },
];

const CITIES = [
  { href: "/pgs-hostels", flag: "🌆", name: "Hyderabad" },
  { href: "/properties", flag: "🌇", name: "Bangalore" },
  { href: "/properties", flag: "🏙️", name: "Mumbai" },
  { href: "/properties", flag: "🏛️", name: "Delhi / NCR" },
  { href: "/properties", flag: "🌃", name: "Chennai" },
];

const TESTIMONIALS = [
  { avatar: "A", avatarBg: null, name: "Aditya Sharma", role: "Software Engineer · Hyderabad", quote: "Found my PG in Banjara Hills within two days. Verified photos, direct owner contact, zero brokerage. SmartRent AI is genuinely the best rental platform I have ever used." },
  { avatar: "P", avatarBg: "linear-gradient(135deg,#e11d48,#9b79ff)", name: "Priya Menon", role: "UX Designer · Bangalore", quote: "The AI matching is remarkably accurate. It surfaced exactly what I needed — a girls-only PG near my office, with meals and AC, under ₹8,000. Moved in within the week." },
  { avatar: "R", avatarBg: null, name: "Rajan Verma", role: "Property Owner · Mumbai", quote: "Listing my hostel was effortless and free. I received genuine inquiries within days. The owner dashboard makes managing bookings a real pleasure." },
];

const FAQS = [
  { q: "Is SmartRent AI really free for tenants?", a: "Yes. Browsing, searching and directly contacting property owners is completely free for tenants — there is no brokerage fee at any stage." },
  { q: "How are properties verified?", a: "Every listing goes through KYC document checks and a physical ground-team visit before it goes live, so photos and pricing match reality." },
  { q: "How quickly can I list my property?", a: "Most owners go live in under 30 minutes — add your photos, set your price, and verified tenant inquiries start coming in the same day." },
  { q: "Do you offer home services outside rentals?", a: "Yes — plumbers, electricians, carpenters, painters, movers and cleaners are all bookable directly from the Services menu, verified and background-checked." },
  { q: "Which cities does SmartRent AI cover?", a: "We currently cover 15+ Indian cities including Hyderabad, Bangalore, Mumbai, Delhi/NCR and Chennai, with more being added regularly." },
];

const BLOG_POSTS = [
  { tag: "Tenant Guide", img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=70", meta: "5 min read · Renting Tips", title: "7 Questions to Ask Before You Sign a Rental Agreement", desc: "A quick checklist that helps first-time renters avoid the most common lease-signing mistakes." },
  { tag: "Owner Tips", img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=70", meta: "4 min read · For Owners", title: "How KYC Verification Gets You Better Tenants, Faster", desc: "Why verified listings consistently receive higher-quality inquiries and close faster." },
  { tag: "City Guide", img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=70", meta: "6 min read · City Guides", title: "Best Neighbourhoods for Young Professionals in Hyderabad", desc: "Commute times, PG density and nightlife — a locality-by-locality breakdown." },
];

export default function HomePage() {
  const router = useRouter();

  /* ── auth ── */
  const [authUser, setAuthUser] = useState(undefined); // undefined = loading, null = signed out

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setAuthUser(user || null));
    return () => unsub();
  }, []);

  async function doLogout() {
    try {
      await signOut(auth);
      showToast("👋 Signed out successfully.");
    } catch {
      showToast("⚠️ Could not sign out. Please try again.");
    }
  }

  /* ── live Firestore counts ── */
  const [hsProps, setHsProps] = useState(null);
  const [hsOwners, setHsOwners] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getCountFromServer(query(collection(db, "properties"), where("approved", "==", true)));
        setHsProps(snap.data().count);
      } catch {
        setHsProps(null);
      }
    })();
    (async () => {
      try {
        const snap = await getCountFromServer(query(collection(db, "users"), where("role", "==", "owner")));
        setHsOwners(snap.data().count);
      } catch {
        setHsOwners(null);
      }
    })();
  }, []);

  /* ── hero slideshow (Ken Burns) ── */
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(t);
  }, []);

  /* ── scroll progress / navbar solid / how-spine draw / back-to-top ── */
  const [scrollPct, setScrollPct] = useState(0);
  const [navSolid, setNavSolid] = useState(false);
  const [howDrawn, setHowDrawn] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);
  const howSecRef = useRef(null);

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(h > 0 ? (window.scrollY / h) * 100 : 0);
      setNavSolid(window.scrollY > 40);
      setShowBackTop(window.scrollY > 600);
      if (howSecRef.current && !howDrawn) {
        const top = howSecRef.current.getBoundingClientRect().top;
        if (top < window.innerHeight * 0.7) setHowDrawn(true);
      }
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [howDrawn]);

  /* ── scroll reveal ── */
  const revRefs = useRef([]);
  revRefs.current = [];
  const addRevRef = (el) => {
    if (el && !revRefs.current.includes(el)) revRefs.current.push(el);
  };
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revRefs.current.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* ── custom cursor ── */
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const pageRef = useRef(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer:fine)").matches) return;
    let mx = 0, my = 0, rx = 0, ry = 0, raf;
    const onMove = (e) => { mx = e.clientX; my = e.clientY; };
    window.addEventListener("mousemove", onMove);
    function tick() {
      if (dotRef.current) { dotRef.current.style.left = mx + "px"; dotRef.current.style.top = my + "px"; }
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ringRef.current) { ringRef.current.style.left = rx + "px"; ringRef.current.style.top = ry + "px"; }
      raf = requestAnimationFrame(tick);
    }
    tick();

    const hoverSel = "a,button,.cat-card,.sc,.cc,.tc,.fc,.bc";
    const onEnter = () => { pageRef.current?.classList.add("on-link"); dotRef.current?.classList.add("hover"); ringRef.current?.classList.add("hover"); };
    const onLeave = () => { pageRef.current?.classList.remove("on-link"); dotRef.current?.classList.remove("hover"); ringRef.current?.classList.remove("hover"); };
    const els = pageRef.current ? pageRef.current.querySelectorAll(hoverSel) : [];
    els.forEach((el) => { el.addEventListener("mouseenter", onEnter); el.addEventListener("mouseleave", onLeave); });

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      els.forEach((el) => { el.removeEventListener("mouseenter", onEnter); el.removeEventListener("mouseleave", onLeave); });
    };
  }, []);
  const pointerFine = useMemo(() => typeof window !== "undefined" && window.matchMedia("(pointer:fine)").matches, []);

  /* ── toast ── */
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3800);
  }

  /* ── consent overlay ── */
  const [consentAccepted, setConsentAccepted] = useState(true);
  useEffect(() => {
    if (!localStorage.getItem("sra_v5")) setConsentAccepted(false);
  }, []);
  function acceptConsent() {
    setConsentAccepted(true);
    localStorage.setItem("sra_v5", "1");
  }

  /* ── activity ticker ── */
  const [activities, setActivities] = useState([]);
  const actIdxRef = useRef(0);
  const tickerStarted = useRef(false);

  function pushActivity() {
    const id = Math.random().toString(36).slice(2);
    const text = ACTIVITIES[actIdxRef.current % ACTIVITIES.length];
    actIdxRef.current += 1;
    setActivities((a) => [...a, { id, text, show: false }]);
    requestAnimationFrame(() => {
      setActivities((a) => a.map((c) => (c.id === id ? { ...c, show: true } : c)));
    });
    setTimeout(() => {
      setActivities((a) => a.map((c) => (c.id === id ? { ...c, show: false } : c)));
      setTimeout(() => setActivities((a) => a.filter((c) => c.id !== id)), 400);
    }, 5000);
  }

  useEffect(() => {
    if (!consentAccepted || tickerStarted.current) return;
    tickerStarted.current = true;
    const startDelay = setTimeout(() => {
      pushActivity();
    }, 4000);
    const interval = setInterval(pushActivity, 14000);
    return () => { clearTimeout(startDelay); clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consentAccepted]);

  /* ── mobile menu / chat panel / FAQ ── */
  const [mobOpen, setMobOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);

  /* ── newsletter ── */
  const [nlEmail, setNlEmail] = useState("");
  function subNL() {
    if (!nlEmail.includes("@")) {
      showToast("⚠️ Please enter a valid email address");
      return;
    }
    setNlEmail("");
    showToast("🎉 Subscribed! You'll receive daily property alerts.");
  }

  /* ── hero search (visual redesign — routes to /properties) ── */
  const [heroLocation, setHeroLocation] = useState("");
  const [heroType, setHeroType] = useState("");

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const fmt = (n) => (n === null ? "—" : n.toLocaleString("en-IN") + (n > 99 ? "+" : ""));

  return (
    <div className="home-page" ref={pageRef}>
      {/* SCROLL PROGRESS */}
      <div className="progress-bar" style={{ width: `${scrollPct}%` }} />

      {/* CUSTOM CURSOR */}
      {pointerFine && (
        <>
          <div className="cur-dot" ref={dotRef} />
          <div className="cur-ring" ref={ringRef} />
        </>
      )}

      {/* AMBIENT */}
      <div className="amb"><div className="orb o1" /><div className="orb o2" /><div className="orb o3" /></div>
      <div className="grid-bg" />

      {/* TOAST */}
      {toast && (
        <div className="toast" role="status" aria-live="polite">{toast}</div>
      )}

      {/* ACTIVITY TICKER */}
      <div className="activity-ticker" aria-hidden="true">
        {activities.map((a) => (
          <div className={`at-card ${a.show ? "show" : ""}`} key={a.id}>
            <div className="at-dot" />
            <div className="at-text">{a.text}</div>
          </div>
        ))}
      </div>

      {/* MOBILE MENU */}
      <div className={`mob-menu ${mobOpen ? "open" : ""}`}>
        <Link className="mob-link" href="/pgs-hostels" onClick={() => setMobOpen(false)}>🏠 PG &amp; Hostels</Link>
        <Link className="mob-link" href="/properties" onClick={() => setMobOpen(false)}>🏢 Flats &amp; Apartments</Link>
        <Link className="mob-link" href="/properties" onClick={() => setMobOpen(false)}>🤝 Co-living Spaces</Link>
        <Link className="mob-link" href="/commercial" onClick={() => setMobOpen(false)}>🏪 Commercial</Link>
        <Link className="mob-link svc" href="/services" onClick={() => setMobOpen(false)}>🔧 Home Services</Link>
        <hr style={{ border: "none", borderTop: "1px solid rgba(15,23,42,.08)", margin: "6px 0" }} />
        {!authUser ? (
          <div>
            <Link className="nb nb-gh" href="/login" style={{ textDecoration: "none", justifyContent: "center", display: "flex" }} onClick={() => setMobOpen(false)}>Sign In</Link>
            <Link className="nb nb-gold" href="/post-property" style={{ textDecoration: "none", justifyContent: "center", display: "flex", marginTop: 7 }} onClick={() => setMobOpen(false)}>+ List Your Property Free</Link>
          </div>
        ) : (
          <div>
            <Link className="nb nb-gold" href="/owner-dashboard" style={{ textDecoration: "none", justifyContent: "center", display: "flex" }} onClick={() => setMobOpen(false)}>📋 My Dashboard</Link>
            <button className="nb nb-logout" onClick={doLogout} style={{ width: "100%", justifyContent: "center", marginTop: 7, borderRadius: 8, padding: 11 }}>🚪 Sign Out</button>
          </div>
        )}
      </div>

      {/* CONSENT */}
      {!consentAccepted && (
        <div className="con-ov">
          <div className="con-box">
            <span className="con-ic">🏡</span>
            <div className="con-t">Welcome to SmartRent AI</div>
            <div className="con-p">Before exploring verified properties across India, please accept our Privacy Policy and Terms of Service. We use cookies to personalise your rental search experience.</div>
            <button className="con-btn" onClick={acceptConsent}>✓ Accept &amp; Explore Properties</button>
            <div className="con-note">By continuing you agree to our <Link href="/privacy-policy">Privacy Policy</Link> &amp; <Link href="/privacy-policy">Terms of Service</Link></div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className={`nav ${navSolid ? "solid" : ""}`}>
        <Link href="/" className="nav-brand">
          <div className="nav-gem">💎</div>
          <div className="nav-wordmark">
            <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
              <span className="nw-sr">SmartRent</span>
              <span className="nw-ai">AI</span>
            </div>
          </div>
        </Link>

        <div className="nav-links">
          <div className="nav-dd">
            <button className="nav-dd-btn">
              Browse Rentals
              <svg viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="nav-dd-panel">
              <Link className="dd-item" href="/pgs-hostels"><span className="dd-item-ic">🏠</span>PG &amp; Hostels</Link>
              <Link className="dd-item" href="/properties"><span className="dd-item-ic">🏡</span>Flats &amp; Apartments</Link>
              <Link className="dd-item" href="/properties"><span className="dd-item-ic">🤝</span>Co-living Spaces</Link>
              <Link className="dd-item" href="/properties"><span className="dd-item-ic">🏗️</span>Builder Floors</Link>
              <div className="dd-sep" />
              <Link className="dd-item" href="/commercial"><span className="dd-item-ic">🏪</span>Commercial</Link>
            </div>
          </div>

          <div className="nav-dd">
            <button className="nav-dd-btn" style={{ color: "var(--teal)", fontWeight: 700 }}>
              🔧 Services
              <svg viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="nav-dd-panel">
              <Link className="dd-item svc" href="/plumber"><span className="dd-item-ic">🔧</span>Plumber</Link>
              <Link className="dd-item svc" href="/electrician"><span className="dd-item-ic">⚡</span>Electrician</Link>
              <Link className="dd-item svc" href="/carpenter"><span className="dd-item-ic">🪚</span>Carpenter</Link>
              <Link className="dd-item svc" href="/painter"><span className="dd-item-ic">🎨</span>Painter</Link>
              <Link className="dd-item svc" href="/movers-packers"><span className="dd-item-ic">🚚</span>Movers &amp; Packers</Link>
              <Link className="dd-item svc" href="/home-cleaner"><span className="dd-item-ic">🧹</span>Home Cleaner</Link>
            </div>
          </div>

          <Link className="nav-a" href="/post-property">List Property <span className="nav-badge">FREE</span></Link>
          <Link className="nav-a" href="/plans">Pricing</Link>
        </div>

        <div className="nav-right">
          {!authUser ? (
            <>
              <Link className="nb nb-gh" href="/login" style={{ textDecoration: "none" }}>Sign In</Link>
              <Link className="nb nb-gold" href="/post-property" style={{ textDecoration: "none" }}>+ List Property</Link>
            </>
          ) : (
            <>
              <div className="nav-user-pill">
                <div className="nav-av" onClick={() => router.push("/profile")} title="My Dashboard" style={{ width: 28, height: 28, fontSize: 13, borderWidth: 1.5, cursor: "pointer" }}>
                  {(authUser.displayName || authUser.email || "U")[0].toUpperCase()}
                </div>
                <span>{authUser.displayName || (authUser.email ? authUser.email.split("@")[0] : "User")}</span>
              </div>
              <button className="nb nb-logout" onClick={doLogout}>
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Logout
              </button>
            </>
          )}
          <button className="mob-btn" onClick={() => setMobOpen((o) => !o)} aria-label="Toggle menu" style={{ display: undefined }}>
            {mobOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-slides" aria-hidden="true">
          {HERO_IMAGES.map((url, i) => (
            <div key={url} className={`hero-slide ${i === heroIdx ? "active" : ""}`} style={{ backgroundImage: `url('${url}')` }} />
          ))}
        </div>
        <div className="hero-overlay" />
        <div className="hero-bg" />
        <div className="hero-spark" />

        <div className="h-eye"><span className="live-dot" />AI-Powered · Zero Brokerage · India</div>

        <h1 className="h-title">Find Your<br /><em>Perfect Rental</em></h1>
        <div className="h-sub-serif">Homes that feel like home.</div>

        <p className="h-desc">Discover verified PGs, hostels, flats &amp; co-living spaces across India — intelligently matched to your commute, budget and lifestyle. Zero brokerage, always.</p>

        <div className="h-search">
          <div className="h-search-inner">
            <div className="h-search-field">
              <span className="h-search-ic" aria-hidden="true">📍</span>
              <input className="h-search-input" type="text" placeholder="City or locality" aria-label="City or locality" value={heroLocation} onChange={(e) => setHeroLocation(e.target.value)} />
            </div>
            <div className="h-search-divider" />
            <div className="h-search-field">
              <span className="h-search-ic" aria-hidden="true">🏠</span>
              <input className="h-search-input" type="text" placeholder="PG, flat, co-living…" aria-label="Property type" value={heroType} onChange={(e) => setHeroType(e.target.value)} />
            </div>
            <Link className="h-search-btn" href="/properties"><span aria-hidden="true">🔍</span> Search</Link>
          </div>
        </div>

        <div className="hero-ctas">
          <Link className="h-btn-main" href="/properties">🏠 Browse Rentals</Link>
          <Link className="h-btn-sec" href="/services">🔧 Explore Services</Link>
          <Link className="h-btn-sec" href="/post-property">✦ List Property Free</Link>
        </div>

        <div className="trust-float">
          <div className="tf-card"><span className="tf-ic">✅</span> KYC Verified Owners</div>
          <div className="tf-card"><span className="tf-ic">⚡</span> Zero Brokerage</div>
          <div className="tf-card"><span className="tf-ic">🤖</span> AI Matched</div>
          <div className="tf-card"><span className="tf-ic">🔒</span> Secure Platform</div>
          <div className="tf-card"><span className="tf-ic">📞</span> Direct Connect</div>
        </div>

        <div className="h-stats">
          <div className="stats-inner">
            <div className="hst"><div className="hst-v">{fmt(hsProps)}</div><div className="hst-l">Live Properties</div></div>
            <div className="hst"><div className="hst-v">{fmt(hsOwners)}</div><div className="hst-l">Verified Owners</div></div>
            <div className="hst"><div className="hst-v">15+</div><div className="hst-l">Cities Covered</div></div>
            <div className="hst"><div className="hst-v">₹0</div><div className="hst-l">Brokerage Fee</div></div>
          </div>
        </div>

        <div className="h-fade" />
      </section>

      {/* MARQUEE */}
      <div className="mbar-wrap">
        <div className="mtrack">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((m, i) => (
            <div className="mi" key={i}><span className="mi-ic">{m.i}</span><span className="mi-tx">{m.t}</span></div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="cats-sec">
        <div className="wrap">
          <div className="rv" ref={addRevRef}>
            <div className="eyebrow">Explore By Type</div>
            <h2 className="sh2">Every Rental,<br /><em>One Platform</em></h2>
          </div>
          <div className="cat-grid rv d1" ref={addRevRef}>
            {CATEGORIES.map((c) => (
              <Link className="cat-card" href={c.href} style={{ "--cg": c.cg }} key={c.name}>
                <span className="cat-ic">{c.icon}</span><div className="cat-nm">{c.name}</div><div className="cat-ct">Browse listings</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOME SERVICES */}
      <section className="svc-sec" id="services">
        <div className="wrap">
          <div className="svc-header-row rv" ref={addRevRef}>
            <div>
              <div className="eyebrow">Home Services</div>
              <h2 className="sh2">Everything Your Home<br /><em>Needs, On Demand</em></h2>
              <p className="sp">Verified, background-checked professionals for all your home maintenance needs — book in minutes, get it done today.</p>
            </div>
            <Link className="svc-cta-link" href="/services">View all services →</Link>
          </div>
          <div className="svc-grid-6 rv d1" ref={addRevRef}>
            {SERVICES.map((s) => (
              <Link className="sc" href={s.href} style={{ "--scc": s.c1, "--scc2": s.c2 }} key={s.name}>
                <span className="sc-icon">{s.icon}</span>
                <div className="sc-name">{s.name}</div>
                <div className="sc-desc">{s.desc}</div>
                <div className="sc-meta"><span className="sc-tag">✓ Verified</span><span className="sc-price">{s.price}</span></div>
                <button className="sc-btn">Explore →</button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-sec" ref={howSecRef}>
        <div className="how-spine"><div className={`how-spine-fill ${howDrawn ? "drawn" : ""}`} /></div>
        <div className="wrap">
          <div className="rv" style={{ textAlign: "center" }} ref={addRevRef}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>The Process</div>
            <h2 className="sh2" style={{ textAlign: "center" }}>Your Home in<br /><em>Four Simple Steps</em></h2>
          </div>
          <div className="how-grid rv d1" ref={addRevRef}>
            <div className="how-step">
              <div className="how-n">01</div>
              <div className="how-ib">🔍</div>
              <div className="how-t">Search &amp; Filter</div>
              <div className="how-d">Enter your locality, budget and property type. Our AI instantly surfaces the most relevant verified listings tailored to your commute and lifestyle.</div>
            </div>
            <div className="how-step">
              <div className="how-n">02</div>
              <div className="how-ib">📞</div>
              <div className="how-t">Connect Directly</div>
              <div className="how-d">Contact KYC-verified landlords directly — no middlemen, no brokers, no hidden commissions. Completely transparent pricing, always.</div>
            </div>
            <div className="how-step">
              <div className="how-n">03</div>
              <div className="how-ib">📅</div>
              <div className="how-t">Visit &amp; Verify</div>
              <div className="how-d">Schedule a property visit at your convenience. View verified photos and 360° tours before making any commitment whatsoever.</div>
            </div>
            <div className="how-step">
              <div className="how-n">04</div>
              <div className="how-ib">🏡</div>
              <div className="how-t">Move In!</div>
              <div className="how-d">Sign your rental agreement digitally, pay the deposit securely, and move into your perfect new home. It&apos;s that simple.</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="feat-sec">
        <div className="wrap">
          <div className="rv" ref={addRevRef}>
            <div className="eyebrow">Why Choose Us</div>
            <h2 className="sh2">Built Different,<br /><em>For Real Renters</em></h2>
          </div>
          <div className="feat-grid rv d1" ref={addRevRef}>
            <div className="fc" style={{ "--fcc": "var(--gold)", "--fcb": "var(--gold-b)", "--fcbg": "rgba(37,99,235,.025)" }}>
              <div className="fc-ic">🤖</div>
              <div className="fc-t">AI-Powered Matching</div>
              <div className="fc-d">Our ML engine analyses your commute, budget, lifestyle and browsing history to surface properties you&apos;ll genuinely love — not just keyword matches.</div>
            </div>
            <div className="fc" style={{ "--fcc": "var(--teal)", "--fcb": "var(--teal-b)", "--fcbg": "rgba(16,185,129,.025)" }}>
              <div className="fc-ic">✅</div>
              <div className="fc-t">100% Verified</div>
              <div className="fc-d">Every property is physically verified by our ground team before going live. Real photos, accurate pricing, valid KYC documents — guaranteed every time.</div>
            </div>
            <div className="fc wide" style={{ "--fcc": "var(--gold)", "--fcb": "var(--gold-b)", "--fcbg": "rgba(37,99,235,.02)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
                <div>
                  <div className="fc-ic">⚡</div>
                  <div className="fc-t">Zero Brokerage</div>
                  <div className="fc-d">We connect tenants and landlords directly — no broker fees, commissions or hidden charges. What you see is what you pay, every single time.</div>
                  <div className="fc-ns"><div><div className="fn-v">₹0</div><div className="fn-l">Brokerage fee</div></div></div>
                </div>
                <div>
                  <div className="fc-ic">🔒</div>
                  <div className="fc-t">Secure Platform</div>
                  <div className="fc-d">KYC-verified landlords, end-to-end encrypted communications, secure payments and 24/7 dispute resolution — keeping every transaction safe.</div>
                  <div className="fc-ns"><div><div className="fn-v">256-bit</div><div className="fn-l">Encryption</div></div><div><div className="fn-v">24/7</div><div className="fn-l">Support</div></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CITIES */}
      <section className="city-sec">
        <div className="wrap">
          <div className="rv" ref={addRevRef}>
            <div className="eyebrow">Coverage</div>
            <h2 className="sh2">Pan-India <em>Presence</em></h2>
          </div>
          <div className="city-grid rv d1" ref={addRevRef}>
            {CITIES.map((c) => (
              <Link className="cc" href={c.href} key={c.name}>
                <span className="cc-flag">{c.flag}</span><div className="cc-nm">{c.name}</div><div className="cc-ct">Explore →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="tst-sec">
        <div className="wrap">
          <div className="rv" style={{ textAlign: "center" }} ref={addRevRef}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>Tenant Stories</div>
            <h2 className="sh2" style={{ textAlign: "center" }}>What Our <em>Residents Say</em></h2>
          </div>
          <div className="tst-grid rv d1" ref={addRevRef}>
            {TESTIMONIALS.map((t) => (
              <div className="tc" key={t.name}>
                <div className="tc-st">★★★★★</div>
                <div className="tc-q">{t.quote}</div>
                <div className="tc-au">
                  <div className="tc-av" style={t.avatarBg ? { background: t.avatarBg } : undefined}>{t.avatar}</div>
                  <div><div className="tc-nm">{t.name}</div><div className="tc-rl">{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OWNER CTA */}
      <section className="own-sec">
        <div className="wrap">
          <div className="own-inner rv" ref={addRevRef}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 16 }}>For Property Owners</div>
              <h2 className="own-h2">List Your Property,<br />Reach <em>Genuine</em> Tenants</h2>
              <p className="own-p">Join India&apos;s fastest-growing rental platform. Receive verified tenant inquiries, manage bookings, track performance, and grow your rental income — all from one powerful dashboard.</p>
              <div className="own-perks">
                <div className="perk"><div className="perk-dot">✅</div>Free listing — no upfront costs, ever</div>
                <div className="perk"><div className="perk-dot">🔐</div>KYC verification builds instant tenant trust</div>
                <div className="perk"><div className="perk-dot">📊</div>Real-time analytics with booking insights</div>
                <div className="perk"><div className="perk-dot">📞</div>Direct tenant connections, zero broker cuts</div>
                <div className="perk"><div className="perk-dot">⚡</div>Go live in under 30 minutes</div>
              </div>
              <div className="own-ctas">
                <Link className="cta-main" href="/post-property">🏠 List Your Property Free</Link>
                <Link className="cta-sec" href="/profile">📋 Owner Dashboard</Link>
              </div>
            </div>
            <div className="mock">
              <div className="mock-bar">
                <div className="md md1" /><div className="md md2" /><div className="md md3" />
                <div className="mock-url">smartrentai.in/dashboard</div>
              </div>
              <div className="mock-body">
                <div className="mock-stats">
                  <div className="ms"><div className="msv" style={{ color: "var(--gold)" }}>—</div><div className="msl">Inquiries</div></div>
                  <div className="ms"><div className="msv" style={{ color: "var(--teal)" }}>—</div><div className="msl">Bookings</div></div>
                  <div className="ms"><div className="msv" style={{ color: "var(--gold-lt)" }}>—</div><div className="msl">Revenue</div></div>
                </div>
                <div className="mock-chart">
                  {[32, 48, 38, 65, 78, 58, 85, 68, 92, 72, 88, 95].map((h, i) => (
                    <div className="mbar-b" style={{ height: `${h}%` }} key={i} />
                  ))}
                </div>
                <div>
                  <div className="mrow"><div className="mrn">Your listing</div><span className="mrs mrs-new">Live</span><div className="mrt">now</div></div>
                  <div className="mrow"><div className="mrn">Inquiries</div><span className="mrs mrs-ok">Pending</span><div className="mrt">—</div></div>
                  <div className="mrow"><div className="mrn">Visits</div><span className="mrs mrs-ok">Schedule</span><div className="mrt">—</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-sec">
        <div className="wrap">
          <div className="rv" style={{ textAlign: "center" }} ref={addRevRef}>
            <div className="eyebrow" style={{ justifyContent: "center" }}>Got Questions?</div>
            <h2 className="sh2" style={{ textAlign: "center" }}>Frequently Asked <em>Questions</em></h2>
          </div>
          <div className="faq-list rv d1" ref={addRevRef}>
            {FAQS.map((f, i) => (
              <div className={`faq-item ${faqOpen === i ? "open" : ""}`} key={f.q}>
                <button className="faq-q" onClick={() => setFaqOpen((cur) => (cur === i ? null : i))}>
                  {f.q}<span className="faq-q-ic">+</span>
                </button>
                <div className="faq-a" style={{ maxHeight: faqOpen === i ? 300 : 0 }}>
                  <div className="faq-a-in">{f.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section className="blog-sec">
        <div className="wrap">
          <div className="svc-header-row rv" ref={addRevRef}>
            <div>
              <div className="eyebrow">Renter&apos;s Journal</div>
              <h2 className="sh2">Latest From <em>Our Blog</em></h2>
            </div>
            <Link className="svc-cta-link" href="/blog">View all posts →</Link>
          </div>
          <div className="blog-grid rv d1" ref={addRevRef}>
            {BLOG_POSTS.map((b) => (
              <Link className="bc" href="/blog" key={b.title}>
                <div className="bc-img skel" style={{ backgroundImage: `url('${b.img}')` }}>
                  <span className="bc-tag">{b.tag}</span>
                </div>
                <div className="bc-body">
                  <div className="bc-meta">{b.meta}</div>
                  <div className="bc-title">{b.title}</div>
                  <div className="bc-desc">{b.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MOBILE APP PROMO */}
      <section className="app-sec">
        <div className="wrap app-inner">
          <div className="rv" ref={addRevRef}>
            <div className="eyebrow app-eyebrow">Coming To Mobile</div>
            <h2 className="app-h2">Take Your Rental<br />Search <em>Everywhere</em></h2>
            <p className="app-p">Search, shortlist and chat with verified owners on the go. The SmartRent AI app brings the same zero-brokerage, AI-matched experience to your pocket.</p>
            <div className="app-badges">
              <a className="app-badge" href="#" onClick={(e) => { e.preventDefault(); showToast("📱 App launching soon — join the waitlist!"); }}>
                <span className="app-badge-ic">🍎</span>
                <span className="app-badge-txt"><div className="app-badge-s">Coming soon on the</div><div className="app-badge-b">App Store</div></span>
              </a>
              <a className="app-badge" href="#" onClick={(e) => { e.preventDefault(); showToast("📱 App launching soon — join the waitlist!"); }}>
                <span className="app-badge-ic">▶️</span>
                <span className="app-badge-txt"><div className="app-badge-s">Coming soon on</div><div className="app-badge-b">Google Play</div></span>
              </a>
            </div>
          </div>
          <div className="rv d1 app-visual" ref={addRevRef}>
            <div className="app-phone">
              <div className="app-phone-screen">
                <div className="app-phone-logo">💎</div>
                <div className="app-phone-txt">SmartRent AI<br /><span style={{ fontWeight: 400, fontSize: 11, opacity: 0.85 }}>Rentals · Services</span></div>
              </div>
            </div>
            <div className="app-float-card c1"><span className="afc-ic">✅</span><span><div className="afc-txt-t">Verified PG</div><div className="afc-txt-s">Kondapur, Hyderabad</div></span></div>
            <div className="app-float-card c2"><span className="afc-ic">🔧</span><span><div className="afc-txt-t">Plumber booked</div><div className="afc-txt-s">Arriving in 40 min</div></span></div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="nl-sec">
        <div className="wrap">
          <div className="nl-inner rv" ref={addRevRef}>
            <div>
              <div className="eyebrow">Stay Updated</div>
              <div className="nl-t">New Listings in Your Inbox</div>
              <div className="nl-s">Daily alerts for verified properties matching your criteria. Unsubscribe any time.</div>
            </div>
            <div className="nl-form">
              <input className="nl-in" type="email" placeholder="your@email.com" aria-label="Email address" value={nlEmail} onChange={(e) => setNlEmail(e.target.value)} />
              <button className="nl-btn" onClick={subNL}>🔔 Subscribe Free</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="fg">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 16 }}>
                <div className="nav-gem" style={{ width: 30, height: 30, fontSize: 14 }}>💎</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}><span className="nw-sr" style={{ fontSize: 17, color: "#fff" }}>SmartRent</span><span className="nw-ai">AI</span></div>
              </div>
              <p className="fb-desc">India&apos;s most intelligent rental platform. AI-powered matching for PGs, hostels, flats &amp; co-living — zero brokerage, fully verified.</p>
              <div className="socials">
                <a className="soc" href="#" title="Twitter">𝕏</a>
                <a className="soc" href="#" title="Instagram">📸</a>
                <a className="soc" href="#" title="LinkedIn">in</a>
                <a className="soc" href="#" title="YouTube">▶</a>
              </div>
            </div>
            <div>
              <div className="ffc-t">For Tenants</div>
              <Link className="fl" href="/pgs-hostels">→ Browse PG &amp; Hostels</Link>
              <Link className="fl" href="/properties">→ Flat Search</Link>
              <Link className="fl" href="/properties">→ Co-living Spaces</Link>
              <Link className="fl" href="/tenant-guide">→ Tenant Guide</Link>
              <Link className="fl" href="/calculator">→ Rent Calculator</Link>
            </div>
            <div>
              <div className="ffc-t">Home Services</div>
              <Link className="fl" href="/plumber">→ Plumber</Link>
              <Link className="fl" href="/electrician">→ Electrician</Link>
              <Link className="fl" href="/carpenter">→ Carpenter</Link>
              <Link className="fl" href="/painter">→ Painter</Link>
              <Link className="fl" href="/movers-packers">→ Movers &amp; Packers</Link>
              <Link className="fl" href="/home-cleaner">→ Home Cleaner</Link>
            </div>
            <div>
              <div className="ffc-t">Company</div>
              <Link className="fl" href="/about-us">→ About Us</Link>
              <Link className="fl" href="/post-property">→ List Property Free</Link>
              <Link className="fl" href="/profile">→ Owner Dashboard</Link>
              <Link className="fl" href="/plans">→ Pricing Plans</Link>
              <Link className="fl" href="/privacy">→ Privacy Policy</Link>
              <Link className="fl" href="/contact">→ Contact Us</Link>
            </div>
          </div>
          <div className="foot-bot">
            <div className="foot-copy">
              © 2025–2026 SmartRent AI. All rights reserved. Built with ❤️ in India.<br />
              <Link href="/privacy-policy">Privacy Policy</Link> · <Link href="/privacy-policy">Terms of Service</Link>
            </div>
            <div className="foot-badges">
              <span className="fbdg">GDPR READY</span><span className="fbdg">IT ACT 2000</span><span className="fbdg">DPDP 2023</span><span className="fbdg">SSL SECURED</span>
            </div>
          </div>
        </div>
      </footer>

      <Link className="fab" href="/post-property"><span>➕</span><span className="fab-lbl">List Property</span></Link>

      <button className={`bt-top ${showBackTop ? "show" : ""}`} onClick={scrollToTop} aria-label="Back to top">↑</button>

      <button className="chat-widget" onClick={() => setChatOpen((o) => !o)} aria-label="Open chat">💬</button>
      <div className={`chat-panel ${chatOpen ? "show" : ""}`}>
        <div className="chat-head">
          <div className="chat-head-t">Need help?</div>
          <div className="chat-head-s">We usually reply within minutes</div>
        </div>
        <div className="chat-body">Have a question about a property, booking, or your listing? Our team is here to help.</div>
        <Link className="chat-cta" href="/contact">Start a conversation →</Link>
      </div>
    </div>
  );
}
