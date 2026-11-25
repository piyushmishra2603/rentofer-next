"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import "./page.css";

const BODY_HTML = `
<div class="bg-orbs">
  <div class="orb orb1"></div>
  <div class="orb orb2"></div>
  <div class="orb orb3"></div>
</div>
<div class="grid-lines"></div>

<div class="wrapper">
  <div class="panel-left">
    <div class="badge"><span></span> Zero Brokerage Rentals</div>
    <h1>Find your <em>perfect</em> home, effortlessly.</h1>
    <p>Verified homes, PGs and commercial spaces — directly from owners, completely free.</p>
    <div class="stats">
      <div class="stat"><div class="stat-num">₹0</div><div class="stat-lbl">Brokerage</div></div>
      <div class="stat"><div class="stat-num">100%</div><div class="stat-lbl">Free to use</div></div>
      <div class="stat"><div class="stat-num">Direct</div><div class="stat-lbl">Owners</div></div>
    </div>
  </div>

  <div class="panel-right">
    <div class="logo-row">
      <div class="logo-icon">🏙️</div>
      <div class="logo-text">Smart<span>Rent</span></div>
    </div>

    <h2 id="title">Welcome back</h2>
    <p class="sub" id="subtitle">Sign in to your account to continue</p>

    <div class="field has-icon">
      <label>Email address</label>
      <span class="field-icon">✉</span>
      <input id="email" type="email" placeholder="you@example.com" autocomplete="email">
    </div>

    <div id="passArea">
      <div class="field has-icon">
        <label>Password</label>
        <span class="field-icon">🔒</span>
        <input id="password" type="password" placeholder="Enter your password" autocomplete="current-password">
        <button class="eye-btn" type="button" id="eyeBtn" aria-label="Toggle password visibility">👁</button>
      </div>

      <div class="row-opts">
        <label class="remember-label">
          <input type="checkbox" id="remember">
          Remember me
        </label>
        <button class="forgot-btn" type="button" id="forgotBtn">Forgot password?</button>
      </div>
    </div>

    <button class="btn btn-primary ripple-container" id="loginBtn" type="button">
      <span id="btnText">Sign In</span>
    </button>

    <p class="signup-row" id="signupRow">Don't have an account? <a href="/signup">Create one →</a></p>
    <p class="signup-row" id="backRow" style="display:none"><a href="#" id="backLink">← Back to sign in</a></p>

    <p id="msg"></p>
  </div>
</div>
`;

const RESET_COOLDOWN = 60; // seconds before another reset email can be requested

