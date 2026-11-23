"use client";

import { useEffect, useRef } from "react";
import "./page.css";

const BODY_HTML = `
<nav class="sidebar" id="sidebar">
  <div class="sidebar-logo">
    <div class="logo-mark">S</div>
    <div>
      <div class="logo-text">Smart<span>Rent</span> AI</div>
      <div class="logo-sub">Real Estate Platform</div>
    </div>
  </div>

  <div class="sidebar-user" onclick="showSection('profile')">
    <img src="https://ui-avatars.com/api/?name=Piyush+Mishra&background=1a56db&color=fff&size=80" class="sidebar-avatar" alt="Piyush"/>
    <div>
      <div class="sidebar-user-name">Piyush Mishra</div>
      <div class="sidebar-user-plan">Property Owner</div>
    </div>
  </div>

  <div class="sidebar-section-label">Main</div>
  <a class="nav-item active" onclick="showSection('dashboard')">
    <div class="nav-icon">🏠</div> Dashboard
  </a>
  <a class="nav-item" onclick="showSection('profile')">
    <div class="nav-icon">👤</div> Profile
  </a>
  <a class="nav-item" onclick="showSection('properties')">
    <div class="nav-icon">🏢</div> My Properties
    <span class="nav-badge">4</span>
  </a>
  <a class="nav-item" onclick="showSection('saved')">
    <div class="nav-icon">❤️</div> Saved
  </a>
  <a class="nav-item" onclick="showSection('leads')">
    <div class="nav-icon">💼</div> Leads & Inquiries
    <span class="nav-badge">3</span>
  </a>

  <div class="sidebar-section-label">Insights</div>
  <a class="nav-item" onclick="showSection('analytics')">
    <div class="nav-icon">📊</div> Analytics
  </a>
  <a class="nav-item" onclick="showSection('notifications')">
    <div class="nav-icon">🔔</div> Notifications
    <span class="nav-badge">2</span>
  </a>

  <div class="sidebar-section-label">Account</div>
  <a class="nav-item" onclick="showSection('settings')">
    <div class="nav-icon">⚙️</div> Settings
  </a>
  <a class="nav-item" onclick="showSection('security')">
    <div class="nav-icon">🔐</div> Security
  </a>
  <a class="nav-item" onclick="showSection('support')">
    <div class="nav-icon">🎧</div> Support
  </a>
  <a class="nav-item" onclick="showSection('admin')">
    <div class="nav-icon">🛡️</div> Admin Panel
  </a>

  <div class="sidebar-bottom">
    <div class="theme-toggle" onclick="toggleTheme()">
      <span>🌙 Dark Mode</span>
      <div class="toggle-pill"><div class="toggle-circle"></div></div>
    </div>
  </div>
</nav>

<div class="overlay" id="overlay" onclick="closeSidebar()"></div>

<div class="main">
  <div class="topbar">
    <button class="topbar-hamburger" onclick="openSidebar()">☰</button>
    <div class="topbar-title" id="topbarTitle">Dashboard</div>
    <div class="topbar-search">
      <span style="color:var(--text3)">🔍</span>
      <input type="text" placeholder="Search properties, leads…"/>
    </div>
    <div class="topbar-actions">
      <div class="icon-btn" onclick="showToast('🔔 You have 2 new notifications','blue')">
        🔔<span class="dot"></span>
      </div>
      <div class="icon-btn" onclick="showToast('💬 1 new message','green')">
        💬<span class="dot"></span>
      </div>
      <img src="https://ui-avatars.com/api/?name=Piyush+Mishra&background=1a56db&color=fff&size=80" class="topbar-avatar" onclick="showSection('profile')"/>
    </div>
  </div>

  <div class="content">

    <!-- SECTION: DASHBOARD -->
    <div class="section active" id="sec-dashboard">
      <div class="section-title">Dashboard Overview <span>Last updated just now</span></div>

      <div class="grid-4" style="margin-bottom:20px">
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--blue5);color:var(--blue2)">🏢</div>
          <div class="stat-value" data-count="4">0</div>
          <div class="stat-label">Total Properties</div>
          <div class="stat-change stat-up">▲ 1 this month</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--green2);color:var(--green)">✅</div>
          <div class="stat-value" data-count="2">0</div>
          <div class="stat-label">Active Listings</div>
          <div class="stat-change stat-up">▲ Active</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--gold2);color:var(--gold)">👁️</div>
          <div class="stat-value" data-count="1284">0</div>
          <div class="stat-label">Total Views</div>
          <div class="stat-change stat-up">▲ 18% vs last month</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--purple2);color:var(--purple)">📬</div>
          <div class="stat-value" data-count="47">0</div>
          <div class="stat-label">Leads Generated</div>
          <div class="stat-change stat-up">▲ 12 new leads</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--red2);color:var(--red)">🏷️</div>
          <div class="stat-value" data-count="1">0</div>
          <div class="stat-label">Sold Properties</div>
          <div class="stat-change" style="color:var(--text3)">— this year</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--gold2);color:var(--gold)">⭐</div>
          <div class="stat-value" data-count="1">0</div>
          <div class="stat-label">Featured Listings</div>
          <div class="stat-change" style="color:var(--text3)">This month</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--green2);color:var(--green)">❤️</div>
          <div class="stat-value" data-count="31">0</div>
          <div class="stat-label">Saved by Others</div>
          <div class="stat-change stat-up">▲ 8 new saves</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--purple2);color:var(--purple)">💬</div>
          <div class="stat-value" data-count="12">0</div>
          <div class="stat-label">Inquiries Received</div>
          <div class="stat-change stat-up">▲ 3 today</div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:20px">
        <div class="card" style="padding:20px">
          <div class="section-header">
            <div style="font-weight:700;font-size:15px">Monthly Views</div>
            <span class="badge badge-blue">2026</span>
          </div>
          <div class="chart-wrap"><canvas id="viewsChart"></canvas></div>
        </div>
        <div class="card" style="padding:20px">
          <div class="section-header">
            <div style="font-weight:700;font-size:15px">Leads by Source</div>
            <span class="badge badge-green">Live</span>
          </div>
          <div class="chart-wrap"><canvas id="leadsChart"></canvas></div>
        </div>
      </div>

      <div class="card" style="padding:20px">
        <div class="section-header">
          <div style="font-weight:700;font-size:15px">Recent Activity</div>
          <button class="btn btn-secondary btn-sm">View All</button>
        </div>
        <div class="activity-item">
          <div class="activity-icon" style="background:var(--green2);color:var(--green)">✅</div>
          <div class="activity-text">Your property <b>Sea View 3BHK, Bandra</b> was approved</div>
          <div class="activity-time">2h ago</div>
        </div>
        <div class="activity-item">
          <div class="activity-icon" style="background:var(--blue5);color:var(--blue2)">💬</div>
          <div class="activity-text">New inquiry from <b>Rahul Sharma</b> for Marine Drive Studio</div>
          <div class="activity-time">5h ago</div>
        </div>
        <div class="activity-item">
          <div class="activity-icon" style="background:var(--gold2);color:var(--gold)">⭐</div>
          <div class="activity-text">Marine Drive Studio featured on homepage</div>
          <div class="activity-time">Yesterday</div>
        </div>
        <div class="activity-item">
          <div class="activity-icon" style="background:var(--green2);color:var(--green)">🎉</div>
          <div class="activity-text">Account created successfully — welcome to SmartRent AI!</div>
          <div class="activity-time">3 days ago</div>
        </div>
        <div class="activity-item">
          <div class="activity-icon" style="background:var(--orange2);color:var(--orange)">📸</div>
          <div class="activity-text">4 photos uploaded to <b>Powai 2BHK</b></div>
          <div class="activity-time">5 days ago</div>
        </div>
      </div>
    </div>

    <!-- SECTION: PROFILE -->
    <div class="section" id="sec-profile">
      <div class="section-title">My Profile</div>

      <div style="position:relative;margin-bottom:80px">
        <div class="profile-banner"></div>
        <div class="profile-avatar-wrap">
          <img src="https://ui-avatars.com/api/?name=Piyush+Mishra&background=1a56db&color=fff&size=200" class="profile-avatar" alt="Piyush Mishra"/>
          <div class="profile-avatar-edit" onclick="showToast('📸 Photo upload coming soon!','blue')">✏️</div>
        </div>
      </div>

      <div class="profile-info" style="margin-bottom:24px">
        <div>
          <div class="profile-name-row">
            <div class="profile-name">Piyush Mishra</div>
            <div class="verified-badge">✓ Verified</div>
          </div>
          <div class="profile-meta">
            <span class="profile-meta-item">📍 Hyderabad, Telangana</span>
            <span class="profile-meta-item">📅 Joined January 2026</span>
            <span class="profile-meta-item">🏢 4 Properties</span>
            <span class="profile-meta-item">📧 piyushmishra1903@gmail.com</span>
          </div>
        </div>
        <div class="profile-actions">
          <button class="btn btn-primary" onclick="showToast('✏️ Edit profile form opened','blue')">✏️ Edit Profile</button>
          <button class="btn btn-secondary" onclick="showToast('🔗 Profile link copied!','green')">🔗 Share Profile</button>
        </div>
      </div>

      <div class="grid-2">
        <div class="card" style="padding:20px">
          <div style="font-weight:700;font-size:15px;margin-bottom:14px">Personal Information</div>
          <div class="info-row"><span class="info-label">Full Name</span><span class="info-val">Piyush Mishra</span></div>
          <div class="info-row"><span class="info-label">Email</span><span class="info-val">piyushmishra1903@gmail.com</span></div>
          <div class="info-row"><span class="info-label">Phone</span><span class="info-val">+91 98765 43210</span></div>
          <div class="info-row"><span class="info-label">City</span><span class="info-val">Hyderabad</span></div>
          <div class="info-row"><span class="info-label">State</span><span class="info-val">Telangana</span></div>
          <div class="info-row"><span class="info-label">Role</span><span class="info-val">Owner + Admin</span></div>
          <div class="info-row"><span class="info-label">Member Since</span><span class="info-val">Jan 2026</span></div>
        </div>
        <div class="card" style="padding:20px">
          <div style="font-weight:700;font-size:15px;margin-bottom:14px">Verification Status</div>
          <div class="info-row">
            <span class="info-label">📧 Email</span>
            <span class="badge badge-green">✓ Verified</span>
          </div>
          <div class="info-row">
            <span class="info-label">📱 Phone</span>
            <span class="badge badge-green">✓ Verified</span>
          </div>
          <div class="info-row">
            <span class="info-label">🪪 KYC / Aadhaar</span>
            <span class="badge badge-orange">⏳ Pending</span>
          </div>
          <div class="info-row">
            <span class="info-label">🏦 Bank Account</span>
            <span class="badge badge-red">✗ Not Linked</span>
          </div>
          <div class="info-row">
            <span class="info-label">🔐 2FA</span>
            <span class="badge badge-orange">⏳ Not Enabled</span>
          </div>
          <div style="margin-top:12px">
            <button class="btn btn-primary" style="width:100%" onclick="showToast('🪪 KYC verification started','blue')">Complete KYC Now</button>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION: MY PROPERTIES -->
    <div class="section" id="sec-properties">
      <div class="section-title">My Properties <span>4 total</span></div>

      <div class="filter-bar">
        <input type="text" id="propSearch" placeholder="🔍 Search properties…" oninput="filterProperties()"/>
        <select onchange="filterProperties()" id="propType">
          <option value="">All Types</option>
          <option>Flat</option>
          <option>PG</option>
          <option>Villa</option>
          <option>Studio</option>
        </select>
        <select onchange="filterProperties()" id="propStatus">
          <option value="">All Status</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Sold</option>
        </select>
        <button class="btn btn-primary btn-sm" onclick="showToast('➕ Post Property form opened','blue')">+ Add Property</button>
      </div>

      <div class="grid-auto" id="propGrid"></div>
    </div>

    <!-- SECTION: SAVED -->
    <div class="section" id="sec-saved">
      <div class="section-title">Saved Properties <span>8 properties</span></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
        <div class="chip active">All</div>
        <div class="chip">Flats</div>
        <div class="chip">PG / Hostels</div>
        <div class="chip">Villas</div>
        <div class="chip">Commercial</div>
      </div>
      <div class="grid-auto" id="savedGrid"></div>
    </div>

    <!-- SECTION: LEADS -->
    <div class="section" id="sec-leads">
      <div class="section-title">Leads & Inquiries <span>47 total</span></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
        <div class="chip active">All (47)</div>
        <div class="chip">🆕 New (12)</div>
        <div class="chip">📞 Contacted (28)</div>
        <div class="chip">✅ Closed (7)</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px" id="leadsGrid"></div>
    </div>

    <!-- SECTION: ANALYTICS -->
    <div class="section" id="sec-analytics">
      <div class="section-title">Analytics Dashboard</div>

      <div class="grid-2">
        <div class="card" style="padding:20px">
          <div style="font-weight:700;font-size:15px;margin-bottom:16px">Property Performance</div>
          <div class="chart-wrap"><canvas id="perfChart"></canvas></div>
        </div>
        <div class="card" style="padding:20px">
          <div style="font-weight:700;font-size:15px;margin-bottom:16px">Views by Property Type</div>
          <div class="chart-wrap"><canvas id="typeChart"></canvas></div>
        </div>
      </div>
    </div>

    <!-- SECTION: NOTIFICATIONS -->
    <div class="section" id="sec-notifications">
      <div class="section-title">Notification Center</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
        <div class="chip active">All (3)</div>
        <div class="chip">Unread (2)</div>
        <div class="chip">Properties</div>
        <div class="chip">Leads</div>
        <div class="chip">System</div>
      </div>
      <div class="card" style="overflow:hidden">
        <div class="notif-item unread">
          <div class="notif-dot"></div>
          <div class="notif-icon" style="background:var(--green2)">✅</div>
          <div>
            <div class="notif-title">Property Approved</div>
            <div class="notif-body">Your listing "Sea View 3BHK, Bandra" has been approved and is now live.</div>
            <div class="notif-time">2 hours ago</div>
          </div>
        </div>
        <div class="notif-item unread">
          <div class="notif-dot"></div>
          <div class="notif-icon" style="background:var(--blue5)">💬</div>
          <div>
            <div class="notif-title">New Lead Received</div>
            <div class="notif-body">Rahul Sharma is interested in Marine Drive Studio. Contact now!</div>
            <div class="notif-time">5 hours ago</div>
          </div>
        </div>
        <div class="notif-item">
          <div class="notif-dot read"></div>
          <div class="notif-icon" style="background:var(--purple2)">🔔</div>
          <div>
            <div class="notif-title">System Update</div>
            <div class="notif-body">SmartRent AI v2.4 launched — new filters, dark mode, and faster search.</div>
            <div class="notif-time">1 week ago</div>
          </div>
        </div>
      </div>
      <div style="text-align:center;margin-top:16px">
        <button class="btn btn-secondary" onclick="showToast('✓ All notifications marked as read','green')">Mark All as Read</button>
      </div>
    </div>

    <!-- SECTION: SETTINGS -->
    <div class="section" id="sec-settings">
      <div class="section-title">Account Settings</div>
      <div class="grid-2">
        <div>
          <div class="card" style="margin-bottom:16px">
            <div style="padding:16px 20px;border-bottom:1px solid var(--border);font-weight:700;font-size:15px">Personal Information</div>
            <div style="padding:20px;display:flex;flex-direction:column;gap:12px">
              <div>
                <label style="font-size:12px;font-weight:600;color:var(--text3);display:block;margin-bottom:4px">Full Name</label>
                <input type="text" value="Piyush Mishra" style="width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14px;background:var(--surface2);color:var(--text);font-family:var(--font-body);outline:none"/>
              </div>
              <div>
                <label style="font-size:12px;font-weight:600;color:var(--text3);display:block;margin-bottom:4px">Email Address</label>
                <input type="email" value="piyushmishra1903@gmail.com" style="width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14px;background:var(--surface2);color:var(--text);font-family:var(--font-body);outline:none"/>
              </div>
              <div>
                <label style="font-size:12px;font-weight:600;color:var(--text3);display:block;margin-bottom:4px">Phone Number</label>
                <input type="tel" value="+91 98765 43210" style="width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14px;background:var(--surface2);color:var(--text);font-family:var(--font-body);outline:none"/>
              </div>
              <div>
                <label style="font-size:12px;font-weight:600;color:var(--text3);display:block;margin-bottom:4px">City</label>
                <input type="text" value="Hyderabad" style="width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14px;background:var(--surface2);color:var(--text);font-family:var(--font-body);outline:none"/>
              </div>
              <button class="btn btn-primary" onclick="showToast('✅ Profile saved successfully','green')">Save Changes</button>
            </div>
          </div>

          <div class="card">
            <div style="padding:16px 20px;border-bottom:1px solid var(--border);font-weight:700;font-size:15px">Change Password</div>
            <div style="padding:20px;display:flex;flex-direction:column;gap:12px">
              <input type="password" placeholder="Current Password" style="width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14px;background:var(--surface2);color:var(--text);font-family:var(--font-body);outline:none"/>
              <input type="password" placeholder="New Password" style="width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14px;background:var(--surface2);color:var(--text);font-family:var(--font-body);outline:none"/>
              <input type="password" placeholder="Confirm New Password" style="width:100%;padding:9px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14px;background:var(--surface2);color:var(--text);font-family:var(--font-body);outline:none"/>
              <button class="btn btn-primary" onclick="showToast('🔐 Password updated!','green')">Update Password</button>
            </div>
          </div>
        </div>

        <div>
          <div class="card" style="margin-bottom:16px;overflow:hidden">
            <div style="padding:16px 20px;border-bottom:1px solid var(--border);font-weight:700;font-size:15px">Notification Preferences</div>
            <div class="settings-row">
              <div><div class="settings-label">New Lead Alerts</div><div class="settings-desc">Get notified for new inquiries</div></div>
              <div class="toggle-switch on" onclick="this.classList.toggle('on')"></div>
            </div>
            <div class="settings-row">
              <div><div class="settings-label">Property Status Updates</div><div class="settings-desc">Approval, rejection, featured</div></div>
              <div class="toggle-switch on" onclick="this.classList.toggle('on')"></div>
            </div>
            <div class="settings-row">
              <div><div class="settings-label">WhatsApp Notifications</div><div class="settings-desc">Instant lead WhatsApp alerts</div></div>
              <div class="toggle-switch" onclick="this.classList.toggle('on')"></div>
            </div>
            <div class="settings-row">
              <div><div class="settings-label">Email Newsletter</div><div class="settings-desc">Market trends & tips</div></div>
              <div class="toggle-switch" onclick="this.classList.toggle('on')"></div>
            </div>
          </div>

          <div class="card" style="overflow:hidden">
            <div style="padding:16px 20px;border-bottom:1px solid var(--border);font-weight:700;font-size:15px">Privacy Settings</div>
            <div class="settings-row">
              <div><div class="settings-label">Profile Visibility</div><div class="settings-desc">Public profile visible to all</div></div>
              <div class="toggle-switch on" onclick="this.classList.toggle('on')"></div>
            </div>
            <div class="settings-row">
              <div><div class="settings-label">Show Phone Number</div><div class="settings-desc">Visible on property listings</div></div>
              <div class="toggle-switch on" onclick="this.classList.toggle('on')"></div>
            </div>
            <div class="settings-row">
              <div><div class="settings-label">Analytics Tracking</div><div class="settings-desc">Help improve SmartRent AI</div></div>
              <div class="toggle-switch on" onclick="this.classList.toggle('on')"></div>
            </div>
            <div style="padding:16px 20px">
              <button class="btn btn-danger" style="width:100%" onclick="showToast('⚠️ Account deletion requires email confirmation','red')">🗑️ Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION: SECURITY -->
    <div class="section" id="sec-security">
      <div class="section-title">Security Center</div>
      <div class="grid-2">
        <div class="card" style="padding:20px">
          <div style="font-weight:700;font-size:15px;margin-bottom:16px">Security Score</div>
          <div class="security-score-wrap">
            <div class="security-score-ring">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="var(--border)" stroke-width="8"/>
                <circle cx="50" cy="50" r="44" fill="none" stroke="var(--orange)" stroke-width="8"
                  stroke-dasharray="276.5" stroke-dashoffset="138" stroke-linecap="round"/>
              </svg>
              <div class="security-score-num">50%</div>
            </div>
            <div>
              <div style="font-size:14px;font-weight:700;color:var(--orange);margin-bottom:8px">Needs Improvement</div>
              <div style="font-size:12.5px;color:var(--text2);margin-bottom:4px">✅ Email verified</div>
              <div style="font-size:12.5px;color:var(--text2);margin-bottom:4px">✅ Strong password</div>
              <div style="font-size:12.5px;color:var(--red);margin-bottom:4px">❌ 2FA not enabled</div>
              <div style="font-size:12.5px;color:var(--red)">❌ KYC incomplete</div>
            </div>
          </div>
          <div style="margin-top:16px">
            <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:4px">
              <span>Security Score</span><span style="font-weight:700;color:var(--orange)">50%</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:50%;background:linear-gradient(90deg,var(--orange),var(--gold))"></div></div>
          </div>
        </div>

        <div class="card" style="padding:20px">
          <div style="font-weight:700;font-size:15px;margin-bottom:14px">Recent Login Activity</div>
          <div class="activity-item">
            <div class="activity-icon" style="background:var(--green2);color:var(--green)">💻</div>
            <div class="activity-text"><b>Chrome / Windows 11</b> — Hyderabad, IN<br/><span style="font-size:12px;color:var(--text3)">Current session</span></div>
            <span class="badge badge-green">Active</span>
          </div>
          <div class="activity-item">
            <div class="activity-icon" style="background:var(--blue5);color:var(--blue2)">📱</div>
            <div class="activity-text"><b>Mobile / Android</b> — Hyderabad, IN</div>
            <span style="font-size:12px;color:var(--text3)">2h ago</span>
          </div>
          <div class="activity-item">
            <div class="activity-icon" style="background:var(--surface2);color:var(--text3)">🌐</div>
            <div class="activity-text"><b>Firefox / macOS</b> — Mumbai, IN</div>
            <span style="font-size:12px;color:var(--text3)">3 days ago</span>
          </div>
        </div>

        <div class="card" style="padding:20px">
          <div style="font-weight:700;font-size:15px;margin-bottom:6px">Two-Factor Authentication</div>
          <div style="font-size:13px;color:var(--text2);margin-bottom:16px">Add an extra layer of security to your account with 2FA.</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn-primary" onclick="showToast('📲 2FA setup — scan QR code','blue')">Enable 2FA</button>
            <button class="btn btn-secondary" onclick="showToast('📋 Backup codes generated','green')">Backup Codes</button>
          </div>
        </div>

        <div class="card" style="padding:20px">
          <div style="font-weight:700;font-size:15px;margin-bottom:14px">Device Management</div>
          <div class="info-row"><span class="info-label">💻 Desktop (Chrome)</span><span class="badge badge-green">Active</span></div>
          <div class="info-row"><span class="info-label">📱 Android (App)</span><span class="badge badge-blue">Trusted</span></div>
          <div style="margin-top:16px">
            <button class="btn btn-danger" style="width:100%" onclick="showToast('🔓 Logged out from all devices','red')">Logout From All Devices</button>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION: SUPPORT -->
    <div class="section" id="sec-support">
      <div class="section-title">Support Center</div>
      <div class="grid-4" style="margin-bottom:24px">
        <div class="support-card" onclick="showToast('💬 Live chat starting…','blue')">
          <div class="support-icon">💬</div>
          <div class="support-title">Live Chat</div>
          <div class="support-desc">Chat with our agents instantly. Available 9AM–9PM IST</div>
        </div>
        <div class="support-card" onclick="showToast('🎫 Ticket raised successfully','green')">
          <div class="support-icon">🎫</div>
          <div class="support-title">Raise a Ticket</div>
          <div class="support-desc">Submit a detailed support request. Response within 24 hours</div>
        </div>
        <div class="support-card" onclick="showToast('📚 FAQs opened','blue')">
          <div class="support-icon">📚</div>
          <div class="support-title">FAQs</div>
          <div class="support-desc">Find answers to commonly asked questions quickly</div>
        </div>
        <div class="support-card" onclick="showToast('📧 Email to support@smartrentai.in','blue')">
          <div class="support-icon">📧</div>
          <div class="support-title">Contact Support</div>
          <div class="support-desc">Email our support team at support@smartrentai.in</div>
        </div>
      </div>
      <div class="card" style="padding:20px">
        <div style="font-weight:700;font-size:15px;margin-bottom:16px">Submit Support Ticket</div>
        <div style="display:flex;flex-direction:column;gap:12px">
          <input type="text" placeholder="Subject" style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14px;background:var(--surface2);color:var(--text);font-family:var(--font-body);outline:none"/>
          <select style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14px;background:var(--surface2);color:var(--text);font-family:var(--font-body);outline:none">
            <option>Select Category</option>
            <option>Property Listing Issue</option>
            <option>Account Access</option>
            <option>Lead Management</option>
            <option>Other</option>
          </select>
          <textarea placeholder="Describe your issue in detail…" rows="4" style="width:100%;padding:10px 14px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:14px;background:var(--surface2);color:var(--text);font-family:var(--font-body);outline:none;resize:vertical"></textarea>
          <button class="btn btn-primary" onclick="showToast('✅ Ticket submitted! We will respond within 24 hours','green')">Submit Ticket</button>
        </div>
      </div>
    </div>

    <!-- SECTION: ADMIN -->
    <div class="section" id="sec-admin">
      <div class="section-title">Admin Panel <span class="badge badge-red" style="font-size:12px">Admin Role</span></div>

      <div style="background:linear-gradient(135deg,#1a0a30,#3b0764,#6d28d9);border-radius:var(--radius-lg);padding:20px 24px;color:#fff;margin-bottom:20px">
        <div style="font-family:var(--font-display);font-size:18px;font-weight:800;margin-bottom:4px">🛡️ Admin Access Enabled</div>
        <div style="font-size:13px;opacity:.8">You have full administrative privileges. Handle with care.</div>
      </div>

      <div class="grid-2" style="margin-bottom:20px">
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--blue5);color:var(--blue2)">👥</div>
          <div class="stat-value" data-count="2847">0</div>
          <div class="stat-label">Total Users</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--green2);color:var(--green)">🏢</div>
          <div class="stat-value" data-count="12480">0</div>
          <div class="stat-label">Properties Listed</div>
        </div>
      </div>

      <div class="grid-3">
        <div class="admin-tile" onclick="showToast('👥 Manage Users — 2,847 accounts','blue')">
          <div class="admin-tile-icon" style="background:var(--blue5)">👥</div>
          <div>
            <div class="admin-tile-name">Manage Users</div>
            <div class="admin-tile-count">2,847</div>
          </div>
        </div>
        <div class="admin-tile" onclick="showToast('🏢 Manage Properties — 12,480 listings','blue')">
          <div class="admin-tile-icon" style="background:var(--green2)">🏢</div>
          <div>
            <div class="admin-tile-name">Manage Properties</div>
            <div class="admin-tile-count">12,480</div>
          </div>
        </div>
        <div class="admin-tile" onclick="showToast('📊 Site Analytics opened','blue')">
          <div class="admin-tile-icon" style="background:var(--orange2)">📊</div>
          <div>
            <div class="admin-tile-name">Site Analytics</div>
            <div class="admin-tile-count">Live</div>
          </div>
        </div>
        <div class="admin-tile" onclick="showToast('📄 Reports Dashboard opened','blue')">
          <div class="admin-tile-icon" style="background:var(--red2)">📄</div>
          <div>
            <div class="admin-tile-name">Reports Dashboard</div>
            <div class="admin-tile-count">All</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</div>

<button class="fab" onclick="showToast('➕ Quick post: choose property type','blue')" title="Quick Add Property">＋</button>

<div class="toast-container" id="toastContainer"></div>
`;

