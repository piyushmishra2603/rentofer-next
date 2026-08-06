"use client";

import { useEffect, useRef } from "react";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import "./page.css";

const PROP_TYPES = { flat: "🏡", pg: "🛏️", hostel: "🏠", coliving: "🤝", commercial: "🏢", villa: "🏰" };
const TYPE_LABELS = { flat: "Flat", pg: "PG", hostel: "Hostel", coliving: "Co-living", commercial: "Commercial", villa: "Villa" };
const TYPE_BG = {
  flat: "linear-gradient(145deg,#e8ede4,#d4dcc8)",
  pg: "linear-gradient(145deg,#e8e4dc,#dcd4c8)",
  hostel: "linear-gradient(145deg,#e4e8ec,#c8d4dc)",
  coliving: "linear-gradient(145deg,#e8e4ec,#d4c8dc)",
  commercial: "linear-gradient(145deg,#e4e0d8,#ccc4b8)",
  villa: "linear-gradient(145deg,#e8ece4,#d4dcc8)",
};

const STATIC_PROPS = [
  { id: 1, type: "flat", title: "Spacious 2BHK with Modular Kitchen & Balcony", city: "Hyderabad", area: "Kondapur", price: 18500, deposit: 37000, rating: 4.8, reviews: 142, furnish: "Semi-Furnished", bhk: "2BHK", floor: "4th Floor", size: 950, badges: [{ c: "pb-v", l: "✓ VERIFIED" }, { c: "pb-p", l: "★ PREMIUM" }], amenities: ["WiFi", "AC", "Parking", "Power Backup"], whatsapp: "+919876543210", available: true, isNew: false, views: "1.2K", phone: "+91 98765 43210", owner: "Rajesh Kumar", enq: 18, featured: true },
  { id: 2, type: "flat", title: "3BHK Luxury Flat | Gated Society with Pool", city: "Bangalore", area: "Whitefield", price: 38000, deposit: 76000, rating: 4.9, reviews: 88, furnish: "Fully Furnished", bhk: "3BHK", floor: "8th Floor", size: 1450, badges: [{ c: "pb-v", l: "✓ VERIFIED" }, { c: "pb-p", l: "★ PREMIUM" }], amenities: ["Pool", "Gym", "WiFi", "Parking", "Security"], whatsapp: "+919876543211", available: true, isNew: false, views: "3.1K", phone: "+91 98765 43211", owner: "Anita Sharma", enq: 34 },
  { id: 3, type: "flat", title: "Cozy 1BHK Near Metro Station | Ready to Move", city: "Hyderabad", area: "Madhapur", price: 13000, deposit: 26000, rating: 4.6, reviews: 56, furnish: "Semi-Furnished", bhk: "1BHK", floor: "2nd Floor", size: 620, badges: [{ c: "pb-v", l: "✓ VERIFIED" }, { c: "pb-n", l: "✨ NEW" }], amenities: ["Metro 0.3km", "WiFi", "Security"], whatsapp: "+919876543212", available: true, isNew: true, views: "890", phone: "+91 98765 43212", owner: "Suresh Nair", enq: 9 },
  { id: 4, type: "flat", title: "2BHK Villa-Style Flat | Jubilee Hills", city: "Hyderabad", area: "Jubilee Hills", price: 32000, deposit: 64000, rating: 4.7, reviews: 73, furnish: "Fully Furnished", bhk: "2BHK", floor: "Ground Floor", size: 1200, badges: [{ c: "pb-v", l: "✓ VERIFIED" }, { c: "pb-h", l: "🔥 HOT" }], amenities: ["Garden", "Parking", "AC", "Security"], whatsapp: "+919876543213", available: true, isNew: false, views: "2.4K", phone: "+91 98765 43213", owner: "Priya Reddy", enq: 22 },
  { id: 5, type: "flat", title: "Budget 1BHK | Ideal for Bachelor Working Professionals", city: "Pune", area: "Baner", price: 10500, deposit: 21000, rating: 4.4, reviews: 38, furnish: "Semi-Furnished", bhk: "1BHK", floor: "3rd Floor", size: 540, badges: [{ c: "pb-v", l: "✓ VERIFIED" }], amenities: ["WiFi", "Power Backup"], whatsapp: "+919876543214", available: true, isNew: false, views: "640", phone: "+91 98765 43214", owner: "Mohan Kulkarni", enq: 7 },
  { id: 6, type: "flat", title: "4BHK Duplex | Premium Gated Community", city: "Mumbai", area: "Andheri West", price: 82000, deposit: 164000, rating: 4.9, reviews: 121, furnish: "Fully Furnished", bhk: "4BHK", floor: "14th Floor", size: 2200, badges: [{ c: "pb-v", l: "✓ VERIFIED" }, { c: "pb-p", l: "★ PREMIUM" }], amenities: ["Pool", "Gym", "Concierge", "Parking", "Security"], whatsapp: "+919876543215", available: true, isNew: false, views: "4.8K", phone: "+91 98765 43215", owner: "Ramesh Properties", enq: 51 },
  { id: 7, type: "flat", title: "3BHK Semi-Furnished Near School & Hospital", city: "Chennai", area: "Anna Nagar", price: 28000, deposit: 56000, rating: 4.5, reviews: 62, furnish: "Semi-Furnished", bhk: "3BHK", floor: "5th Floor", size: 1350, badges: [{ c: "pb-v", l: "✓ VERIFIED" }], amenities: ["Parking", "Security", "Power Backup"], whatsapp: "+919876543216", available: false, isNew: false, views: "1.1K", phone: "+91 98765 43216", owner: "Kavya Iyer", enq: 12 },
  { id: 8, type: "flat", title: "Studio Apartment | Fully Furnished | IT Park Walk", city: "Hyderabad", area: "Gachibowli", price: 15000, deposit: 30000, rating: 4.7, reviews: 94, furnish: "Fully Furnished", bhk: "Studio", floor: "6th Floor", size: 380, badges: [{ c: "pb-v", l: "✓ VERIFIED" }, { c: "pb-h", l: "🔥 HOT" }], amenities: ["WiFi", "AC", "Gym", "Metro 0.6km"], whatsapp: "+919876543217", available: true, isNew: false, views: "2.2K", phone: "+91 98765 43217", owner: "Arun Singh", enq: 29 },
  { id: 9, type: "pg", title: "Premium PG for Working Men | AC Rooms, Meals", city: "Hyderabad", area: "HITEC City", price: 8500, deposit: 17000, rating: 4.6, reviews: 89, furnish: "Fully Furnished", bhk: "Single Room", floor: "2nd Floor", size: 180, badges: [{ c: "pb-v", l: "✓ VERIFIED" }, { c: "pb-h", l: "🔥 HOT" }], amenities: ["Meals", "WiFi", "AC", "Laundry", "Power Backup"], whatsapp: "+919876543218", available: true, isNew: false, views: "820", phone: "+91 98765 43218", owner: "PG Universe" },
  { id: 10, type: "pg", title: "Girls Only PG | Premium Rooms | 24/7 Security", city: "Bangalore", area: "Koramangala", price: 11000, deposit: 22000, rating: 4.8, reviews: 134, furnish: "Fully Furnished", bhk: "Double Sharing", floor: "All Floors", size: 200, badges: [{ c: "pb-v", l: "✓ VERIFIED" }, { c: "pb-p", l: "★ PREMIUM" }, { c: "pb-f", l: "👩 Girls Only" }], amenities: ["Meals", "WiFi", "AC", "Security", "Lounge"], whatsapp: "+919876543219", available: true, isNew: false, views: "3.2K", phone: "+91 98765 43219", owner: "She Stays" },
  { id: 11, type: "pg", title: "Budget PG | Single Rooms | Excellent Location", city: "Delhi NCR", area: "Sector 62, Noida", price: 5500, deposit: 11000, rating: 4.3, reviews: 47, furnish: "Furnished", bhk: "Single Room", floor: "Ground + 1st", size: 150, badges: [{ c: "pb-v", l: "✓ VERIFIED" }], amenities: ["WiFi", "Security", "Common Kitchen"], whatsapp: "+919876543220", available: true, isNew: false, views: "490", phone: "+91 98765 43220", owner: "Kiran Homes" },
  { id: 12, type: "pg", title: "Executive PG | Private Rooms | IT Professionals", city: "Pune", area: "Hinjewadi", price: 9500, deposit: 19000, rating: 4.7, reviews: 78, furnish: "Fully Furnished", bhk: "Private Room", floor: "3rd Floor", size: 220, badges: [{ c: "pb-v", l: "✓ VERIFIED" }, { c: "pb-n", l: "✨ NEW" }], amenities: ["Meals", "WiFi", "AC", "Parking", "Netflix"], whatsapp: "+919876543221", available: true, isNew: true, views: "780", phone: "+91 98765 43221", owner: "Elite PG" },
  { id: 13, type: "pg", title: "Co-ed PG | Near Metro | Modern Amenities", city: "Mumbai", area: "Andheri East", price: 12000, deposit: 24000, rating: 4.5, reviews: 55, furnish: "Fully Furnished", bhk: "Various", floor: "Multiple", size: 180, badges: [{ c: "pb-v", l: "✓ VERIFIED" }], amenities: ["Meals", "WiFi", "AC", "Security"], whatsapp: "+919876543222", available: false, isNew: false, views: "560", phone: "+91 98765 43222", owner: "Mumbai PG Network" },
  { id: 14, type: "pg", title: "Triple Sharing PG | Budget Friendly | Clean Rooms", city: "Hyderabad", area: "Ameerpet", price: 4500, deposit: 9000, rating: 4.2, reviews: 33, furnish: "Furnished", bhk: "Triple Sharing", floor: "1st Floor", size: 300, badges: [{ c: "pb-v", l: "✓ VERIFIED" }], amenities: ["WiFi", "Security", "Common Bath"], whatsapp: "+919876543223", available: true, isNew: false, views: "310", phone: "+91 98765 43223", owner: "Budget PG Hub" },
  { id: 15, type: "hostel", title: "Modern Hostel | Dormitory Rooms | Student Friendly", city: "Hyderabad", area: "Begumpet", price: 5000, deposit: 10000, rating: 4.5, reviews: 212, furnish: "Furnished", bhk: "4-Bed Dorm", floor: "All Floors", size: null, badges: [{ c: "pb-v", l: "✓ VERIFIED" }, { c: "pb-h", l: "🔥 POPULAR" }], amenities: ["WiFi", "Lounge", "AC", "Security", "Rooftop"], whatsapp: "+919876543224", available: true, isNew: false, views: "1.9K", phone: "+91 98765 43224", owner: "StayEasy Hostels" },
  { id: 16, type: "hostel", title: "Backpacker Hostel | Private & Dorm | City Centre", city: "Bangalore", area: "MG Road", price: 3500, deposit: 7000, rating: 4.6, reviews: 389, furnish: "Furnished", bhk: "6-Bed Dorm", floor: "2nd Floor", size: null, badges: [{ c: "pb-v", l: "✓ VERIFIED" }, { c: "pb-n", l: "✨ NEW" }], amenities: ["WiFi", "Common Kitchen", "Lounge", "Events"], whatsapp: "+919876543225", available: true, isNew: true, views: "4.5K", phone: "+91 98765 43225", owner: "Urban Stay" },
  { id: 17, type: "hostel", title: "Premium Student Hostel | Near University Campus", city: "Mumbai", area: "Powai", price: 6500, deposit: 13000, rating: 4.7, reviews: 156, furnish: "Fully Furnished", bhk: "Private + Dorm", floor: "Multiple", size: null, badges: [{ c: "pb-v", l: "✓ VERIFIED" }, { c: "pb-p", l: "★ PREMIUM" }], amenities: ["Meals", "WiFi", "Study Room", "Gym", "AC"], whatsapp: "+919876543226", available: true, isNew: false, views: "2.1K", phone: "+91 98765 43226", owner: "Campus Stays" },
  { id: 18, type: "hostel", title: "Working Professionals Hostel | Clean & Safe", city: "Delhi NCR", area: "Gurgaon Sector 29", price: 7000, deposit: 14000, rating: 4.4, reviews: 92, furnish: "Furnished", bhk: "2-4 Bed Dorm", floor: "All Floors", size: null, badges: [{ c: "pb-v", l: "✓ VERIFIED" }], amenities: ["WiFi", "Power Backup", "Security", "Kitchen"], whatsapp: "+919876543227", available: false, isNew: false, views: "680", phone: "+91 98765 43227", owner: "ProStay" },
  { id: 19, type: "coliving", title: "Luxury Co-living | Private Rooms | Community Events", city: "Bangalore", area: "Indiranagar", price: 22000, deposit: 44000, rating: 4.9, reviews: 201, furnish: "Fully Furnished", bhk: "Private Studio", floor: "Various", size: 320, badges: [{ c: "pb-v", l: "✓ VERIFIED" }, { c: "pb-p", l: "★ PREMIUM" }], amenities: ["WiFi", "Gym", "Coworking", "Events", "Café", "Pool"], whatsapp: "+919876543228", available: true, isNew: false, views: "5.6K", phone: "+91 98765 43228", owner: "Colive India" },
  { id: 20, type: "coliving", title: "Smart Co-living | IoT Enabled | Young Professionals", city: "Hyderabad", area: "Banjara Hills", price: 19000, deposit: 38000, rating: 4.8, reviews: 88, furnish: "Fully Furnished", bhk: "Private Room", floor: "3rd–8th Floor", size: 280, badges: [{ c: "pb-v", l: "✓ VERIFIED" }, { c: "pb-n", l: "✨ NEW" }], amenities: ["Smart WiFi", "Coworking", "Rooftop", "EV Parking"], whatsapp: "+919876543229", available: true, isNew: true, views: "3.4K", phone: "+91 98765 43229", owner: "SmartNest" },
  { id: 21, type: "coliving", title: "Budget Co-living | Shared Rooms | Great Community", city: "Pune", area: "Viman Nagar", price: 12000, deposit: 24000, rating: 4.5, reviews: 67, furnish: "Semi-Furnished", bhk: "Shared Room", floor: "2nd Floor", size: 220, badges: [{ c: "pb-v", l: "✓ VERIFIED" }], amenities: ["WiFi", "Community Kitchen", "Events", "Lounge"], whatsapp: "+919876543230", available: true, isNew: false, views: "1.1K", phone: "+91 98765 43230", owner: "Casa Coliv" },
  { id: 22, type: "commercial", title: "Grade-A Office Space | Plug & Play | IT Park", city: "Hyderabad", area: "Gachibowli", price: 290000, deposit: 870000, rating: 4.8, reviews: 42, furnish: "Plug & Play", bhk: "4,800 sqft", floor: "12th Floor", size: 4800, badges: [{ c: "pb-v", l: "✓ VERIFIED" }, { c: "pb-p", l: "★ PREMIUM" }], amenities: ["100% Power Backup", "Fibre", "Parking ×40", "Cafeteria", "CCTV"], whatsapp: "+919040234567", available: true, isNew: false, views: "640", phone: "+91 90402 34567", owner: "Skyline Properties" },
  { id: 23, type: "commercial", title: "Prime Retail Shop | High Footfall | Jubilee Hills", city: "Hyderabad", area: "Jubilee Hills", price: 145000, deposit: 435000, rating: 4.5, reviews: 28, furnish: "Bare Shell", bhk: "2,200 sqft", floor: "Ground Floor", size: 2200, badges: [{ c: "pb-v", l: "✓ VERIFIED" }, { c: "pb-h", l: "🔥 HOT" }], amenities: ["Street Parking", "3-Phase Power", "Signage Rights"], whatsapp: "+919040234568", available: true, isNew: false, views: "890", phone: "+91 90402 34568", owner: "Nexus Realty" },
  { id: 24, type: "commercial", title: "Modern Co-working Space | Flexible Desks | Madhapur", city: "Hyderabad", area: "Madhapur", price: 12000, deposit: 24000, rating: 4.7, reviews: 156, furnish: "Fully Fitted", bhk: "Per Seat", floor: "4th & 5th Floor", size: 200, badges: [{ c: "pb-v", l: "✓ VERIFIED" }], amenities: ["10Gbps WiFi", "Meeting Rooms", "Coffee Bar", "Printing"], whatsapp: "+919040234569", available: true, isNew: false, views: "2.1K", phone: "+91 90402 34569", owner: "The Collective" },
];

