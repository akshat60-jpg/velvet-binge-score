"use client";
import { useState, useEffect, useRef } from "react";

const C = {
  dark: "#0D0508",
  burgundy: "#6B1A3A",
  burgundyDeep: "#3D0B1F",
  burgundyLight: "#8B2252",
  gold: "#C9A84C",
  goldLight: "#E8C97A",
  cream: "#F5EDD8",
  text: "#E8DDD0",
  muted: "#9A8A80",
};

const GENRES = ["Thriller / Suspense","Romance","Horror","Drama / Slice of Life","Crime / Noir","Fantasy / Mythology","Comedy","Historical / Period","Other"];
const AUDIENCES = ["18–24 (Gen Z)","25–35 (Millennials)","35–45","Family / All ages","Urban professionals"];
const LOADING_MSGS = ["Reading your story…","Analysing hook strength…","Testing emotional grip…","Scoring binge triggers…","Calculating your Binge Score™…"];

function getVerdict(s) {
  if (s >= 85) return "Unmissable";
  if (s >= 70) return "Highly Bingeable";
  if (s >= 55) return "Has Real Potential";
  if (s >= 40) return "Needs Sharpening";
  return "Back to the Drawing Room";
}

function getScoreColor(s) {
  if (s >= 70) return C.goldLight;
  if (s >= 50) return "#d4a855";
  return "#b07060";
}

