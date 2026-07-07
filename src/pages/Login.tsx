import { useNavigate } from "react-router";
import { Mail, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

// The Kimi OAuth button only shows up if those env vars were actually
// configured for this deployment. Otherwise every visitor just uses the
// normal email + OTP flow below, which is the real login for this site.
const kimiConfigured =
  Boolean(import.meta.env.VITE_KIMI_AUTH_URL) &&
  Boolean(import.meta.env.VITE_APP_ID);

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm glass-card rounded-[28px] p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold font-['Poppins']">
            Flexi<span className="text-indigo-400">Cart</span>
          </span>
          <p className="text-slate-400 text-sm mt-2 text-center">
            Sign in or create an account with your email
          </p>
        </div>

        <Button
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-6 font-semibold"
          size="lg"
          onClick={() => navigate("/verify-otp")}
        >
          <Mail className="w-5 h-5 mr-2" />
          Continue with Email
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        {kimiConfigured && (
          <>
            <div className="flex items-center gap-3 my-6">
              <div className="h-px bg-slate-700 flex-1" />
              <span className="text-xs text-slate-500">or</span>
              <div className="h-px bg-slate-700 flex-1" />
            </div>
            <Button
              variant="outline"
              className="w-full rounded-xl py-6 font-semibold border-slate-700 text-slate-200 hover:bg-slate-800"
              size="lg"
              onClick={() => {
                window.location.href = getOAuthUrl();
              }}
            >
              Sign in with Kimi
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