const BODY_HTML = `
<div class="bg-texture"></div>
<div class="pgbar" id="pgBar"></div>
<div class="toast" id="toast"></div>

<div class="wa-float" title="Chat on WhatsApp">
  <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
</div>

<div class="compare-bar" id="compareBar">
  <div style="font-family:'DM Serif Display',serif;font-size:16px;color:var(--ink);flex-shrink:0">Compare</div>
  <div class="cb-slots" id="compareSlots">
    <div class="cb-slot" id="cs1">+ Add property</div>
    <div class="cb-slot" id="cs2">+ Add property</div>
    <div class="cb-slot" id="cs3">+ Add property</div>
  </div>
  <button class="cb-compare-btn" onclick="doCompare()">Compare Now →</button>
  <button class="cb-close" onclick="clearCompare()">✕ Clear</button>
</div>

<div class="mob-drawer" id="mobDrawer">
  <a class="mob-l" href="/">🏠 Home</a>
  <a class="mob-l" href="/properties" style="color:var(--terra)">🏘️ All Properties</a>
  <a class="mob-l" href="/pg-hostel-listings">🛏 PG &amp; Hostels</a>
  <a class="mob-l" href="/commercial">🏢 Commercial</a>
  <a class="mob-l" href="/services">🔧 Services</a>
  <a class="mob-l" href="/owner-guide">📋 Owner Guide</a>
  <hr style="border:none;border-top:1.5px solid var(--div);margin:8px 0">
  <a class="nb nb-out" href="/login" style="text-decoration:none;justify-content:center">Sign In</a>
  <a class="nb nb-terra" href="/post-property" style="text-decoration:none;justify-content:center;margin-top:8px">+ List Property</a>
</div>

<nav class="nav" id="navbar">
  <a href="/" class="brand">
    <div class="bgem">💎</div>
    <span class="bname">SmartRent<span class="bai">AI</span></span>
  </a>
  <div class="nav-links">
    <a class="nl" href="/">Home</a>
    <a class="nl on" href="/properties">All Properties</a>
    <a class="nl" href="/pg-hostel-listings">PG &amp; Hostels</a>
    <a class="nl" href="/commercial">Commercial</a>
    <a class="nl" href="/services">Services</a>
    <a class="nl" href="/about">About</a>
  </div>
  <div class="nav-r">
    <a class="nb nb-out" href="/login" style="text-decoration:none">Sign In</a>
    <a class="nb nb-terra" href="/post-property" style="text-decoration:none">+ List Property</a>
    <button class="mob-btn" onclick="toggleMob()" id="mobBtn">☰</button>
  </div>
</nav>

<div class="page-hero">
  <div class="ph-inner">
    <div class="ph-top">
      <div class="ph-left">
        <div class="ph-eyebrow">Verified Listings · India</div>
        <h1 class="ph-title">Find Your<br><em>Perfect Space</em></h1>
        <p class="ph-sub">Flats · PGs · Hostels · Co-living · Commercial — all in one place. Zero brokerage.</p>
      </div>
      <div class="ph-stats-row">
        <div class="phs"><div class="phs-v" id="stat-listings">0</div><div class="phs-l">Properties</div></div>
        <div class="phs"><div class="phs-v">₹0</div><div class="phs-l">Brokerage</div></div>
        <div class="phs"><div class="phs-v" id="stat-cities">0</div><div class="phs-l">Cities</div></div>
        <div class="phs"><div class="phs-v" id="stat-owners">0</div><div class="phs-l">Verified Owners</div></div>
      </div>
    </div>

    <div class="search-bar rv">
      <div class="sf">
        <span class="sf-ic">🔍</span>
        <input type="text" id="searchQ" placeholder="Search area, locality, city, landmark…">
      </div>
      <div class="sf-sep"></div>
      <div class="sf" style="max-width:180px">
        <span class="sf-ic">🏙️</span>
        <select id="searchCity">
          <option value="">Any City</option>
          <option>Hyderabad</option><option>Bangalore</option><option>Mumbai</option>
          <option>Delhi NCR</option><option>Chennai</option><option>Pune</option>
          <option>Kolkata</option><option>Noida</option><option>Ahmedabad</option>
        </select>
      </div>
      <div class="sf-sep"></div>
      <div class="sf" style="max-width:165px">
        <span class="sf-ic">🏠</span>
        <select id="searchType">
          <option value="">Any Type</option>
          <option value="flat">Flat / Apartment</option>
          <option value="pg">PG / Paying Guest</option>
          <option value="hostel">Hostel</option>
          <option value="coliving">Co-living</option>
          <option value="commercial">Commercial</option>
          <option value="villa">Villa / Bungalow</option>
        </select>
      </div>
      <button class="search-go" onclick="applyAllFilters()">
        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        Search
      </button>
    </div>

    <div class="cat-tabs rv d1" id="catTabs">
      <button class="cat-tab on" data-cat="all" onclick="setCat(this,'all')">🏘️ All <span class="ct-count">24</span></button>
      <button class="cat-tab" data-cat="flat" onclick="setCat(this,'flat')">🏡 Flats <span class="ct-count">8</span></button>
      <button class="cat-tab" data-cat="pg" onclick="setCat(this,'pg')">🛏️ PG <span class="ct-count">6</span></button>
      <button class="cat-tab" data-cat="hostel" onclick="setCat(this,'hostel')">🏠 Hostel <span class="ct-count">4</span></button>
      <button class="cat-tab" data-cat="coliving" onclick="setCat(this,'coliving')">🤝 Co-living <span class="ct-count">3</span></button>
      <button class="cat-tab" data-cat="commercial" onclick="setCat(this,'commercial')">🏢 Commercial <span class="ct-count">3</span></button>
    </div>
  </div>
</div>

<div class="main-layout">

  <aside class="filter-sidebar">
    <div class="filter-sticky">

      <div class="filter-card rv">
        <div class="fc-head">
          <div class="fc-title">Filters</div>
          <button class="fc-reset" onclick="resetFilters()">Reset All</button>
        </div>

        <div class="filter-group">
          <div class="filter-label">Monthly Budget</div>
          <div class="range-row"><span>₹2,000</span><span class="range-val" id="budgetLabel">₹50,000</span></div>
          <input type="range" class="frange" id="budgetRange" min="2000" max="200000" value="50000" step="1000" onInput="updateBudget(this.value)">
        </div>

        <div class="filter-group">
          <div class="filter-label">Property Type</div>
          <div class="fcheck on" onclick="toggleCheck(this,'type-flat')" data-filter="type-flat"><div class="fcheck-box">✓</div><span class="fcheck-lbl">Flat / Apartment</span><span class="fcheck-count">8</span></div>
          <div class="fcheck" onclick="toggleCheck(this,'type-pg')" data-filter="type-pg"><div class="fcheck-box"></div><span class="fcheck-lbl">PG / Paying Guest</span><span class="fcheck-count">6</span></div>
          <div class="fcheck on" onclick="toggleCheck(this,'type-hostel')" data-filter="type-hostel"><div class="fcheck-box">✓</div><span class="fcheck-lbl">Hostel</span><span class="fcheck-count">4</span></div>
          <div class="fcheck" onclick="toggleCheck(this,'type-coliving')" data-filter="type-coliving"><div class="fcheck-box"></div><span class="fcheck-lbl">Co-living</span><span class="fcheck-count">3</span></div>
          <div class="fcheck" onclick="toggleCheck(this,'type-commercial')" data-filter="type-commercial"><div class="fcheck-box"></div><span class="fcheck-lbl">Commercial</span><span class="fcheck-count">3</span></div>
        </div>

        <div class="filter-group">
          <div class="filter-label">BHK / Rooms</div>
          <div class="fcheck" onclick="toggleCheck(this,'bhk-1')" data-filter="bhk-1"><div class="fcheck-box"></div><span class="fcheck-lbl">1 BHK / 1 Room</span><span class="fcheck-count">7</span></div>
          <div class="fcheck" onclick="toggleCheck(this,'bhk-2')" data-filter="bhk-2"><div class="fcheck-box"></div><span class="fcheck-lbl">2 BHK / Shared</span><span class="fcheck-count">9</span></div>
          <div class="fcheck" onclick="toggleCheck(this,'bhk-3')" data-filter="bhk-3"><div class="fcheck-box"></div><span class="fcheck-lbl">3+ BHK</span><span class="fcheck-count">5</span></div>
          <div class="fcheck" onclick="toggleCheck(this,'bhk-studio')" data-filter="bhk-studio"><div class="fcheck-box"></div><span class="fcheck-lbl">Studio / Bachelor</span><span class="fcheck-count">3</span></div>
        </div>

        <div class="filter-group">
          <div class="filter-label">Furnishing</div>
          <div class="fcheck" onclick="toggleCheck(this,'furn-full')" data-filter="furn-full"><div class="fcheck-box"></div><span class="fcheck-lbl">Fully Furnished</span><span class="fcheck-count">11</span></div>
          <div class="fcheck" onclick="toggleCheck(this,'furn-semi')" data-filter="furn-semi"><div class="fcheck-box"></div><span class="fcheck-lbl">Semi-Furnished</span><span class="fcheck-count">9</span></div>
          <div class="fcheck" onclick="toggleCheck(this,'furn-bare')" data-filter="furn-bare"><div class="fcheck-box"></div><span class="fcheck-lbl">Unfurnished</span><span class="fcheck-count">4</span></div>
        </div>

        <div class="filter-group">
          <div class="filter-label">Gender Preference</div>
          <div class="fcheck" onclick="toggleCheck(this,'gen-any')" data-filter="gen-any"><div class="fcheck-box"></div><span class="fcheck-lbl">Any / Family</span></div>
          <div class="fcheck" onclick="toggleCheck(this,'gen-m')" data-filter="gen-m"><div class="fcheck-box"></div><span class="fcheck-lbl">Boys / Male Only</span></div>
          <div class="fcheck" onclick="toggleCheck(this,'gen-f')" data-filter="gen-f"><div class="fcheck-box"></div><span class="fcheck-lbl">Girls / Female Only</span></div>
        </div>
      </div>

      <div class="filter-card rv d1">
        <div class="fc-head"><div class="fc-title">Must-Have Amenities</div></div>
        <div class="ftoggle" id="ft-wifi" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">📶 WiFi Included</span><div class="ftoggle-sw"></div></div>
        <div class="ftoggle" id="ft-ac" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">❄️ Air Conditioning</span><div class="ftoggle-sw"></div></div>
        <div class="ftoggle" id="ft-parking" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">🅿️ Parking</span><div class="ftoggle-sw"></div></div>
        <div class="ftoggle" id="ft-meals" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">🍽️ Meals Included</span><div class="ftoggle-sw"></div></div>
        <div class="ftoggle" id="ft-gym" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">🏋️ Gym / Fitness</span><div class="ftoggle-sw"></div></div>
        <div class="ftoggle" id="ft-metro" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">🚇 Metro Nearby</span><div class="ftoggle-sw"></div></div>
        <div class="ftoggle" id="ft-pets" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">🐾 Pet Friendly</span><div class="ftoggle-sw"></div></div>
        <div class="ftoggle" id="ft-power" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">⚡ Power Backup</span><div class="ftoggle-sw"></div></div>
      </div>

      <div class="filter-card rv d2" style="background:linear-gradient(135deg,rgba(196,92,60,.06),rgba(196,92,60,.02))">
        <div class="fc-head"><div class="fc-title">Quality Filters</div></div>
        <div class="ftoggle on" id="ft-verified" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">✅ Verified Properties Only</span><div class="ftoggle-sw"></div></div>
        <div class="ftoggle" id="ft-instant" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">⚡ Instant Booking</span><div class="ftoggle-sw"></div></div>
        <div class="ftoggle" id="ft-new" onclick="toggleSwitch(this)"><span class="ftoggle-lbl">✨ New Listings Only</span><div class="ftoggle-sw"></div></div>
      </div>

    </div>
  </aside>

  <div>

    <div class="map-view-banner rv">
      <div>
        <div class="mvb-t">🗺️ Looking for properties by location?</div>
        <div style="font-size:12px;color:var(--sage);margin-top:2px">Switch to map view to see all properties on a neighbourhood map.</div>
      </div>
      <button class="mvb-btn" onclick="goToMaps()">Open Map View ↗</button>
    </div>

    <div class="sort-bar rv d1">
      <div class="sort-count"><em id="resultCount">24</em> properties found</div>
      <div class="sort-controls">
        <select class="fsel" id="sortSel">
          <option value="">Sort: Recommended</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="newest">Newest First</option>
          <option value="rating">Highest Rated</option>
          <option value="popular">Most Enquired</option>
        </select>
        <div class="view-toggle">
          <button class="vbtn on" id="gridBtn" onclick="setView('grid')" title="Grid">⊞</button>
          <button class="vbtn" id="listBtn" onclick="setView('list')" title="List">☰</button>
        </div>
      </div>
    </div>

    <div class="cards-grid rv d2" id="cardsGrid"></div>

  </div>

</div>
`;

