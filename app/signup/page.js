"use client";

import { useEffect, useRef } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import "./page.css";

const BODY_HTML = `
<div class="bg-grid"></div>

<div class="card">
  <div class="card-header">
    <div class="logo">
      <div class="logo-mark">🏠</div>
      <div class="logo-text">Smart<em>Rent</em></div>
    </div>

    <div class="card-title">Create your <span>Account</span></div>
    <div class="card-sub">Join thousands finding their perfect home</div>

    <div class="steps" id="stepIndicator">
      <div class="step-item">
        <div class="step-dot active" id="dot1">1</div>
        <div class="step-label active" id="lbl1">Details</div>
      </div>
      <div class="step-line" id="line1"></div>
      <div class="step-item">
        <div class="step-dot" id="dot2">2</div>
        <div class="step-label" id="lbl2">Security</div>
      </div>
      <div class="step-line" id="line2"></div>
      <div class="step-item">
        <div class="step-dot" id="dot3">✓</div>
        <div class="step-label" id="lbl3">Verify</div>
      </div>
    </div>
  </div>

  <div class="card-body">

    <div class="step-panel active" id="panel1">
      <div class="avatar-section">
        <div class="avatar-ring" id="avatarRing">
          <img id="avatarPreview" src="" alt="Avatar">
          <div class="avatar-plus" id="avatarPlus">📷</div>
        </div>
        <div class="avatar-hint">Upload profile photo<br>(optional)</div>
        <input type="file" id="fileInput" accept="image/*" style="display:none">
      </div>

      <div class="form-group">
        <label class="form-label">Full Name</label>
        <div class="input-wrap">
          <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <input type="text" id="fullName" class="field" placeholder="John Doe" autocomplete="name">
        </div>
        <div class="field-err" id="errName">Please enter your full name</div>
      </div>

      <div class="form-group">
        <label class="form-label">Email Address</label>
        <div class="input-wrap">
          <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <input type="email" id="emailInput" class="field" placeholder="you@email.com" autocomplete="email">
        </div>
        <div class="field-err" id="errEmail">Enter a valid email address</div>
      </div>

      <div class="form-group">
        <label class="form-label">Phone Number</label>
        <div class="input-wrap">
          <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.44 2 2 0 0 1 3.59 2.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.1 6.1l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.75 17z"/></svg>
          <input type="tel" id="phoneInput" class="field" placeholder="+91 98765 43210" autocomplete="tel">
        </div>
        <div class="field-err" id="errPhone">Enter a valid phone number</div>
      </div>

      <div class="form-group">
        <label class="form-label">I am a</label>
        <div class="input-wrap">
          <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <select id="roleInput" class="field" style="padding-left:42px;cursor:pointer;appearance:none">
            <option value="">Select role…</option>
            <option value="tenant">Tenant / Looking for home</option>
            <option value="landlord">Landlord / Property Owner</option>
            <option value="agent">Real Estate Agent</option>
          </select>
        </div>
        <div class="field-err" id="errRole">Please select your role</div>
      </div>

      <div class="check-row" style="margin-top:4px">
        <input type="checkbox" class="custom-check" id="termsCheck">
        <label class="check-label" for="termsCheck">
          I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
        </label>
      </div>

      <button class="btn-primary" id="step1Btn" type="button">
        <div class="btn-spinner"></div>
        <span class="btn-txt">Continue to Security →</span>
      </button>

      <div class="divider">or</div>

      <button class="btn-google" id="googleBtn" type="button">
        <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>
    </div>

    <div class="step-panel" id="panel2">
      <div class="form-group">
        <label class="form-label">Create Password</label>
        <div class="input-wrap">
          <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <input type="password" id="passInput" class="field" placeholder="Min. 8 characters" autocomplete="new-password">
          <button class="toggle-pass" id="togglePass1" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
        <div class="strength-row" id="strengthBars">
          <div class="strength-bar" id="bar1"></div>
          <div class="strength-bar" id="bar2"></div>
          <div class="strength-bar" id="bar3"></div>
          <div class="strength-bar" id="bar4"></div>
        </div>
        <div class="strength-label" id="strengthLabel">Enter a password</div>
        <div class="field-err" id="errPass">Password must be at least 8 characters</div>
      </div>

      <div class="form-group">
        <label class="form-label">Confirm Password</label>
        <div class="input-wrap">
          <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <input type="password" id="confirmPass" class="field" placeholder="Re-enter password" autocomplete="new-password">
          <button class="toggle-pass" id="togglePass2" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
        <div class="field-err" id="errConfirm">Passwords do not match</div>
      </div>

      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:18px;">
        <div style="font-size:11px;font-weight:600;letter-spacing:0.6px;text-transform:uppercase;color:var(--txt2);margin-bottom:10px;">Password Requirements</div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          <div class="req-item" id="req8"><span class="req-icon">○</span> <span style="font-size:12px;color:var(--txt1)">At least 8 characters</span></div>
          <div class="req-item" id="reqUpper"><span class="req-icon">○</span> <span style="font-size:12px;color:var(--txt1)">Uppercase letter (A–Z)</span></div>
          <div class="req-item" id="reqNum"><span class="req-icon">○</span> <span style="font-size:12px;color:var(--txt1)">Number (0–9)</span></div>
          <div class="req-item" id="reqSpecial"><span class="req-icon">○</span> <span style="font-size:12px;color:var(--txt1)">Special character (!@#$…)</span></div>
        </div>
      </div>

      <div style="display:flex;gap:10px;">
        <button class="btn-ghost" id="backToStep1" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>
        <button class="btn-primary" id="step2Btn" type="button" style="flex:1">
          <div class="btn-spinner"></div>
          <span class="btn-txt">Create Account →</span>
        </button>
      </div>
    </div>

    <div class="step-panel" id="panel3">
      <div class="otp-title">Two-Step Verification</div>
      <p class="otp-sub">We sent a 6-digit code to<br><b id="otpEmailDisplay">your email</b></p>

      <div class="otp-timer">
        <div class="timer-ring">
          <svg class="timer-svg" width="64" height="64" viewBox="0 0 64 64">
            <circle class="timer-track" cx="32" cy="32" r="26"/>
            <circle class="timer-prog" id="timerCircle" cx="32" cy="32" r="26"/>
          </svg>
          <div class="timer-num" id="timerNum">30</div>
        </div>
        <div class="timer-label">seconds remaining</div>
      </div>

      <div class="otp-boxes" id="otpBoxes">
        <input type="text" class="otp-box" maxlength="1" inputmode="numeric" pattern="[0-9]">
        <input type="text" class="otp-box" maxlength="1" inputmode="numeric" pattern="[0-9]">
        <input type="text" class="otp-box" maxlength="1" inputmode="numeric" pattern="[0-9]">
        <input type="text" class="otp-box" maxlength="1" inputmode="numeric" pattern="[0-9]">
        <input type="text" class="otp-box" maxlength="1" inputmode="numeric" pattern="[0-9]">
        <input type="text" class="otp-box" maxlength="1" inputmode="numeric" pattern="[0-9]">
      </div>

      <div class="otp-resend">
        Didn't receive the code?
        <button id="resendBtn" type="button" disabled>Resend OTP</button>
      </div>

      <div style="display:flex;gap:10px;">
        <button class="btn-ghost" id="backToStep2" type="button">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>
        <button class="btn-primary" id="verifyBtn" type="button" style="flex:1">
          <div class="btn-spinner"></div>
          <span class="btn-txt">Verify & Continue</span>
        </button>
      </div>
    </div>

    <div class="step-panel" id="panel4">
      <div class="success-wrap">
        <div class="success-icon">🎉</div>
        <div class="success-title">Welcome aboard!</div>
        <p class="success-sub">Your SmartRent account has been created and verified successfully. You're all set to find your perfect home.</p>
        <button class="btn-primary" id="goDashBtn" type="button"><span class="btn-txt">Go to Dashboard →</span></button>
      </div>
    </div>

  </div>

  <div class="card-footer" id="cardFooter">
    Already have an account? <a href="/login">Sign in</a>
  </div>
</div>

<div class="toast" id="toast">
  <div class="toast-dot"></div>
  <span id="toastMsg">Done</span>
</div>
`;

