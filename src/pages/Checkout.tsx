import { useState } from "react";
import { useNavigate } from "react-router";
import {
  CreditCard,
  Truck,
  MapPin,
  Phone,
  User,
  ArrowRight,
  ArrowLeft,
  Lock,
  Check,
  ShoppingCart,
  Zap,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/providers/trpc";

type Step = "details" | "payment" | "processing" | "success";
type PaymentMethod = "card" | "cod";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<Step>("details");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isCardSwiping, setIsCardSwiping] = useState(false);
  const [isTruckDriving, setIsTruckDriving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const createOrder = trpc.order.create.useMutation();
  const processCard = trpc.payment.processCard.useMutation();
  const processCOD = trpc.payment.processCOD.useMutation();

  const finalTotal = (totalPrice * 1.08).toFixed(2);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone && address) {
      setStep("payment");
      setProgress(50);
    }
  };

  const handlePayment = async () => {
    setStep("processing");
    setProgress(75);

    // Create order
    const orderResult = await createOrder.mutateAsync({
      totalAmount: finalTotal,
      paymentMethod,
      deliveryAddress: address,
      phone,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        price: i.productPrice,
      })),
    });

    setOrderId(orderResult.orderId);

    if (paymentMethod === "card") {
      setIsCardSwiping(true);
      // Simulate card processing delay
      await new Promise((r) => setTimeout(r, 2000));
      await processCard.mutateAsync({
        orderId: orderResult.orderId,
        cardNumber,
        expiry,
        cvv,
        name: cardName,
      });
    } else {
      setIsTruckDriving(true);
      await new Promise((r) => setTimeout(r, 2500));
      await processCOD.mutateAsync({ orderId: orderResult.orderId });
    }

    setProgress(100);
    clearCart();
    setTimeout(() => {
      navigate(`/order-success/${orderResult.orderId}`);
    }, 1500);
  };

  const steps = [
    { label: "Details", icon: <User className="w-4 h-4" />, complete: step !== "details" },
    { label: "Payment", icon: <CreditCard className="w-4 h-4" />, complete: step === "processing" || step === "success" },
    { label: "Confirm", icon: <Check className="w-4 h-4" />, complete: step === "success" },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={() => navigate("/cart")}
              className="p-2 rounded-xl hover:bg-indigo-500/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <h1 className="text-2xl font-bold">Checkout</h1>
          </div>

          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              {steps.map((s, i) => (
                <div key={s.label} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      s.complete
                        ? "bg-emerald-500 text-white"
                        : i === (step === "details" ? 0 : step === "payment" ? 1 : 2)
                        ? "bg-indigo-600 text-white"
                        : "bg-[#141B2A] border border-indigo-500/20 text-slate-400"
                    }`}
                  >
                    {s.complete ? <Check className="w-4 h-4" /> : s.icon}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${
                      s.complete ? "text-emerald-400" : "text-slate-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="h-2 bg-[#141B2A] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step 1: Details */}
          {step === "details" && (
            <form onSubmit={handleDetailsSubmit} className="space-y-6 animate-bounce-in">
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-400" />
                  Delivery Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 animate-glow-input transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 234 567 8900"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 animate-glow-input transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Delivery Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main St, Apt 4B, New York, NY 10001"
                      required
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 animate-glow-input transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-indigo-400" />
                  Order Summary
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Items ({items.length})</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Delivery</span>
                    <span className="text-emerald-400">Free</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tax</span>
                    <span>${(totalPrice * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-indigo-500/10 pt-2 flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span className="text-indigo-400">${finalTotal}</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-6 font-semibold"
              >
                Continue to Payment
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          )}

          {/* Step 2: Payment */}
          {step === "payment" && (
            <div className="space-y-6 animate-bounce-in">
              {/* Payment Method Selection */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`p-4 rounded-xl border transition-all text-center ${
                      paymentMethod === "card"
                        ? "border-indigo-500 bg-indigo-500/10"
                        : "border-indigo-500/20 hover:border-indigo-500/40"
                    }`}
                  >
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
                    <p className="text-sm font-medium">Card Payment</p>
                    <p className="text-xs text-slate-400 mt-1">Secure & Fast</p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-4 rounded-xl border transition-all text-center ${
                      paymentMethod === "cod"
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-indigo-500/20 hover:border-indigo-500/40"
                    }`}
                  >
                    <Truck className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                    <p className="text-sm font-medium">Pay on Delivery</p>
                    <p className="text-xs text-slate-400 mt-1">Cash/Card at door</p>
                  </button>
                </div>
              </div>

              {/* Card Form */}
              {paymentMethod === "card" && (
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm text-slate-400">Secure encrypted payment</span>
                  </div>

                  {/* Card Visual */}
                  <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                    <div className="relative">
                      <div className="flex justify-between items-start mb-8">
                        <div className="w-12 h-8 bg-yellow-400/20 rounded-md border border-yellow-400/30" />
                        <Zap className="w-6 h-6 text-white/50" />
                      </div>
                      <p className="text-xl tracking-widest font-mono text-white mb-4">
                        {cardNumber || "**** **** **** ****"}
                      </p>
                      <div className="flex justify-between text-sm text-white/70">
                        <span>{cardName || "YOUR NAME"}</span>
                        <span>{expiry || "MM/YY"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        className="w-full px-4 py-3 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 animate-glow-input"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 animate-glow-input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-slate-400 mb-1 block">Expiry</label>
                        <input
                          type="text"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 animate-glow-input"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 mb-1 block">CVV</label>
                        <input
                          type="password"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="***"
                          maxLength={4}
                          className="w-full px-4 py-3 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 animate-glow-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* COD Info */}
              {paymentMethod === "cod" && (
                <div className="glass-card rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Pay on Delivery</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Pay with cash or card when your order arrives. No upfront payment needed.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-emerald-400">
                    <Shield className="w-4 h-4" />
                    <span>100% secure</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setStep("details");
                    setProgress(25);
                  }}
                  variant="outline"
                  className="flex-1 rounded-xl py-6 border-indigo-500/20 text-slate-300 hover:bg-indigo-500/10"
                >
                  Back
                </Button>
                <Button
                  onClick={handlePayment}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-6 font-semibold"
                >
                  {paymentMethod === "card" ? "Pay" : "Confirm Order"} ${finalTotal}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === "processing" && (
            <div className="text-center py-16 animate-bounce-in">
              {/* Card Swipe Animation */}
              {paymentMethod === "card" && isCardSwiping && (
                <div className="mb-8">
                  <div className="relative w-72 h-44 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl animate-card-swipe shadow-2xl">
                      <div className="p-4">
                        <div className="w-10 h-7 bg-yellow-400/30 rounded border border-yellow-400/40 mb-6" />
                        <p className="text-lg tracking-widest font-mono text-white">
                          **** **** **** {cardNumber.slice(-4) || "****"}
                        </p>
                      </div>
                    </div>
                    {/* Card reader slot */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-32 bg-slate-600 rounded-full" />
                  </div>
                  <p className="text-indigo-400 font-medium animate-pulse">
                    Processing payment...
                  </p>
                </div>
              )}

              {/* Truck Animation */}
              {paymentMethod === "cod" && isTruckDriving && (
                <div className="mb-8 overflow-hidden">
                  <div className="relative h-32 mb-4">
                    <div className="absolute bottom-4 left-0 right-0 h-0.5 bg-indigo-500/20" />
                    <img
                      src="/images/delivery-truck.jpg"
                      alt="Delivery Truck"
                      className="absolute bottom-6 w-40 h-24 object-contain animate-truck-drive"
                    />
                  </div>
                  <p className="text-emerald-400 font-medium animate-pulse">
                    Preparing your order...
                  </p>
                </div>
              )}

              {/* Progress */}
              <div className="max-w-xs mx-auto">
                <div className="h-2 bg-[#141B2A] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full animate-shimmer" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
