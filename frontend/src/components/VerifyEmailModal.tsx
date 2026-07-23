import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { C } from "../theme/tokens";

interface VerifyEmailModalProps {
  email: string;
  onClose: () => void;
}

export default function VerifyEmailModal({ email, onClose }: VerifyEmailModalProps) {
  const navigate = useNavigate();
  const { verifyEmail, resendVerification } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify() {
    setError(null);
    setInfo(null);
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setVerifying(true);
    try {
      await verifyEmail(email, code);
      navigate("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid or expired code.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      await resendVerification(email);
      setInfo("A new code has been sent.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to resend code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm"
    >
      <div
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl p-7 w-[380px] shadow-2xl"
      >
        <div className="flex justify-between items-center mb-[18px]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: C.cyan, boxShadow: `0 0 8px ${C.cyan}` }}
            />
            <h2 className="text-text font-bold text-[17px] m-0">Verify Your Email</h2>
          </div>
          <button onClick={onClose} className="bg-transparent border-none text-sub cursor-pointer text-lg leading-none p-2 -m-2">
            ✕
          </button>
        </div>

        <p className="text-sub text-[13px] leading-relaxed mb-4">
          We sent a 6-digit code to <span className="text-text font-semibold">{email}</span>. Enter it below to finish setting up your account.
        </p>

        <label className="block text-sub text-[11px] font-bold mb-1.5 uppercase tracking-wider">Verification Code</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="123456"
          className="w-full bg-bg border border-border rounded-[9px] px-[13px] py-2.5 text-text text-lg tracking-[0.3em] text-center outline-none box-border focus:border-accent focus:ring-2 focus:ring-accent/25"
        />

        {error && <p className="text-red text-xs mt-3">{error}</p>}
        {info && <p className="text-green text-xs mt-3">{info}</p>}

        <button
          onClick={handleVerify}
          disabled={verifying}
          className="w-full mt-5 py-3 rounded-[10px] border-none bg-accent-dark text-white font-bold text-sm disabled:opacity-60"
        >
          {verifying ? "Verifying..." : "Verify Email"}
        </button>

        <button
          onClick={handleResend}
          disabled={resending}
          className="w-full mt-2.5 py-2.5 rounded-[9px] border border-border bg-transparent text-sub font-semibold text-xs disabled:opacity-60"
        >
          {resending ? "Sending..." : "Resend Code"}
        </button>
      </div>
    </div>
  );
}
