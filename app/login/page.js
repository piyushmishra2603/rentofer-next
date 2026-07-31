"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
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
    <div class="badge"><span></span> AI-Powered Platform</div>
    <h1>Find your <em>perfect</em> home, effortlessly.</h1>
    <p>Smart rentals powered by real-time AI. Trusted by thousands of renters and landlords.</p>
    <div class="stats">
      <div class="stat"><div class="stat-num">12K+</div><div class="stat-lbl">Listings</div></div>
      <div class="stat"><div class="stat-num">98%</div><div class="stat-lbl">Satisfaction</div></div>
      <div class="stat"><div class="stat-num">4.9★</div><div class="stat-lbl">Rated</div></div>
    </div>
  </div>

  <div class="panel-right">
    <div class="logo-row">
      <div class="logo-icon">🏙️</div>
      <div class="logo-text">Smart<span>Rent</span> AI</div>
    </div>

    <h2>Welcome back</h2>
    <p class="sub">Sign in to your account to continue</p>

    <div class="field has-icon">
      <label>Email address</label>
      <span class="field-icon">✉</span>
      <input id="email" type="email" placeholder="you@example.com" autocomplete="email">
    </div>

    <div class="field has-icon">
      <label>Password</label>
      <span class="field-icon">🔒</span>
      <input id="password" type="password" placeholder="Enter your password" autocomplete="current-password">
      <button class="eye-btn" type="button" id="eyeBtn" aria-label="Toggle password visibility">👁</button>
    </div>
    <div class="strength-bar" id="strengthBar" style="display:none">
      <div class="strength-seg" id="s1"></div>
      <div class="strength-seg" id="s2"></div>
      <div class="strength-seg" id="s3"></div>
      <div class="strength-seg" id="s4"></div>
    </div>
    <div class="strength-label" id="strengthLabel" style="display:none"></div>

    <div class="row-opts">
      <label class="remember-label">
        <input type="checkbox" id="remember">
        Remember me
      </label>
      <button class="forgot-btn" type="button" id="forgotBtn">Forgot password?</button>
    </div>

    <button class="btn btn-primary ripple-container" id="loginBtn" type="button">
      <span id="btnText">Sign In</span>
    </button>

    <div class="divider">or continue with</div>

    <button class="btn btn-google ripple-container" id="googleBtn" type="button">
      <svg width="17" height="17" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
      Continue with Google
    </button>

    <button class="btn btn-bio ripple-container" id="bioBtn" type="button">
      <span style="font-size:17px">🔐</span> Login with Biometrics
    </button>

    <p class="signup-row">Don't have an account? <a href="/signup">Create one →</a></p>

    <p id="msg"></p>
  </div>