const PROPERTIES = [
  {
    id: 1, title: "Sea View 3BHK, Bandra",
    price: "₹95,000/mo", location: "Bandra West, Mumbai",
    type: "Flat", status: "Active",
    img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=70",
    views: 412, featured: true,
    beds: 3, baths: 2, sqft: "1,850",
  },
  {
    id: 2, title: "Marine Drive Studio",
    price: "₹45,000/mo", location: "Marine Drive, Mumbai",
    type: "Studio", status: "Active",
    img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=70",
    views: 286, featured: false,
    beds: 1, baths: 1, sqft: "620",
  },
  {
    id: 3, title: "Powai Lake View 2BHK",
    price: "₹38,000/mo", location: "Powai, Mumbai",
    type: "Flat", status: "Pending",
    img: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400&q=70",
    views: 194, featured: false,
    beds: 2, baths: 2, sqft: "1,100",
  },
  {
    id: 4, title: "Jubilee Hills Luxury Villa",
    price: "₹3,20,000/mo", location: "Jubilee Hills, Hyderabad",
    type: "Villa", status: "Sold",
    img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=70",
    views: 628, featured: false,
    beds: 5, baths: 4, sqft: "4,200",
  },
];

const SAVED_PROPS = [
  {
    id: 1, title: "Hiranandani 4BHK",
    price: "₹1,20,000/mo", location: "Hiranandani Gardens, Powai",
    type: "Flat",
    img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=70",
  },
  {
    id: 2, title: "Banjara Hills PG",
    price: "₹12,000/mo", location: "Banjara Hills, Hyderabad",
    type: "PG",
    img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=70",
  },
  {
    id: 3, title: "Koregaon Park Studio",
    price: "₹28,000/mo", location: "Koregaon Park, Pune",
    type: "Studio",
    img: "https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=400&q=70",
  },
  {
    id: 4, title: "DLF Cyber City Office",
    price: "₹2,50,000/mo", location: "DLF Cyber City, Gurugram",
    type: "Commercial",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=70",
  },
];

