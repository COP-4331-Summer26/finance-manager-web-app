import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { AuthMode } from "../types";

interface Candle {
  h: number;
  up: boolean;
}
const CANDLES: Candle[] = [
  { h: 38, up: true  }, { h: 62, up: false }, { h: 44, up: true  }, { h: 80, up: true  },
  { h: 30, up: false }, { h: 55, up: true  }, { h: 70, up: true  }, { h: 48, up: false },
  { h: 92, up: true  }, { h: 40, up: false }, { h: 66, up: true  }, { h: 34, up: false },
  { h: 76, up: true  }, { h: 58, up: true  },
];

interface Particle {
  top: string;
  left: string;
  size: number;
  delay: string;
}
const PARTICLES: Particle[] = [
  { top: "14%", left: "18%", size: 90,  delay: "0s"   },
  { top: "62%", left: "10%", size: 60,  delay: "1.2s" },
  { top: "78%", left: "70%", size: 110, delay: "0.6s" },
  { top: "22%", left: "78%", size: 70,  delay: "1.8s" },
  { top: "45%", left: "48%", size: 130, delay: "0.3s" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit() {
    setError(null);

    if (isSignup && password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full bg-bg font-sans overflow-hidden">

      <style>{`
        @keyframes floatY { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-18px); } }
        @keyframes drawLine { to { stroke-dashoffset: 0; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) {
          .float-particle, .draw-line { animation: none !important; }
        }
      `}</style>

      {/* Left: Abstract Finance Art */}
      <div
        className="flex-1 relative overflow-hidden border-r border-border flex flex-col justify-between"
        style={{ background: "radial-gradient(circle at 30% 20%, #1A1F3D 0%, #0E1120 55%)" }}
      >
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="float-particle absolute rounded-full pointer-events-none"
            style={{
              top: p.top, left: p.left, width: p.size, height: p.size,
              background: i % 2 === 0 ? "#6366F130" : "#22D3EE22",
              filter: "blur(38px)",
              animation: `floatY ${6 + i}s ease-in-out infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}

        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: "radial-gradient(#232840 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            maskImage: "radial-gradient(circle at 50% 45%, black 0%, transparent 72%)",
            WebkitMaskImage: "radial-gradient(circle at 50% 45%, black 0%, transparent 72%)",
          }}
        />

        <div className="relative px-10 pt-9 z-[2]">
          <div className="flex items-center gap-2.5">
            <div className="w-[38px] h-[38px] rounded-[11px] bg-gradient-to-br from-accent to-cyan flex items-center justify-center text-[19px] font-extrabold text-white">
              $
            </div>
            <div className="text-text font-extrabold text-base tracking-tight">User Capital Flow</div>
          </div>
        </div>

        <div className="relative flex-1 flex items-end z-[2] px-10">
          <svg viewBox="0 0 420 220" className="w-full h-[62%]" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#22D3EE" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {CANDLES.map((c, i) => {
              const x = 8 + i * 30;
              const color = c.up ? "#10B981" : "#F43F5E";
              const baseY = 220;
              return (
                <g key={i} opacity={0.85}>
                  <line x1={x + 6} y1={baseY - c.h - 10} x2={x + 6} y2={baseY} stroke={color} strokeWidth={1.5} opacity={0.5} />
                  <rect x={x} y={baseY - c.h} width={12} height={c.h} rx={2} fill={color} opacity={0.85} />
                </g>
              );
            })}

            <path
              className="draw-line"
              d="M 0,190 C 60,170 90,120 140,110 C 190,100 220,60 270,55 C 320,50 360,20 420,10"
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth={3.5}
              strokeLinecap="round"
              filter="url(#glow)"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1}
              style={{ animation: "drawLine 2.2s ease-out forwards" }}
            />
          </svg>
        </div>

        <div className="relative z-[2] px-10 pb-11">
          <h2 className="text-text text-[26px] font-extrabold tracking-tight leading-tight mb-2.5 max-w-[380px]">
            Track every dollar.<br />Grow your capital.
          </h2>
          <p className="text-sub text-sm max-w-[340px] leading-relaxed m-0">
            One dashboard for spending, budgets, and credit — synced across web and mobile.
          </p>
        </div>
      </div>

      {/* Right: Auth Form */}
      <div className="flex-1 flex items-center justify-center bg-bg">
        <div key={mode} className="w-[360px]" style={{ animation: "fadeUp 0.35s ease" }}>

          <h1 className="text-text text-2xl font-extrabold tracking-tight mb-1.5">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sub text-[13.5px] mb-7">
            {isSignup ? "Start tracking your finances in minutes." : "Log in to see where your money's going."}
          </p>

          <div className="flex flex-col gap-3.5">
            {isSignup && (
              <div>
                <label className="block text-sub text-[11px] font-bold mb-1.5 uppercase tracking-wider">Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-card border border-border rounded-[9px] px-3.5 py-2.5 text-text text-sm outline-none box-border focus:border-accent focus:ring-2 focus:ring-accent/25 placeholder:text-sub"
                  placeholder="Brandon Smith"
                />
              </div>
            )}

            <div>
              <label className="block text-sub text-[11px] font-bold mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-card border border-border rounded-[9px] px-3.5 py-2.5 text-text text-sm outline-none box-border focus:border-accent focus:ring-2 focus:ring-accent/25 placeholder:text-sub"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sub text-[11px] font-bold uppercase tracking-wider">Password</label>
                {!isSignup && (
                  <button className="bg-transparent border-none text-accent-light text-xs font-semibold">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-card border border-border rounded-[9px] px-3.5 py-2.5 pr-11 text-text text-sm outline-none box-border focus:border-accent focus:ring-2 focus:ring-accent/25 placeholder:text-sub"
                  placeholder="••••••••"
                />
                <button
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-sub text-xs"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {isSignup && (
              <div>
                <label className="block text-sub text-[11px] font-bold mb-1.5 uppercase tracking-wider">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-card border border-border rounded-[9px] px-3.5 py-2.5 text-text text-sm outline-none box-border focus:border-accent focus:ring-2 focus:ring-accent/25 placeholder:text-sub"
                  placeholder="••••••••"
                />
              </div>
            )}

            {error && <p className="text-red text-xs -mt-1">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-1.5 w-full py-3 rounded-[10px] border-none bg-gradient-to-br from-accent to-cyan text-white font-bold text-[14.5px] shadow-[0_8px_24px_#6366F140] disabled:opacity-60"
            >
              {loading ? (isSignup ? "Creating account..." : "Logging in...") : isSignup ? "Create account" : "Log in"}
            </button>
          </div>

          <p className="text-center text-sub text-[13.5px] mt-6">
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={() => { setMode(isSignup ? "login" : "signup"); setError(null); }}
              className="bg-transparent border-none text-accent-light font-bold text-[13.5px] p-0"
            >
              {isSignup ? "Log in" : "Create one"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