</div>
`;

export default function LoginPage() {
  const router = useRouter();
  const rootRef = useRef(null);

  useEffect(() => {
    const provider = new GoogleAuthProvider();

    const $ = (id) => document.getElementById(id);

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/");
    });

    function setMsg(text, type = "error") {
      const el = $("msg");
      el.textContent = text;
      el.className = type;
    }

    function setBtnState(loading, success = false) {
      const btn = $("loginBtn");
      const txt = $("btnText");
      if (loading) {
        btn.style.pointerEvents = "none";
        txt.innerHTML = '<span class="spinner"></span> Signing in…';
      } else if (success) {
        txt.innerHTML =
          '<div class="check-circle"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></div> Success!';
      } else {
        btn.style.pointerEvents = "";
        txt.innerHTML = "Sign In";
      }
    }

    async function login() {
      const email = $("email").value.trim();
      const password = $("password").value;
      const remember = $("remember").checked;
      const btn = $("loginBtn");

      setMsg("");
      if (!email || !password) {
        setMsg("Please fill in all fields.");
        btn.classList.add("shake");
        setTimeout(() => btn.classList.remove("shake"), 400);
        return;
      }

      setBtnState(true);
      try {
        await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
        await signInWithEmailAndPassword(auth, email, password);
        setBtnState(false, true);
        setMsg("Redirecting you now…", "success");
        setTimeout(() => router.push("/"), 900);
      } catch (err) {
        const friendly = {
          "auth/invalid-email": "Please enter a valid email address.",
          "auth/user-not-found": "No account found with this email.",
          "auth/wrong-password": "Incorrect password. Try again.",
          "auth/too-many-requests": "Too many attempts. Please wait and try again.",
          "auth/network-request-failed": "Network error. Check your connection.",
        };
        setMsg(friendly[err.code] || err.message);
        btn.classList.add("shake");
        setTimeout(() => btn.classList.remove("shake"), 400);
        setBtnState(false);
      }
    }

    async function googleLogin() {
      setMsg("");
      try {
        await signInWithPopup(auth, provider);
        router.push("/");
      } catch (err) {
        setMsg(err.code === "auth/popup-closed-by-user" ? "Google sign-in was cancelled." : err.message);
      }
    }

    async function forgotPassword() {
      const email = $("email").value.trim();
      if (!email) {
        setMsg("Enter your email above first, then click Forgot Password.");
        return;
      }
      try {
        await sendPasswordResetEmail(auth, email);
        setMsg("✅ Reset email sent! Check your inbox.", "success");
      } catch (err) {
        setMsg(err.code === "auth/user-not-found" ? "No account found with this email." : err.message);
      }
    }

    async function biometricLogin() {
      setMsg("");
      if (!window.PublicKeyCredential) {
        setMsg("Biometric authentication is not supported on this device.");
        return;
      }
      try {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        await navigator.credentials.get({ publicKey: { challenge, timeout: 60000, userVerification: "preferred" } });
        if (auth.currentUser) {
          setMsg("✅ Biometric verified!", "success");
          setTimeout(() => router.push("/"), 800);
        } else {
          setMsg("Please sign in with email first to register biometrics.");
        }
      } catch {
        setMsg("Biometric cancelled or failed. Try another method.");
      }
    }

    function togglePass() {
      const pass = $("password");
      const btn = $("eyeBtn");
      const isText = pass.type === "text";
      pass.type = isText ? "password" : "text";
      btn.textContent = isText ? "👁" : "🙈";
    }

    function checkStrength(val) {
      const bar = $("strengthBar");
      const label = $("strengthLabel");
      const segs = ["s1", "s2", "s3", "s4"].map((id) => $(id));
      if (!val) {
        bar.style.display = "none";
        label.style.display = "none";
        return;
      }
      bar.style.display = "flex";
      label.style.display = "block";
      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;
      const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
      const labels = ["Weak", "Fair", "Good", "Strong"];
      segs.forEach((s, i) => {
        s.style.background = i < score ? colors[score - 1] : "var(--border)";
      });
      label.textContent = labels[score - 1] || "";
      label.style.color = colors[score - 1] || "var(--muted)";
    }

    const onKeydown = (e) => {
      if (e.key === "Enter") login();
    };
    document.addEventListener("keydown", onKeydown);

    const loginBtn = $("loginBtn");
    const googleBtn = $("googleBtn");
    const bioBtn = $("bioBtn");
    const forgotBtn = $("forgotBtn");
    const eyeBtn = $("eyeBtn");
    const passwordInput = $("password");

    loginBtn.addEventListener("click", login);
    googleBtn.addEventListener("click", googleLogin);
    bioBtn.addEventListener("click", biometricLogin);
    forgotBtn.addEventListener("click", forgotPassword);
    eyeBtn.addEventListener("click", togglePass);
    passwordInput.addEventListener("input", (e) => checkStrength(e.target.value));

    const rippleEls = rootRef.current.querySelectorAll(".ripple-container");
    const rippleHandler = function (e) {
      const r = document.createElement("span");
      r.className = "ripple";
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
      this.appendChild(r);
      setTimeout(() => r.remove(), 600);
    };
    rippleEls.forEach((el) => el.addEventListener("click", rippleHandler));

    return () => {
      unsub();
      document.removeEventListener("keydown", onKeydown);
      loginBtn.removeEventListener("click", login);
      googleBtn.removeEventListener("click", googleLogin);
      bioBtn.removeEventListener("click", biometricLogin);
      forgotBtn.removeEventListener("click", forgotPassword);
      eyeBtn.removeEventListener("click", togglePass);
      passwordInput.removeEventListener("input", (e) => checkStrength(e.target.value));
      rippleEls.forEach((el) => el.removeEventListener("click", rippleHandler));
    };
  }, [router]);

  return (
    <div className="login-page" ref={rootRef} dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
  );
}
