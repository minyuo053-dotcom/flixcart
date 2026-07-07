import { useParams, useNavigate } from "react-router";
import {
  Check,
  PartyPopper,
  ShoppingBag,
  Home,
  Star,
  Truck,
  Clock,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Generate celebration particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 1 + Math.random() * 2,
    color: ["#4F46E5", "#22D3EE", "#F472B6", "#34D399", "#A78BFA"][
      Math.floor(Math.random() * 5)
    ],
    size: 4 + Math.random() * 8,
  }));

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto text-center relative">
          {/* Celebration Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute rounded-full animate-bounce-in"
                style={{
                  left: `${p.x}%`,
                  top: "20%",
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.duration}s`,
                  animationName: "celebrate",
                  opacity: 0.8,
                }}
              />
            ))}
          </div>

          {/* Success Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto animate-celebrate shadow-2xl shadow-emerald-500/30">
              <Check className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center animate-bounce-in shadow-lg">
              <PartyPopper className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Text */}
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 animate-bounce-in">
            Order <span className="text-emerald-400">Placed!</span>
          </h1>
          <p className="text-slate-400 mb-2 animate-bounce-in" style={{ animationDelay: "0.1s" }}>
            Your order #{orderId} has been confirmed.
          </p>
          <p className="text-slate-500 text-sm mb-8 animate-bounce-in" style={{ animationDelay: "0.2s" }}>
            You'll receive a confirmation email shortly.
          </p>

          {/* Order Status Card */}
          <div
            className="glass-card rounded-2xl p-6 mb-8 text-left animate-bounce-in"
            style={{ animationDelay: "0.3s" }}
          >
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-400" />
              Delivery Status
            </h3>

            <div className="space-y-4">
              {[
                { label: "Order Confirmed", time: "Just now", icon: <Check className="w-4 h-4" />, active: true },
                { label: "Preparing", time: "~5 min", icon: <ShoppingBag className="w-4 h-4" />, active: false },
                { label: "Out for Delivery", time: "~20 min", icon: <Truck className="w-4 h-4" />, active: false },
                { label: "Delivered", time: "~25 min", icon: <MapPin className="w-4 h-4" />, active: false },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      step.active
                        ? "bg-emerald-500 text-white"
                        : "bg-[#141B2A] border border-indigo-500/20 text-slate-500"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${step.active ? "text-white" : "text-slate-400"}`}>
                      {step.label}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {step.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 animate-bounce-in" style={{ animationDelay: "0.4s" }}>
            <Button
              onClick={() => navigate("/shop")}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-6 font-semibold"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Continue Shopping
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex-1 rounded-xl py-6 border-indigo-500/20 text-slate-300 hover:bg-indigo-500/10"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </div>

          {/* Rating Prompt */}
          <div
            className="mt-8 glass-card rounded-2xl p-4 animate-bounce-in"
            style={{ animationDelay: "0.5s" }}
          >
            <p className="text-sm text-slate-400 mb-2">How was your experience?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} className="hover:scale-110 transition-transform">
                  <Star className="w-6 h-6 text-slate-600 hover:text-yellow-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