function AnimatedBar({ target, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(target), delay); return () => clearTimeout(t); }, [target, delay]);
  return (
    <div style={{ height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 1, overflow: "hidden", margin: "8px 0" }}>
      <div style={{ height: "100%", width: `${w}%`, background: `linear-gradient(90deg, ${C.burgundyLight}, ${C.gold})`, borderRadius: 1, transition: "width 1.1s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}

function AnimatedScore({ target }) {
  const [d, setD] = useState(0);
  useEffect(() => {
    let v = 0;
    const step = Math.ceil(target / 40);
    const iv = setInterval(() => { v = Math.min(v + step, target); setD(v); if (v >= target) clearInterval(iv); }, 30);
    return () => clearInterval(iv);
  }, [target]);
  return <>{d}</>;
}

function VelvetLogo() {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="64" height="64">
      <defs>
        <radialGradient id="bgG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8B2252" />
          <stop offset="100%" stopColor="#3D0B1F" />
        </radialGradient>
        <linearGradient id="vG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8C97A" />
          <stop offset="100%" stopColor="#C9A84C" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="100" height="100" rx="22" fill="url(#bgG)" />
      <path d="M30 45 Q60 30 90 55 Q70 40 50 65 Q40 55 30 45Z" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
      <path d="M25 60 Q55 42 88 68" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
      <path d="M38 38 L60 82 L82 38" fill="none" stroke="url(#vG)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="82" cy="38" r="6" fill="url(#vG)" />
    </svg>
  );
}

const inputStyle = {
  width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 2, padding: "13px 15px", fontFamily: "'DM Sans', sans-serif",
  fontSize: 14, fontWeight: 300, color: C.cream, outline: "none",
};

const labelStyle = {
  display: "block", fontSize: 10, fontWeight: 500, letterSpacing: "0.18em",
  textTransform: "uppercase", color: C.gold, marginBottom: 8, fontFamily: "'DM Sans', sans-serif",
};

export default function Home() {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [audience, setAudience] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [phase, setPhase] = useState("form");
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MSGS[0]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const ivRef = useRef(null);

  async function analyse() {
    setError("");
    if (!title.trim() || !genre || !audience || synopsis.trim().length < 80) {
      setError("Please fill all fields. Synopsis should be at least 80 characters.");
      return;
    }
    setPhase("loading");
    let i = 0;
    ivRef.current = setInterval(() => { i++; setLoadingMsg(LOADING_MSGS[i % LOADING_MSGS.length]); }, 1400);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, genre, audience, synopsis }),
      });
      clearInterval(ivRef.current);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setPhase("results");
    } catch (e) {
      clearInterval(ivRef.current);
      setError("Something went wrong. Please try again.");
      setPhase("form");
    }
  }

  function reset() {
    setPhase("form"); setResult(null); setError("");
    setTitle(""); setGenre(""); setAudience(""); setSynopsis("");
  }

  return (
    <div style={{ minHeight: "100vh", background: C.dark, fontFamily: "'DM Sans', sans-serif", position: "relative", overflow: "hidden" }}>
      {/* Atmospheric bg */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(107,26,58,0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(61,11,31,0.5) 0%, transparent 60%)" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", padding: "0 20px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", padding: "48px 0 32px" }}>
          <div style={{ marginBottom: 16 }}><VelvetLogo /></div>
          <div style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: C.gold, marginBottom: 14 }}>Velvet · Ab Cinema Suno</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(34px,6vw,52px)", fontWeight: 300, lineHeight: 1.1, color: C.cream }}>
            Will Your Story<br /><em style={{ fontStyle: "italic", color: C.goldLight }}>Make Them Binge?</em>
          </h1>
          <p style={{ marginTop: 12, fontSize: 14, fontWeight: 300, color: C.muted, lineHeight: 1.65, maxWidth: 440, margin: "12px auto 0" }}>
            Enter your story's title, genre, and synopsis. Our AI analyses it across 5 cinematic dimensions and gives you a Binge Score™.
          </p>
          <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`, margin: "24px auto 0" }} />
        </div>

        {/* FORM */}
        {phase === "form" && (
          <div className="fadeUp" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(201,168,76,0.1)", borderRadius: 3, padding: "32px 28px 36px" }}>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Story Title</label>
              <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Raat Ka Shehar" maxLength={100} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Genre</label>
                <select style={inputStyle} value={genre} onChange={e => setGenre(e.target.value)}>
                  <option value="">Select…</option>
                  {GENRES.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Target Audience</label>
                <select style={inputStyle} value={audience} onChange={e => setAudience(e.target.value)}>
                  <option value="">Select…</option>
                  {AUDIENCES.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Synopsis / First Episode Hook <span style={{ opacity: 0.4, fontSize: 9 }}>(min 80 chars)</span></label>
              <textarea style={{ ...inputStyle, height: 140, resize: "none", lineHeight: 1.65 }}
                value={synopsis} onChange={e => setSynopsis(e.target.value)}
                placeholder="Describe your story: setup, central conflict, main character(s), and how the first episode opens. The more vivid, the better your score."
                maxLength={3000} />
              <div style={{ textAlign: "right", fontSize: 11, color: C.muted, marginTop: 4 }}>{synopsis.length} / 3000</div>
            </div>
            <button onClick={analyse} style={{
              width: "100%", background: `linear-gradient(135deg, ${C.burgundy}, ${C.burgundyLight})`,
              border: `1px solid rgba(201,168,76,0.3)`, borderRadius: 2, padding: "17px 0",
              fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 400,
              letterSpacing: "0.05em", color: C.goldLight, cursor: "pointer",
            }}>
              ✦ &nbsp; Grade My Story
            </button>
            {error && (
              <div style={{ marginTop: 14, background: "rgba(139,34,82,0.15)", border: "1px solid rgba(139,34,82,0.3)", borderRadius: 2, padding: "12px 14px", fontSize: 13, color: "#e07a9a" }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* LOADING */}
        {phase === "loading" && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ width: 48, height: 48, border: "2px solid rgba(201,168,76,0.15)", borderTopColor: C.gold, borderRadius: "50%", margin: "0 auto 24px", animation: "spin 1s linear infinite" }} />
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: "italic", color: C.muted }}>{loadingMsg}</p>
          </div>
        )}

        {/* RESULTS */}
        {phase === "results" && result && (
          <div className="fadeUp">
            {/* Score Hero */}
            <div style={{ textAlign: "center", padding: "44px 20px 36px", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 3, background: "rgba(255,255,255,0.02)", marginBottom: 16, position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 180, height: 1, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />
              <div style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: C.gold, marginBottom: 16 }}>Binge Score™</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 88, fontWeight: 300, lineHeight: 1, color: C.cream }}>
                <AnimatedScore target={result.overall} />
                <sup style={{ fontSize: 24, color: C.gold, verticalAlign: "super" }}>/100</sup>
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontStyle: "italic", color: C.goldLight, margin: "14px 0 10px" }}>
                {getVerdict(result.overall)}
              </div>
              <p style={{ fontSize: 14, fontWeight: 300, color: C.muted, lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>{result.summary}</p>
            </div>

            {/* Dimensions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {result.dimensions.map((d, i) => (
                <div key={d.name} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 3, padding: "18px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.14em", textTransform: "uppercase", color: C.gold }}>{d.name}</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 300, color: getScoreColor(d.score), lineHeight: 1 }}>{d.score}</div>
                  </div>
                  <AnimatedBar target={d.score} delay={i * 120} />
                  <div style={{ fontSize: 12, fontWeight: 300, color: C.muted, lineHeight: 1.55 }}>{d.insight}</div>
                </div>
              ))}
            </div>

            {/* Script Doctor Notes */}
            <div style={{ border: "1px solid rgba(201,168,76,0.12)", borderRadius: 3, background: "rgba(255,255,255,0.02)", padding: "24px", marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 400, color: C.cream, marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>Script Doctor Notes</h3>
              {result.recommendations.map((rec, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < 2 ? 14 : 0 }}>
                  <div style={{ flexShrink: 0, width: 22, height: 22, border: "1px solid rgba(201,168,76,0.3)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: C.gold, fontWeight: 500, marginTop: 1 }}>{i + 1}</div>
                  <div style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.65, color: C.text }}>{rec}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ textAlign: "center", padding: "32px 20px", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 3, background: `linear-gradient(135deg, rgba(107,26,58,0.3) 0%, rgba(13,5,8,0.8) 100%)`, position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 120, height: 1, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, fontStyle: "italic", color: C.cream, marginBottom: 8 }}>Ready to take this to listeners?</h3>
              <p style={{ fontSize: 13, fontWeight: 300, color: C.muted, marginBottom: 22, lineHeight: 1.6 }}>
                Velvet is India's cinematic audio platform.<br />If your story has the bones, we have the stage.
              </p>
              <a href="https://velvet.audio" target="_blank" style={{ display: "inline-block", background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`, color: C.dark, padding: "13px 32px", fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none", borderRadius: 1 }}>
                Submit Your Story to Velvet
              </a>
              <div>
                <button onClick={reset} style={{ marginTop: 16, background: "none", border: "none", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, cursor: "pointer" }}>
                  ← Grade another story
                </button>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 40, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.15)" }}>
              Powered by <span style={{ color: C.gold, opacity: 0.5 }}>Velvet</span> · Ab Cinema Suno · Binge Score™ is proprietary to Velvet
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