export default function SignupPage() {
  const rootRef = useRef(null);

  useEffect(() => {
    const $ = (id) => document.getElementById(id);

    let currentStep = 1;
    let generatedOTP = "";
    let timerInterval = null;
    let timerSeconds = 30;
    let userData = {};

    /* ── Google signup ── */
    async function handleGoogle() {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
          role: "tenant",
          createdAt: new Date().toISOString(),
        });
        showToast("✅ Signed in with Google!");
        setTimeout(() => { window.location.href = "/"; }, 1000);
      } catch (e) {
        showToast("⚠️ " + e.message, true);
      }
    }

    /* ── Avatar upload ── */
    function onFileChange() {
      const file = this.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = $("avatarPreview");
        img.src = e.target.result;
        img.classList.add("show");
        $("avatarPlus").style.display = "none";
        userData.photo = e.target.result;
      };
      reader.readAsDataURL(file);
    }

    /* ── Password strength ── */
    function setReq(id, ok) {
      const el = $(id);
      if (ok) { el.classList.add("ok"); el.querySelector(".req-icon").textContent = "✓"; }
      else { el.classList.remove("ok"); el.querySelector(".req-icon").textContent = "○"; }
    }
    function checkStrength() {
      const val = $("passInput").value;
      const has8 = val.length >= 8;
      const hasUpper = /[A-Z]/.test(val);
      const hasNum = /[0-9]/.test(val);
      const hasSpec = /[!@#$%^&*(),.?":{}|<>]/.test(val);
      setReq("req8", has8); setReq("reqUpper", hasUpper); setReq("reqNum", hasNum); setReq("reqSpecial", hasSpec);
      const score = [has8, hasUpper, hasNum, hasSpec].filter(Boolean).length;
      const labels = ["", "Weak ❌", "Fair ⚠️", "Good 👍", "Strong ✅"];
      const colorMap = ["var(--bg3)", "#ff4d6a", "#ff9040", "#f0b429", "#22d88f"];
      for (let i = 1; i <= 4; i++) $("bar" + i).style.background = i <= score ? colorMap[score] : "var(--bg3)";
      const lbl = $("strengthLabel");
      lbl.textContent = val.length ? labels[score] : "Enter a password";
      lbl.style.color = val.length ? colorMap[score] : "var(--txt2)";
    }

    /* ── Toggle password visibility ── */
    function togglePass(inputId, btn) {
      const inp = $(inputId);
      const isPass = inp.type === "password";
      inp.type = isPass ? "text" : "password";
      btn.innerHTML = isPass
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    }

    /* ── Validation ── */
    function showErr(id, show) { $(id).classList.toggle("show", show); }
    function markField(id, valid) { const el = $(id); el.classList.toggle("error", !valid); el.classList.toggle("valid", valid); }
    function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
    function validatePhone(p) { return /^[\+\d\s\-\(\)]{7,15}$/.test(p); }

    /* ── Step navigation ── */
    function showStep(n) {
      document.querySelectorAll(".step-panel").forEach((p) => p.classList.remove("active"));
      $("panel" + n).classList.add("active");
      updateStepUI(n);
      currentStep = n;
      if (n === 4) $("cardFooter").style.display = "none";
    }
    function updateStepUI(n) {
      for (let i = 1; i <= 3; i++) {
        const dot = $("dot" + i), lbl = $("lbl" + i);
        if (i < n) { dot.classList.add("done"); dot.classList.remove("active"); lbl.classList.add("done"); lbl.classList.remove("active"); }
        else if (i === n) { dot.classList.add("active"); dot.classList.remove("done"); lbl.classList.add("active"); lbl.classList.remove("done"); }
        else { dot.classList.remove("active", "done"); lbl.classList.remove("active", "done"); }
      }
      for (let i = 1; i <= 2; i++) $("line" + i).classList.toggle("done", n > i);
    }

    function goToStep2() {
      const name = $("fullName").value.trim();
      const email = $("emailInput").value.trim();
      const phone = $("phoneInput").value.trim();
      const role = $("roleInput").value;
      const terms = $("termsCheck").checked;
      let ok = true;

      if (!name) { showErr("errName", true); markField("fullName", false); ok = false; } else { showErr("errName", false); markField("fullName", true); }
      if (!validateEmail(email)) { showErr("errEmail", true); markField("emailInput", false); ok = false; } else { showErr("errEmail", false); markField("emailInput", true); }
      if (phone && !validatePhone(phone)) { showErr("errPhone", true); markField("phoneInput", false); ok = false; } else { showErr("errPhone", false); if (phone) markField("phoneInput", true); }
      if (!role) { showErr("errRole", true); markField("roleInput", false); ok = false; } else { showErr("errRole", false); markField("roleInput", true); }
      if (!terms) { showToast("⚠️ Please accept Terms & Privacy Policy", true); ok = false; }
      if (!ok) return;

      userData = { name, email, phone, role };
      showStep(2);
    }

    async function goToStep3() {
      const pass = $("passInput").value;
      const confirm = $("confirmPass").value;
      let ok = true;
      if (pass.length < 8) { showErr("errPass", true); markField("passInput", false); ok = false; } else { showErr("errPass", false); markField("passInput", true); }
      if (pass !== confirm) { showErr("errConfirm", true); markField("confirmPass", false); ok = false; } else if (confirm) { showErr("errConfirm", false); markField("confirmPass", true); }
      if (!ok) return;

      userData.password = pass;
      const btn = $("step2Btn");
      btn.classList.add("loading"); btn.disabled = true;

      try {
        const userCred = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        const user = userCred.user;
        if (userData.name) await updateProfile(user, { displayName: userData.name });

        await setDoc(doc(db, "users", user.uid), {
          name: userData.name,
          email: userData.email,
          phone: userData.phone || "",
          role: userData.role,
          photo: userData.photo || "https://i.pravatar.cc/100",
          createdAt: new Date().toISOString(),
          verified: false,
        });

        userData.uid = user.uid;
        sendOTP();
        showStep(3);
        $("otpEmailDisplay").textContent = userData.email;
        startTimer();
      } catch (e) {
        showToast("⚠️ " + (e.message || "Signup failed"), true);
      }
      btn.classList.remove("loading"); btn.disabled = false;
    }

    function goToStep1() { showStep(1); }
    function goToStep2FromOTP() { stopTimer(); showStep(2); }

    /* ── OTP engine ── */
    function generateOTP() { return String(Math.floor(100000 + Math.random() * 900000)); }
    function sendOTP() {
      generatedOTP = generateOTP();
      console.log("[SmartRent] OTP:", generatedOTP);
      showToast("📧 OTP sent! (Demo: " + generatedOTP + ")");
    }
    function resendOTP() {
      sendOTP();
      startTimer();
      $("resendBtn").disabled = true;
      boxes.forEach((b) => { b.value = ""; b.classList.remove("filled"); });
      boxes[0].focus();
    }

    function startTimer() {
      stopTimer();
      timerSeconds = 30;
      updateTimerUI();
      $("resendBtn").disabled = true;
      timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerUI();
        if (timerSeconds <= 0) { stopTimer(); $("resendBtn").disabled = false; }
      }, 1000);
    }
    function stopTimer() { clearInterval(timerInterval); timerInterval = null; }
    function updateTimerUI() {
      $("timerNum").textContent = timerSeconds;
      const circumference = 163;
      const offset = circumference - (timerSeconds / 30) * circumference;
      $("timerCircle").style.strokeDashoffset = offset;
      $("timerCircle").style.stroke = timerSeconds > 15 ? "var(--accent)" : timerSeconds > 7 ? "var(--orange)" : "var(--red)";
    }

    const boxes = Array.from(rootRef.current.querySelectorAll(".otp-box"));
    function getOTPValue() { return boxes.map((b) => b.value).join(""); }
    function checkAutoVerify() { if (getOTPValue().length === 6) verifyOTP(); }

    const otpInputHandlers = boxes.map((box, i) => {
      const onInput = () => {
        const v = box.value.replace(/\D/g, "");
        box.value = v.slice(-1);
        box.classList.toggle("filled", box.value !== "");
        if (box.value && i < boxes.length - 1) boxes[i + 1].focus();
        checkAutoVerify();
      };
      const onKeydown = (e) => {
        if (e.key === "Backspace" && !box.value && i > 0) {
          boxes[i - 1].focus();
          boxes[i - 1].value = "";
          boxes[i - 1].classList.remove("filled");
        }
      };
      const onPaste = (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "");
        [...text.slice(0, 6)].forEach((ch, j) => { if (boxes[j]) { boxes[j].value = ch; boxes[j].classList.add("filled"); } });
        const next = Math.min(text.length, 5);
        boxes[next].focus();
        checkAutoVerify();
      };
      box.addEventListener("input", onInput);
      box.addEventListener("keydown", onKeydown);
      box.addEventListener("paste", onPaste);
      return { box, onInput, onKeydown, onPaste };
    });

    async function verifyOTP() {
      const entered = getOTPValue();
      if (entered.length < 6) { showToast("⚠️ Enter all 6 digits", true); return; }
      const btn = $("verifyBtn");
      btn.classList.add("loading"); btn.disabled = true;
      await new Promise((r) => setTimeout(r, 800));

      if (entered === generatedOTP) {
        stopTimer();
        try {
          if (userData.uid) await setDoc(doc(db, "users", userData.uid), { verified: true }, { merge: true });
        } catch (_) {}
        btn.classList.remove("loading"); btn.disabled = false;
        showStep(4);
      } else {
        boxes.forEach((b) => { b.classList.add("error"); setTimeout(() => b.classList.remove("error"), 600); });
        showToast("❌ Incorrect OTP. Try again.", true);
        btn.classList.remove("loading"); btn.disabled = false;
      }
    }

    /* ── Toast ── */
    let toastTimer;
    function showToast(msg, isErr = false) {
      const t = $("toast");
      $("toastMsg").textContent = msg;
      t.classList.toggle("err", isErr);
      t.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => t.classList.remove("show"), 3400);
    }

    /* ── Focus first OTP box when step 3 opens ── */
    const panel3 = $("panel3");
    const observer = new MutationObserver(() => {
      if (panel3.classList.contains("active")) setTimeout(() => boxes[0].focus(), 200);
    });
    observer.observe(panel3, { attributes: true, attributeFilter: ["class"] });

    /* ── wire up buttons ── */
    const avatarRing = $("avatarRing");
    const fileInput = $("fileInput");
    const passInput = $("passInput");
    const step1Btn = $("step1Btn");
    const googleBtn = $("googleBtn");
    const togglePass1 = $("togglePass1");
    const togglePass2 = $("togglePass2");
    const backToStep1 = $("backToStep1");
    const step2Btn = $("step2Btn");
    const backToStep2 = $("backToStep2");
    const verifyBtn = $("verifyBtn");
    const resendBtn = $("resendBtn");
    const goDashBtn = $("goDashBtn");

    const onAvatarClick = () => fileInput.click();
    const onTogglePass1 = () => togglePass("passInput", togglePass1);
    const onTogglePass2 = () => togglePass("confirmPass", togglePass2);
    const onGoDash = () => { window.location.href = "/"; };

    avatarRing.addEventListener("click", onAvatarClick);
    fileInput.addEventListener("change", onFileChange);
    passInput.addEventListener("input", checkStrength);
    step1Btn.addEventListener("click", goToStep2);
    googleBtn.addEventListener("click", handleGoogle);
    togglePass1.addEventListener("click", onTogglePass1);
    togglePass2.addEventListener("click", onTogglePass2);
    backToStep1.addEventListener("click", goToStep1);
    step2Btn.addEventListener("click", goToStep3);
    backToStep2.addEventListener("click", goToStep2FromOTP);
    verifyBtn.addEventListener("click", verifyOTP);
    resendBtn.addEventListener("click", resendOTP);
    goDashBtn.addEventListener("click", onGoDash);

    return () => {
      stopTimer();
      observer.disconnect();
      avatarRing.removeEventListener("click", onAvatarClick);
      fileInput.removeEventListener("change", onFileChange);
      passInput.removeEventListener("input", checkStrength);
      step1Btn.removeEventListener("click", goToStep2);
      googleBtn.removeEventListener("click", handleGoogle);
      togglePass1.removeEventListener("click", onTogglePass1);
      togglePass2.removeEventListener("click", onTogglePass2);
      backToStep1.removeEventListener("click", goToStep1);
      step2Btn.removeEventListener("click", goToStep3);
      backToStep2.removeEventListener("click", goToStep2FromOTP);
      verifyBtn.removeEventListener("click", verifyOTP);
      resendBtn.removeEventListener("click", resendOTP);
      goDashBtn.removeEventListener("click", onGoDash);
      otpInputHandlers.forEach(({ box, onInput, onKeydown, onPaste }) => {
        box.removeEventListener("input", onInput);
        box.removeEventListener("keydown", onKeydown);
        box.removeEventListener("paste", onPaste);
      });
    };
  }, []);

  return (
    <div className="signup-page" ref={rootRef} dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
  );
}