export default function LoginPage() {
  const router = useRouter();
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const $ = (id) => root.querySelector("#" + id);

    let mode = "login"; // "login" | "reset"
    let busy = false;
    let cooldownTimer = null;

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/");
    });

    function setMsg(text, type = "error") {
      const el = $("msg");
      el.textContent = text;
      el.className = text ? type : "";
    }

    function shake() {
      const btn = $("loginBtn");
      btn.classList.add("shake");
      setTimeout(() => btn.classList.remove("shake"), 400);
    }

    function setBtn(label, disabled = false) {
      $("btnText").innerHTML = label;
      $("loginBtn").style.pointerEvents = disabled ? "none" : "";
      $("loginBtn").style.opacity = disabled ? ".7" : "";
    }

    function setMode(next) {
      mode = next;
      setMsg("");
      const reset = next === "reset";
      $("passArea").style.display = reset ? "none" : "";
      $("signupRow").style.display = reset ? "none" : "";
      $("backRow").style.display = reset ? "" : "none";
      $("title").textContent = reset ? "Reset your password" : "Welcome back";
      $("subtitle").textContent = reset
        ? "Enter your account email and we'll send you a link to set a new password."
        : "Sign in to your account to continue";
      if (!cooldownTimer) setBtn(reset ? "Send Reset Link" : "Sign In");
      $("email").focus();
    }

    async function login() {
      const email = $("email").value.trim();
      const password = $("password").value;
      const remember = $("remember").checked;

      setMsg("");
      if (!email || !password) {
        setMsg("Please fill in all fields.");
        shake();
        return;
      }

      busy = true;
      setBtn('<span class="spinner"></span> Signing in…', true);
      try {
        await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
        await signInWithEmailAndPassword(auth, email, password);
        setBtn('<div class="check-circle"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div> Success!', true);
        setMsg("Redirecting you now…", "success");
        setTimeout(() => router.push("/"), 900);
      } catch (err) {
        const friendly = {
          "auth/invalid-email": "Please enter a valid email address.",
          "auth/user-not-found": "Incorrect email or password.",
          "auth/wrong-password": "Incorrect email or password.",
          "auth/invalid-credential": "Incorrect email or password.",
          "auth/user-disabled": "This account has been disabled. Please contact support.",
          "auth/too-many-requests": "Too many attempts. Please wait a few minutes or reset your password.",
          "auth/network-request-failed": "Network error. Check your connection.",
        };
        setMsg(friendly[err.code] || "Could not sign in. Please try again.");
        shake();
        setBtn("Sign In");
      } finally {
        busy = false;
      }
    }

    function startCooldown() {
      let left = RESET_COOLDOWN;
      setBtn(`Resend in ${left}s`, true);
      cooldownTimer = setInterval(() => {
        left -= 1;
        if (left <= 0) {
          clearInterval(cooldownTimer);
          cooldownTimer = null;
          setBtn(mode === "reset" ? "Send Reset Link" : "Sign In");
        } else {
          setBtn(`Resend in ${left}s`, true);
        }
      }, 1000);
    }

    async function sendReset() {
      const email = $("email").value.trim();
      setMsg("");
      if (!email) {
        setMsg("Please enter your email address.");
        shake();
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setMsg("Please enter a valid email address.");
        shake();
        return;
      }

      busy = true;
      setBtn('<span class="spinner"></span> Sending…', true);
      try {
        await sendPasswordResetEmail(auth, email);
        setMsg("✅ If an account exists for this email, a reset link is on its way. Check your inbox and spam folder.", "success");
        startCooldown();
      } catch (err) {
        if (err.code === "auth/user-not-found") {
          // Same message either way, so nobody can use this form to find out who has an account.
          setMsg("✅ If an account exists for this email, a reset link is on its way. Check your inbox and spam folder.", "success");
          startCooldown();
        } else {
          const friendly = {
            "auth/invalid-email": "Please enter a valid email address.",
            "auth/too-many-requests": "Too many requests. Please wait a few minutes and try again.",
            "auth/network-request-failed": "Network error. Check your connection.",
          };
          setMsg(friendly[err.code] || "Could not send the reset email. Please try again.");
          shake();
          setBtn("Send Reset Link");
        }
      } finally {
        busy = false;
      }
    }

    const submit = () => {
      if (busy) return;
      if (mode === "reset") sendReset();
      else login();
    };

    function togglePass() {
      const pass = $("password");
      const isText = pass.type === "text";
      pass.type = isText ? "password" : "text";
      $("eyeBtn").textContent = isText ? "👁" : "🙈";
    }

    const onKeydown = (e) => {
      if (e.key === "Enter") submit();
    };
    const onForgot = () => setMode("reset");
    const onBack = (e) => {
      e.preventDefault();
      setMode("login");
    };
    const rippleHandler = function (e) {
      const r = document.createElement("span");
      r.className = "ripple";
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
      this.appendChild(r);
      setTimeout(() => r.remove(), 600);
    };

    const loginBtn = $("loginBtn");
    const forgotBtn = $("forgotBtn");
    const eyeBtn = $("eyeBtn");
    const backLink = $("backLink");

    // Let the "Forgot password?" link carry the typed email over to the reset screen.
    root.addEventListener("keydown", onKeydown);
    loginBtn.addEventListener("click", submit);
    forgotBtn.addEventListener("click", onForgot);
    eyeBtn.addEventListener("click", togglePass);
    backLink.addEventListener("click", onBack);
    const rippleEls = root.querySelectorAll(".ripple-container");
    rippleEls.forEach((el) => el.addEventListener("click", rippleHandler));

    return () => {
      unsub();
      if (cooldownTimer) clearInterval(cooldownTimer);
      root.removeEventListener("keydown", onKeydown);
      loginBtn.removeEventListener("click", submit);
      forgotBtn.removeEventListener("click", onForgot);
      eyeBtn.removeEventListener("click", togglePass);
      backLink.removeEventListener("click", onBack);
      rippleEls.forEach((el) => el.removeEventListener("click", rippleHandler));
    };
  }, [router]);

  return <div className="login-page" ref={rootRef} dangerouslySetInnerHTML={{ __html: BODY_HTML }} />;
}