const LEADS = [
  {
    name: "Rahul Sharma", phone: "+91 98100 00001",
    email: "rahul.sharma@gmail.com",
    property: "Marine Drive Studio",
    msg: "Hi, I'm interested in this property. Can we schedule a visit this weekend?",
    status: "new", initials: "RS", color: "#1a56db",
  },
  {
    name: "Priya Patel", phone: "+91 98200 00002",
    email: "priya.patel@gmail.com",
    property: "Sea View 3BHK, Bandra",
    msg: "We are a family of 4 looking to rent from July. Is the property available?",
    status: "contacted", initials: "PP", color: "#7c3aed",
  },
  {
    name: "Arjun Nair", phone: "+91 98300 00003",
    email: "arjun.nair@gmail.com",
    property: "Powai Lake View 2BHK",
    msg: "What is the security deposit? Is parking included? Please share more details.",
    status: "new", initials: "AN", color: "#059669",
  },
  {
    name: "Sneha Gupta", phone: "+91 98400 00004",
    email: "sneha.gupta@gmail.com",
    property: "Sea View 3BHK, Bandra",
    msg: "Saw your property on the platform. Interested in a long-term rental.",
    status: "closed", initials: "SG", color: "#dc2626",
  },
  {
    name: "Vikram Singh", phone: "+91 98500 00005",
    email: "vikram.singh@gmail.com",
    property: "Jubilee Hills Luxury Villa",
    msg: "We are corporate clients looking for executive housing for our team.",
    status: "contacted", initials: "VS", color: "#d97706",
  },
];

