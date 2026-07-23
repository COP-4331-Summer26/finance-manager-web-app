import { useState } from "react";
import { api, ApiError } from "../api/client";
import { C } from "../theme/tokens";
import { isPasswordValid } from "../utils/passwordRequirements";
import PasswordRequirementsChecklist from "./PasswordRequirementsChecklist";

interface ForgotPasswordModalProps {
  onClose: () => void;
  /** Called once the password has actually been reset, so the login page can go back to the sign-in form. */
  onDone: () => void;
}

type Step = "email" | "code" | "reset";

export default function ForgotPasswordModal({ onClose, onDone }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full bg-bg border border-border rounded-[9px] px-[13px] py-2.5 text-text text-sm outline-none box-border focus:border-accent focus:ring-2 focus:ring-accent/25";
  const labelClass = "block text-sub text-[11px] font-bold mb-1.5 uppercase tracking-wider";

  async function handleSendCode() {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await api.forgotPassword({ email });
      setStep("code");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleContinueFromCode() {
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setStep("reset");
  }

  async function handleResendCode() {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      await api.forgotPassword({ email });
      setInfo("A new code has been sent.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    setError(null);
    if (!isPasswordValid(newPassword)) {
      setError("Password doesn't meet the requirements above.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword({ email, code, newPassword });
      onDone();
      onClose();
    } catch (e) {
      if (e instanceof ApiError && e.details?.length) {
        setError(e.details.join(" "));
      } else {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    } finally {
      setLoading(false);
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
              style={{ background: C.accent, boxShadow: `0 0 8px ${C.accent}` }}
            />
            <h2 className="text-text font-bold text-[17px] m-0">Reset Password</h2>
          </div>
          <button onClick={onClose} className="bg-transparent border-none text-sub cursor-pointer text-lg leading-none p-2 -m-2">
            ✕
          </button>
        </div>

        {step === "email" && (
          <>
            <p className="text-sub text-[13px] leading-relaxed mb-4">
              Enter the email on your account and we'll send you a code to reset your password.
            </p>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
            {error && <p className="text-red text-xs mt-3">{error}</p>}
            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full mt-5 py-3 rounded-[10px] border-none bg-accent-dark text-white font-bold text-sm disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </>
        )}

        {step === "code" && (
          <>
            <p className="text-sub text-[13px] leading-relaxed mb-4">
              We sent a 6-digit code to <span className="text-text font-semibold">{email}</span>.
            </p>
            <label className={labelClass}>Verification Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className={`${inputClass} text-lg tracking-[0.3em] text-center`}
            />
            {error && <p className="text-red text-xs mt-3">{error}</p>}
            {info && <p className="text-green text-xs mt-3">{info}</p>}
            <button
              onClick={handleContinueFromCode}
              className="w-full mt-5 py-3 rounded-[10px] border-none bg-accent-dark text-white font-bold text-sm"
            >
              Continue
            </button>
            <button
              onClick={handleResendCode}
              disabled={loading}
              className="w-full mt-2.5 py-2.5 rounded-[9px] border border-border bg-transparent text-sub font-semibold text-xs disabled:opacity-60"
            >
              {loading ? "Sending..." : "Resend Code"}
            </button>
          </>
        )}

        {step === "reset" && (
          <>
            <p className="text-sub text-[13px] leading-relaxed mb-4">Choose a new password for your account.</p>

            <label className={labelClass}>New Password</label>
            <div className="relative">
              <input
                type={showNewPw ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`${inputClass} pr-11`}
                placeholder="••••••••"
              />
              <button
                onClick={() => setShowNewPw((s) => !s)}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-transparent border-none text-sub text-xs p-2"
              >
                {showNewPw ? "Hide" : "Show"}
              </button>
            </div>
            <PasswordRequirementsChecklist password={newPassword} />

            <label className={`${labelClass} mt-3.5`}>Confirm New Password</label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />

            {error && <p className="text-red text-xs mt-3">{error}</p>}

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full mt-5 py-3 rounded-[10px] border-none bg-accent-dark text-white font-bold text-sm disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
