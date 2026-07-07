import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Lock,
  Unlock,
  Mail,
  User,
  ArrowRight,
  Shield,
  Sparkles,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const sendOtp = trpc.otp.send.useMutation();
  const verifyOtp = trpc.otp.verify.useMutation();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    try {
      const result = await sendOtp.mutateAsync({ email: email.trim() });
      if (result.success) {
        setStep("otp");
        setCountdown(60);
        // Focus first input
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } catch {
      setError("Failed to send OTP. Please try again.");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (index === 5 && value) {
      const code = [...newOtp.slice(0, 5), value].join("");
      if (code.length === 6) {
        handleVerify(code);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code: string) => {
    try {
      const result = await verifyOtp.mutateAsync({
        email,
        code,
        name: name.trim() || undefined,
      });
      if (result.success) {
        setIsUnlocked(true);
        // The server just set a real session cookie -- refresh the cached
        // auth state so the rest of the app (Navbar, AuthLayout, etc.)
        // immediately sees the user as logged in.
        await utils.auth.me.invalidate();
        setTimeout(() => setStep("success"), 800);
      } else {
        setError(result.message);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError("");
    try {
      await sendOtp.mutateAsync({ email });
      setCountdown(60);
    } catch {
      setError("Failed to resend OTP.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold font-['Poppins']">
              Flexi<span className="text-indigo-400">Cart</span>
            </span>
          </div>
        </div>

        {/* Email Step */}
        {step === "email" && (
          <form
            onSubmit={handleSendOtp}
            className="glass-card rounded-[28px] p-8 animate-bounce-in"
          >
            {/* Lock Icon */}
            <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6 animate-neon-pulse">
              <Lock className="w-10 h-10 text-indigo-400" />
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">Verify Your Email</h2>
            <p className="text-slate-400 text-center text-sm mb-6">
              We'll send a 6-digit code to your email
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="text-sm text-slate-400 mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 animate-glow-input transition-all"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="text-sm text-slate-400 mb-2 block">
                Name <span className="text-slate-600">(new accounts only)</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={sendOtp.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-6 font-semibold"
            >
              {sendOtp.isPending ? (
                <span className="animate-pulse">Sending...</span>
              ) : (
                <>
                  Send OTP
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full mt-4 text-slate-400 hover:text-indigo-400 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </form>
        )}

        {/* OTP Step */}
        {step === "otp" && (
          <div className="glass-card rounded-[28px] p-8 animate-bounce-in">
            {/* Lock / Unlock Icon */}
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-500 ${
                isUnlocked
                  ? "bg-emerald-500/10 border border-emerald-500/20 animate-celebrate"
                  : "bg-indigo-500/10 border border-indigo-500/20 animate-neon-pulse"
              }`}
            >
              {isUnlocked ? (
                <Unlock className="w-10 h-10 text-emerald-400" />
              ) : (
                <Lock className="w-10 h-10 text-indigo-400" />
              )}
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">
              {isUnlocked ? "Verified!" : "Enter OTP Code"}
            </h2>
            <p className="text-slate-400 text-center text-sm mb-6">
              {isUnlocked
                ? "Your email has been verified"
                : `We sent a code to ${email}`}
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* OTP Inputs */}
            <div className="flex gap-2 justify-center mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={isUnlocked}
                  className={`w-12 h-14 rounded-xl text-center text-xl font-bold bg-[#141B2A] border-2 transition-all duration-300 focus:outline-none ${
                    isUnlocked
                      ? "border-emerald-500 text-emerald-400"
                      : digit
                      ? "border-indigo-500 text-white animate-glow-input"
                      : "border-indigo-500/20 text-white focus:border-indigo-500"
                  }`}
                />
              ))}
            </div>

            {/* Resend */}
            <div className="text-center mb-6">
              {countdown > 0 ? (
                <p className="text-sm text-slate-400">
                  Resend code in {countdown}s
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 mx-auto"
                >
                  <RotateCcw className="w-3 h-3" />
                  Resend OTP
                </button>
              )}
            </div>

            {!isUnlocked && (
              <Button
                onClick={() => {
                  const code = otp.join("");
                  if (code.length === 6) handleVerify(code);
                }}
                disabled={otp.join("").length !== 6 || verifyOtp.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-6 font-semibold disabled:opacity-50"
              >
                {verifyOtp.isPending ? (
                  <span className="animate-pulse">Verifying...</span>
                ) : (
                  <>
                    Verify
                    <Shield className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            )}

            <button
              onClick={() => setStep("email")}
              className="w-full mt-4 text-slate-400 hover:text-indigo-400 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Change Email
            </button>
          </div>
        )}

        {/* Success Step */}
        {step === "success" && (
          <div className="glass-card rounded-[28px] p-8 animate-celebrate text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
            <p className="text-slate-400 text-sm mb-6">
              Your email is verified. You can now start shopping!
            </p>
            <Button
              onClick={() => navigate("/shop")}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-6 font-semibold"
            >
              Start Shopping
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