const SECTIONS = [
  "dashboard", "profile", "properties", "saved", "leads",
  "analytics", "notifications", "settings", "security", "support", "admin",
];
const SECTION_TITLES = {
  dashboard: "Dashboard", profile: "My Profile", properties: "My Properties",
  saved: "Saved Properties", leads: "Leads & Inquiries",
  analytics: "Analytics", notifications: "Notifications",
  settings: "Settings", security: "Security", support: "Support", admin: "Admin Panel",
};

const CHART_JS_SRC = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Syne:wght@400;500;600;700;800&display=swap";

export default function DashboardPage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Load the dashboard's fonts once, without touching the rest of the site.
    if (!document.querySelector('link[data-dashboard-fonts]')) {
      const fontLink = document.createElement("link");
      fontLink.rel = "stylesheet";
      fontLink.href = FONTS_HREF;
      fontLink.dataset.dashboardFonts = "true";
      document.head.appendChild(fontLink);
    }

    const $ = (id) => root.querySelector("#" + id);

    function statusBadge(s) {
      const map = { Active: "badge-green", Pending: "badge-orange", Sold: "badge-red" };
      return `<span class="badge ${map[s] || "badge-blue"}">${s}</span>`;
    }

    function renderProperties(list) {
      const grid = $("propGrid");
      if (!grid) return;
      const props = list || PROPERTIES;
      if (!props.length) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-icon">🏠</div><div class="empty-state-text">No properties found</div><div style="font-size:13px">Try adjusting your search or filters</div></div>`;
        return;
      }
      grid.innerHTML = props
        .map(
          (p) => `
        <div class="property-card">
          <div class="prop-img-wrap">
            <img src="${p.img}" alt="${p.title}" loading="lazy"/>
            <div class="prop-status">${statusBadge(p.status)}</div>
            ${p.featured ? '<div class="prop-featured">⭐ Featured</div>' : ""}
            <div class="prop-heart" onclick="this.classList.toggle('active');showToast(this.classList.contains('active')?'❤️ Saved to wishlist':'💔 Removed from saved', this.classList.contains('active')?'green':'blue')">❤</div>
          </div>
          <div class="prop-body">
            <div class="prop-title">${p.title}</div>
            <div class="prop-location">📍 ${p.location}</div>
            <div class="prop-price">${p.price} <span>/ ${p.type}</span></div>
            <div class="prop-views">👁️ ${p.views} views &nbsp;|&nbsp; 🛏 ${p.beds} Beds &nbsp;|&nbsp; 🚿 ${p.baths} Baths &nbsp;|&nbsp; 📐 ${p.sqft} sq.ft</div>
          </div>
          <div class="prop-actions">
            <button class="btn btn-secondary btn-sm" onclick="showToast('✏️ Editing ${p.title}','blue')">✏️ Edit</button>
            <button class="btn btn-danger btn-sm" onclick="showToast('🗑️ Property deleted','red')">🗑</button>
            <button class="btn btn-sm" style="background:var(--gold2);color:#92640a" onclick="showToast('⭐ Marked as featured','gold')">⭐ Feature</button>
            <button class="btn btn-secondary btn-sm" onclick="showToast('🔗 Link copied!','green')">🔗</button>
          </div>
        </div>
      `
        )
        .join("");
    }

    function filterProperties() {
      const q = ($("propSearch")?.value || "").toLowerCase();
      const type = $("propType")?.value || "";
      const status = $("propStatus")?.value || "";
      const filtered = PROPERTIES.filter((p) => {
        return (
          (!q || (p.title + p.location).toLowerCase().includes(q)) &&
          (!type || p.type === type) &&
          (!status || p.status === status)
        );
      });
      renderProperties(filtered);
    }

    function renderSaved() {
      const grid = $("savedGrid");
      if (!grid) return;
      grid.innerHTML = SAVED_PROPS.map(
        (p) => `
        <div class="property-card">
          <div class="prop-img-wrap">
            <img src="${p.img}" alt="${p.title}" loading="lazy"/>
            <div class="prop-status"><span class="badge badge-blue">${p.type}</span></div>
            <div class="prop-heart active">❤</div>
          </div>
          <div class="prop-body">
            <div class="prop-title">${p.title}</div>
            <div class="prop-location">📍 ${p.location}</div>
            <div class="prop-price">${p.price}</div>
          </div>
          <div class="prop-actions">
            <button class="btn btn-primary btn-sm" onclick="showToast('📋 Compare list updated','blue')">Compare</button>
            <button class="btn btn-danger btn-sm" onclick="showToast('💔 Removed from saved','red')">Remove</button>
          </div>
        </div>
      `
      ).join("");
    }

    function renderLeads() {
      const grid = $("leadsGrid");
      if (!grid) return;
      const statusMap = { new: "badge-blue", contacted: "badge-gold", closed: "badge-green" };
      const statusLabel = { new: "🆕 New", contacted: "📞 Contacted", closed: "✅ Closed" };
      grid.innerHTML = LEADS.map(
        (l) => `
        <div class="lead-card">
          <div class="lead-avatar" style="background:${l.color}">${l.initials}</div>
          <div>
            <div class="lead-name">${l.name}</div>
            <div class="lead-prop">🏢 ${l.property}</div>
            <div class="lead-msg">"${l.msg}"</div>
            <div class="lead-contact">
              <span class="badge ${statusMap[l.status]}">${statusLabel[l.status]}</span>
              <span style="font-size:12px;color:var(--text3)">📧 ${l.email}</span>
              <span style="font-size:12px;color:var(--text3)">📱 ${l.phone}</span>
            </div>
          </div>
          <div class="lead-actions">
            <button class="btn btn-primary btn-sm" onclick="showToast('📧 Reply email opened for ${l.name}','blue')">✉️ Reply</button>
            <button class="btn btn-green btn-sm" onclick="showToast('📱 WhatsApp opened for ${l.name}','green')">💬 WA</button>
            <button class="btn btn-secondary btn-sm" onclick="showToast('📞 Calling ${l.phone}','blue')">📞 Call</button>
          </div>
        </div>
      `
      ).join("");
    }

    function isDark() {
      return root.getAttribute("data-theme") === "dark";
    }
    function textColor() {
      return isDark() ? "rgba(240,246,255,0.7)" : "rgba(74,85,104,0.8)";
    }
    function gridColor() {
      return isDark() ? "rgba(30,45,74,0.8)" : "rgba(226,232,244,0.8)";
    }

    let chartInstances = {};
    function destroyCharts() {
      Object.values(chartInstances).forEach((c) => {
        try {
          c.destroy();
        } catch (e) {}
      });
      chartInstances = {};
    }

    function initCharts() {
      const Chart = window.Chart;
      if (!Chart) return;
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      const chartDefaults = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor(), font: { family: "'DM Sans',sans-serif", size: 11 } } } },
        scales: {
          x: { ticks: { color: textColor(), font: { size: 11 } }, grid: { color: gridColor() } },
          y: { ticks: { color: textColor(), font: { size: 11 } }, grid: { color: gridColor() } },
        },
      };

      const vc = $("viewsChart");
      if (vc) {
        chartInstances.views = new Chart(vc, {
          type: "line",
          data: {
            labels: months,
            datasets: [
              {
                label: "Views",
                data: [120, 180, 240, 195, 310, 280],
                borderColor: "#2563eb",
                backgroundColor: "rgba(37,99,235,.1)",
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#2563eb",
                pointRadius: 4,
              },
            ],
          },
          options: { ...chartDefaults },
        });
      }

      const lc = $("leadsChart");
      if (lc) {
        chartInstances.leads = new Chart(lc, {
          type: "doughnut",
          data: {
            labels: ["Direct", "Search", "Social", "Referral"],
            datasets: [
              {
                data: [18, 14, 9, 6],
                backgroundColor: ["#2563eb", "#7c3aed", "#10b981", "#f59e0b"],
                borderWidth: 0,
                hoverOffset: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: { color: textColor(), font: { family: "'DM Sans',sans-serif", size: 11 }, padding: 16 },
              },
            },
          },
        });
      }

      const pc = $("perfChart");
      if (pc) {
        chartInstances.perf = new Chart(pc, {
          type: "bar",
          data: {
            labels: ["Sea View 3BHK", "Marine Drive Studio", "Powai 2BHK", "Jubilee Villa"],
            datasets: [
              {
                label: "Views",
                data: [412, 286, 194, 628],
                backgroundColor: ["#2563eb", "#7c3aed", "#10b981", "#f59e0b"],
                borderRadius: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: textColor(), font: { family: "'DM Sans',sans-serif", size: 11 } } } },
            scales: {
              x: { ticks: { color: textColor(), font: { size: 10 } }, grid: { display: false } },
              y: { ticks: { color: textColor(), font: { size: 11 } }, grid: { color: gridColor() } },
            },
            indexAxis: "y",
          },
        });
      }

      const tc = $("typeChart");
      if (tc) {
        chartInstances.type = new Chart(tc, {
          type: "pie",
          data: {
            labels: ["Flat", "Studio", "Villa", "PG"],
            datasets: [
              {
                data: [45, 20, 30, 5],
                backgroundColor: ["#2563eb", "#10b981", "#f59e0b", "#ec4899"],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: { color: textColor(), font: { family: "'DM Sans',sans-serif", size: 11 }, padding: 14 },
              },
            },
          },
        });
      }
    }

    function animateCounters() {
      root.querySelectorAll("[data-count]").forEach((el) => {
        const target = parseInt(el.dataset.count, 10);
        let current = 0;
        const duration = 1200;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = Math.floor(current).toLocaleString("en-IN");
          if (current >= target) clearInterval(timer);
        }, 16);
      });
    }

    function animateProgress() {
      root.querySelectorAll(".progress-fill").forEach((el) => {
        const w = el.style.width;
        el.style.width = "0";
        setTimeout(() => {
          el.style.width = w;
        }, 200);
      });
    }

    function showSection(id) {
      SECTIONS.forEach((s) => {
        const el = $("sec-" + s);
        if (el) el.classList.remove("active");
      });
      const target = $("sec-" + id);
      if (target) target.classList.add("active");
      const titleEl = $("topbarTitle");
      if (titleEl) titleEl.textContent = SECTION_TITLES[id] || id;

      root.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
      root.querySelectorAll(".nav-item").forEach((n) => {
        if (n.getAttribute("onclick") && n.getAttribute("onclick").includes("'" + id + "'")) {
          n.classList.add("active");
        }
      });
      closeSidebar();

      if (id === "properties") renderProperties();
      if (id === "saved") renderSaved();
      if (id === "leads") renderLeads();
    }

    function openSidebar() {
      $("sidebar")?.classList.add("open");
      $("overlay")?.classList.add("open");
    }
    function closeSidebar() {
      $("sidebar")?.classList.remove("open");
      $("overlay")?.classList.remove("open");
    }

    function toggleTheme() {
      const current = root.getAttribute("data-theme");
      root.setAttribute("data-theme", current === "dark" ? "light" : "dark");
      setTimeout(() => {
        destroyCharts();
        initCharts();
      }, 100);
    }

    function showToast(msg, type = "blue") {
      const c = $("toastContainer");
      if (!c) return;
      const icons = { blue: "ℹ️", green: "✅", gold: "⭐", red: "⚠️" };
      const t = document.createElement("div");
      t.className = "toast";
      t.innerHTML = `<span class="toast-icon">${icons[type] || "ℹ️"}</span>${msg}`;
      c.appendChild(t);
      setTimeout(() => {
        t.classList.add("toast-exit");
        setTimeout(() => t.remove(), 300);
      }, 3500);
    }

    // Expose handlers used by inline onclick/oninput attributes in BODY_HTML.
    window.showSection = showSection;
    window.openSidebar = openSidebar;
    window.closeSidebar = closeSidebar;
    window.toggleTheme = toggleTheme;
    window.showToast = showToast;
    window.filterProperties = filterProperties;

    function onChipClick() {
      const parent = this.parentElement;
      parent.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      this.classList.add("active");
    }
    const chips = root.querySelectorAll(".chip");
    chips.forEach((chip) => chip.addEventListener("click", onChipClick));

    function startDashboard() {
      renderProperties();
      renderSaved();
      renderLeads();
      initCharts();
      setTimeout(animateCounters, 300);
      setTimeout(animateProgress, 400);
    }

    if (window.Chart) {
      startDashboard();
    } else {
      let script = document.querySelector("script[data-chartjs]");
      if (!script) {
        script = document.createElement("script");
        script.src = CHART_JS_SRC;
        script.dataset.chartjs = "true";
        document.head.appendChild(script);
      }
      script.addEventListener("load", startDashboard);
      if (window.Chart) startDashboard();
    }

    return () => {
      destroyCharts();
      chips.forEach((chip) => chip.removeEventListener("click", onChipClick));
      delete window.showSection;
      delete window.openSidebar;
      delete window.closeSidebar;
      delete window.toggleTheme;
      delete window.showToast;
      delete window.filterProperties;
    };
  }, []);

  return (
    <div
      className="dashboard-page"
      data-theme="light"
      ref={rootRef}
      dangerouslySetInnerHTML={{ __html: BODY_HTML }}
    />
  );
}
