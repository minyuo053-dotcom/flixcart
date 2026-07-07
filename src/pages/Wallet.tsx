import { useState } from "react";
import { useNavigate } from "react-router";
import { Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle, Landmark } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function Wallet() {
  const { user, isLoading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const summary = trpc.wallet.summary.useQuery(undefined, { enabled: !!user });
  const withdrawals = trpc.wallet.myWithdrawals.useQuery(undefined, { enabled: !!user });
  const requestWithdrawal = trpc.wallet.requestWithdrawal.useMutation({
    onSuccess: async (result) => {
      if (result.success) {
        setFormSuccess(result.message);
        setFormError("");
        setAmount("");
        setBankName("");
        setAccountName("");
        setAccountNumber("");
        await Promise.all([utils.wallet.summary.invalidate(), utils.wallet.myWithdrawals.invalidate()]);
      } else {
        setFormError(result.message);
      }
    },
    onError: (err) => setFormError(err.message),
  });

  // Only sellers and admin have a wallet -- redirect anyone else to the shop.
  if (!authLoading && user && user.role === "user") {
    navigate("/");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setFormError("Enter a valid amount");
      return;
    }
    if (!bankName.trim() || !accountName.trim() || !accountNumber.trim()) {
      setFormError("Fill in all account details");
      return;
    }
    requestWithdrawal.mutate({
      amount: numericAmount,
      bankName: bankName.trim(),
      accountName: accountName.trim(),
      accountNumber: accountNumber.trim(),
    });
  };

  const balance = summary.data?.balance ?? 0;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <WalletIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-['Poppins']">My Wallet</h1>
            <p className="text-slate-400 text-sm">
              {user?.role === "admin" ? "Platform fee earnings" : "Your sales earnings"}
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-8">
          <p className="text-slate-400 text-sm mb-1">Available balance</p>
          <p className="text-4xl font-bold text-indigo-400">
            ${summary.isLoading ? "..." : balance.toFixed(2)}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Withdrawal form */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-indigo-400" />
              Withdraw to your account
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="number"
                step="0.01"
                min="1"
                placeholder="Amount (USD)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
              <input
                type="text"
                placeholder="Bank name"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
              <input
                type="text"
                placeholder="Account holder name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
              <input
                type="text"
                placeholder="Account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
              {formError && <p className="text-red-400 text-sm">{formError}</p>}
              {formSuccess && <p className="text-emerald-400 text-sm">{formSuccess}</p>}
              <Button
                type="submit"
                disabled={requestWithdrawal.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-5"
              >
                {requestWithdrawal.isPending ? "Submitting..." : "Request Withdrawal"}
              </Button>
              <p className="text-xs text-slate-500">
                Requests are reviewed by an admin before funds are sent.
              </p>
            </form>
          </div>

          {/* Withdrawal history */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-semibold mb-4">Withdrawal history</h2>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {withdrawals.data?.length ? (
                withdrawals.data.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#141B2A] border border-indigo-500/10"
                  >
                    <div>
                      <p className="text-sm font-medium">${Number(w.amount).toFixed(2)}</p>
                      <p className="text-xs text-slate-500">{w.bankName}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full capitalize ${
                        w.status === "paid"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : w.status === "rejected"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-sm">No withdrawal requests yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <div className="glass-card rounded-2xl p-6 mt-6">
          <h2 className="font-semibold mb-4">Recent activity</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {summary.data?.transactions.length ? (
              summary.data.transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-indigo-500/5">
                  <div className="flex items-center gap-2">
                    {Number(t.amount) >= 0 ? (
                      <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ArrowUpCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-sm text-slate-300">{t.description}</span>
                  </div>
                  <span className={Number(t.amount) >= 0 ? "text-emerald-400" : "text-red-400"}>
                    {Number(t.amount) >= 0 ? "+" : ""}
                    {Number(t.amount).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">No activity yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