export default function PropertiesPage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const $ = (id) => document.getElementById(id);
    const cleanupFns = [];

    /* ── STATE ── */
    let allProps = STATIC_PROPS;
    let activeCategory = "all";
    let currentView = "grid";
    let budgetMax = 50000;
    let savedIds = new Set();
    let compareIds = new Set();

    /* ── RENDER CARDS ── */
    function renderCards(data) {
      const grid = $("cardsGrid");
      $("resultCount").textContent = data.length;

      if (!data.length) {
        grid.innerHTML = `<div class="empty-state"><span class="es-ic">🏠</span><div class="es-t">No properties match your filters</div><div class="es-d">Try adjusting the filters or search with different keywords.</div></div>`;
        return;
      }

      grid.innerHTML = data
        .map((p, i) => {
          const emoji = PROP_TYPES[p.type] || "🏠";
          const bg = TYPE_BG[p.type] || TYPE_BG.flat;
          const isSaved = savedIds.has(p.id);
          const isCompare = compareIds.has(p.id);
          const avail = p.available !== false;
          const isFeatured = p.featured && currentView === "grid";

          const waLink = `https://wa.me/${(p.whatsapp || "+919999999999").replace(/[^\d]/g, "")}?text=${encodeURIComponent(
            `Hi! I'm interested in your property: ${p.title} listed on SmartRent AI. Could you please share more details?`
          )}`;

          const photoUrl = p.coverImage || (Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null);

          const cardImageInner = photoUrl
            ? `<img
                class="pcard-photo"
                src="${photoUrl}"
                alt="${p.title}"
                loading="lazy"
                onerror="this.style.display='none';this.nextElementSibling.style.display='block'"
              >
              <div class="pcard-emoji" style="display:none">${emoji}</div>`
            : `<div class="pcard-emoji">${emoji}</div>`;

          return `
          <div class="pcard ${isFeatured ? "featured" : ""}" style="animation-delay:${i * 0.05}s" onclick="goToDetail(${p.id})">
            <div class="pcard-img" style="background:${bg}">
              ${cardImageInner}
              <div class="pcard-img-ov"></div>
              <div class="pcard-badges">${(p.badges || []).map((b) => `<span class="pbdg ${b.c}">${b.l}</span>`).join("")}</div>
              <div class="pcard-save ${isSaved ? "saved" : ""}" onclick="event.stopPropagation();toggleSave(this,${p.id})" title="Save to wishlist">${isSaved ? "❤️" : "🤍"}</div>
              <div class="pcard-img-foot">
                <div class="pif-rat">⭐ ${p.rating} <span style="opacity:.6;font-size:10px">(${p.reviews})</span></div>
                <div class="pif-views">👁 ${p.views} views</div>
              </div>
            </div>

            <div class="pcard-body">
              <div class="pcard-type-row">
                <span class="pcard-type">${TYPE_LABELS[p.type] || p.type}</span>
                <span class="pcard-avail ${avail ? "" : "leased"}">${avail ? "Available" : "Leased"}</span>
              </div>
              <div class="pcard-title">${p.title}</div>
              <div class="pcard-loc">
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                ${p.area}, ${p.city}
              </div>
              <div class="pcard-specs">
                ${p.bhk ? `<div class="pspec"><span class="pspec-ic">🛏️</span>${p.bhk}</div>` : ""}
                ${p.size ? `<div class="pspec"><span class="pspec-ic">📐</span>${p.size} sqft</div>` : ""}
                ${p.floor ? `<div class="pspec"><span class="pspec-ic">🏢</span>${p.floor}</div>` : ""}
                ${p.furnish ? `<div class="pspec"><span class="pspec-ic">🪑</span>${p.furnish}</div>` : ""}
              </div>
              <div class="pcard-amens">${(p.amenities || []).slice(0, 5).map((a) => `<span class="pa">${a}</span>`).join("")}</div>

              <div class="pcard-footer">
                <div class="pcard-price">
                  <span class="cur">₹</span>${p.price.toLocaleString("en-IN")}
                  <span class="per">/ ${p.type === "commercial" ? "month (negotiable)" : "month"}</span>
                </div>
                <div class="pcard-actions">
                  <button class="btn-call" title="Compare" onclick="event.stopPropagation();toggleCompare(this,${p.id},'${p.title.substring(0, 28)}…')" style="${
            isCompare ? "background:var(--terra-d);border-color:var(--terra-b);color:var(--terra)" : ""
          }">⊞</button>
                  <a class="btn-wa" href="${waLink}" target="_blank" rel="noopener" onclick="event.stopPropagation();trackWA(${p.id})">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </a>
                  <a class="btn-view" href="/property-details?id=${p.id}&type=${p.type}" onclick="event.stopPropagation()">View →</a>
                </div>
              </div>
            </div>
          </div>`;
        })
        .join("");
    }

    /* ── FILTERS ── */
    function setCat(el, cat) {
      rootRef.current.querySelectorAll(".cat-tab").forEach((t) => t.classList.remove("on"));
      el.classList.add("on");
      activeCategory = cat;
      applyAllFilters();
    }

    function applyAllFilters() {
      let data = [...allProps];
      const q = $("searchQ").value.trim().toLowerCase();
      const city = $("searchCity").value;
      const type = $("searchType").value;
      const sort = $("sortSel").value;

      if (activeCategory !== "all") data = data.filter((p) => p.type === activeCategory);

      if (q)
        data = data.filter(
          (p) => p.title.toLowerCase().includes(q) || p.area.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)
        );

      if (city) data = data.filter((p) => p.city === city);
      if (type) data = data.filter((p) => p.type === type);

      data = data.filter((p) => p.price <= budgetMax);

      if (sort === "price_asc") data.sort((a, b) => a.price - b.price);
      else if (sort === "price_desc") data.sort((a, b) => b.price - a.price);
      else if (sort === "newest") data.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      else if (sort === "rating") data.sort((a, b) => b.rating - a.rating);
      else if (sort === "popular") data.sort((a, b) => b.reviews - a.reviews);

      renderCards(data);
    }

    function liveSearch() {
      applyAllFilters();
    }

    function resetFilters() {
      $("searchQ").value = "";
      $("searchCity").value = "";
      $("searchType").value = "";
      $("sortSel").value = "";
      budgetMax = 50000;
      updateBudget(50000);
      rootRef.current.querySelectorAll(".fcheck").forEach((c) => {
        c.classList.remove("on");
        c.querySelector(".fcheck-box").textContent = "";
      });
      rootRef.current.querySelectorAll(".ftoggle").forEach((t) => t.classList.remove("on"));
      activeCategory = "all";
      const tabs = rootRef.current.querySelectorAll(".cat-tab");
      tabs.forEach((t) => t.classList.remove("on"));
      if (tabs[0]) tabs[0].classList.add("on");
      applyAllFilters();
      toast("🔄 Filters reset");
    }

    function toggleCheck(el) {
      el.classList.toggle("on");
      const box = el.querySelector(".fcheck-box");
      box.textContent = el.classList.contains("on") ? "✓" : "";
      applyAllFilters();
    }

    function toggleSwitch(el) {
      el.classList.toggle("on");
      applyAllFilters();
    }

    function updateBudget(val) {
      budgetMax = parseInt(val);
      const pct = ((val - 2000) / (200000 - 2000)) * 100;
      $("budgetRange").style.setProperty("--range-pct", pct + "%");
      const fmt = val >= 100000 ? "₹" + (val / 100000).toFixed(1) + "L" : "₹" + parseInt(val).toLocaleString("en-IN");
      $("budgetLabel").textContent = fmt;
      applyAllFilters();
    }

    /* ── VIEW ── */
    function setView(v) {
      currentView = v;
      $("cardsGrid").classList.toggle("list-view", v === "list");
      $("gridBtn").classList.toggle("on", v === "grid");
      $("listBtn").classList.toggle("on", v === "list");
      applyAllFilters();
    }

    /* ── SAVE ── */
    function toggleSave(btn, id) {
      if (savedIds.has(id)) {
        savedIds.delete(id);
        btn.textContent = "🤍";
        btn.classList.remove("saved");
        toast("💔 Removed from wishlist");
      } else {
        savedIds.add(id);
        btn.textContent = "❤️";
        btn.classList.add("saved");
        toast("❤️ Saved to wishlist!");
      }
    }

    /* ── COMPARE ── */
    function toggleCompare(btn, id) {
      if (compareIds.has(id)) {
        compareIds.delete(id);
        btn.style.cssText = "";
        updateCompareBar();
        toast("⊟ Removed from compare");
      } else {
        if (compareIds.size >= 3) {
          toast("⚠️ Max 3 properties can be compared");
          return;
        }
        compareIds.add(id);
        btn.style.cssText = "background:var(--terra-d);border-color:var(--terra-b);color:var(--terra)";
        updateCompareBar();
        toast("⊞ Added to compare!");
      }
    }

    function updateCompareBar() {
      const bar = $("compareBar");
      const slots = ["cs1", "cs2", "cs3"];
      const ids = [...compareIds];
      slots.forEach((slotId, i) => {
        const el = $(slotId);
        if (ids[i] !== undefined) {
          const p = allProps.find((x) => x.id === ids[i]);
          el.className = "cb-slot filled";
          el.textContent = p ? p.title.substring(0, 22) + "…" : "";
        } else {
          el.className = "cb-slot";
          el.textContent = "+ Add property";
        }
      });
      bar.classList.toggle("show", compareIds.size > 0);
    }

    function doCompare() {
      toast("📊 Property comparison launching soon! We're building something great.");
    }
    function clearCompare() {
      compareIds.clear();
      rootRef.current.querySelectorAll(".btn-call").forEach((b) => (b.style.cssText = ""));
      updateCompareBar();
    }

    function trackWA() {
      toast("💬 Opening WhatsApp chat with owner…");
    }

    function goToDetail(id) {
      window.location = "/property-detail?id=" + id;
    }

    function goToMaps() {
      window.location = "/maps";
    }

    /* ── STAT COUNTERS ── */
    function updateCounts(n) {
      animCount("stat-listings", n || 8800, 0);
      animCount("stat-cities", 15, 0, 300);
      animCount("stat-owners", 10000, 0, 600);
    }

    function animCount(id, target, decimals, delay = 0) {
      const el = $(id);
      if (!el) return;
      setTimeout(() => {
        const dur = 1800,
          start = performance.now();
        const fmt = (v) => (target >= 1000 ? (v >= 1000 ? (v / 1000).toFixed(1) + "K+" : Math.floor(v) + "") : decimals ? v.toFixed(decimals) : Math.floor(v));
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 4);
          el.textContent = fmt(ease * target);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = fmt(target);
        };
        requestAnimationFrame(tick);
      }, delay);
    }

    /* ── NAVBAR & SCROLL PROGRESS ── */
    const onScroll = () => {
      const nb = $("navbar");
      if (nb) nb.classList.toggle("solid", window.scrollY > 40);
      const t = document.documentElement;
      const pct = (window.scrollY / (t.scrollHeight - window.innerHeight)) * 100;
      const pg = $("pgBar");
      if (pg) pg.style.width = Math.min(pct, 100) + "%";
    };
    window.addEventListener("scroll", onScroll);
    cleanupFns.push(() => window.removeEventListener("scroll", onScroll));

    /* ── MOBILE MENU ── */
    function toggleMob() {
      const d = $("mobDrawer");
      const b = $("mobBtn");
      const open = d.classList.toggle("open");
      b.textContent = open ? "✕" : "☰";
    }

    /* ── TOAST ── */
    let toastTimer;
    function toast(msg) {
      const el = $("toast");
      if (!el) return;
      el.innerHTML = msg;
      el.style.display = "block";
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        el.style.display = "none";
      }, 3500);
    }

    /* ── SEARCH INPUT LISTENER (oninput was inline in original; wire it here) ── */
    const searchQEl = $("searchQ");
    const onSearchInput = () => liveSearch();
    if (searchQEl) searchQEl.addEventListener("input", onSearchInput);
    const searchCityEl = $("searchCity");
    const searchTypeEl = $("searchType");
    const sortSelEl = $("sortSel");
    const onChangeFilter = () => applyAllFilters();
    [searchCityEl, searchTypeEl, sortSelEl].forEach((el) => el && el.addEventListener("change", onChangeFilter));
    cleanupFns.push(() => {
      searchQEl && searchQEl.removeEventListener("input", onSearchInput);
      [searchCityEl, searchTypeEl, sortSelEl].forEach((el) => el && el.removeEventListener("change", onChangeFilter));
    });

    /* ── SCROLL REVEAL ── */
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    rootRef.current.querySelectorAll(".rv").forEach((el) => obs.observe(el));
    cleanupFns.push(() => obs.disconnect());

    /* ── EXPOSE HANDLERS GLOBALLY (needed for onclick="..." attributes, including ones injected via renderCards' innerHTML) ── */
    window.setCat = setCat;
    window.applyAllFilters = applyAllFilters;
    window.liveSearch = liveSearch;
    window.resetFilters = resetFilters;
    window.toggleCheck = toggleCheck;
    window.toggleSwitch = toggleSwitch;
    window.updateBudget = updateBudget;
    window.setView = setView;
    window.toggleSave = toggleSave;
    window.toggleCompare = toggleCompare;
    window.doCompare = doCompare;
    window.clearCompare = clearCompare;
    window.trackWA = trackWA;
    window.goToDetail = goToDetail;
    window.goToMaps = goToMaps;
    window.toggleMob = toggleMob;

    /* ── INIT: render static data immediately, then try to replace with live Firestore data ── */
    renderCards(allProps);
    updateCounts(allProps.length);
    updateBudget(50000);

    (async () => {
      try {
        const snap = await getDocs(query(collection(db, "properties"), where("approved", "==", true), limit(24)));
        if (!snap.empty) {
          const rows = [];
          snap.forEach((d) => rows.push({ id: d.id, ...d.data(), fromDB: true }));
          if (rows.length) {
            allProps = rows;
            renderCards(allProps);
            updateCounts(rows.length);
          }
        }
      } catch (e) {
        console.log("Using static data");
      }
    })();

    return () => {
      cleanupFns.forEach((fn) => fn());
      delete window.setCat;
      delete window.applyAllFilters;
      delete window.liveSearch;
      delete window.resetFilters;
      delete window.toggleCheck;
      delete window.toggleSwitch;
      delete window.updateBudget;
      delete window.setView;
      delete window.toggleSave;
      delete window.toggleCompare;
      delete window.doCompare;
      delete window.clearCompare;
      delete window.trackWA;
      delete window.goToDetail;
      delete window.goToMaps;
      delete window.toggleMob;
    };
  }, []);

  return <div className="properties-page" ref={rootRef} dangerouslySetInnerHTML={{ __html: BODY_HTML }} />;
}
