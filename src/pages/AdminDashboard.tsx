import { useState } from "react";
import { useNavigate } from "react-router";
import { ShieldCheck, Users, Package, Landmark, Plus, Trash2, Pencil, MessageCircle } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-400",
  rejected: "bg-red-500/10 text-red-400",
};

type Tab = "products" | "users" | "withdrawals";

export default function AdminDashboard() {
  const { user, isLoading } = useAuth({ redirectOnUnauthenticated: true });
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("products");

  if (!isLoading && user && user.role !== "admin") {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-28 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-['Poppins']">Admin Dashboard</h1>
            <p className="text-slate-400 text-sm">Manage sellers, products, and payouts</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { id: "products" as Tab, label: "Products", icon: Package },
            { id: "users" as Tab, label: "Sellers", icon: Users },
            { id: "withdrawals" as Tab, label: "Withdrawals", icon: Landmark },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === id
                  ? "bg-indigo-600 text-white"
                  : "bg-[#141B2A] text-slate-400 hover:text-slate-200 border border-indigo-500/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === "products" && <ProductsTab />}
        {tab === "users" && <UsersTab />}
        {tab === "withdrawals" && <WithdrawalsTab />}
      </div>
    </div>
  );
}

function FeeBadge() {
  const feeInfo = trpc.admin.feeInfo.useQuery();
  if (!feeInfo.data) return null;
  return (
    <p className="text-xs text-slate-500 mb-4">
      Platform fee: <span className="text-indigo-400 font-medium">{feeInfo.data.platformFeePercent}%</span>{" "}
      -- added on top of each seller's price, never deducted from it. Change it via the{" "}
      <code className="text-slate-400">PLATFORM_FEE_PERCENT</code> environment variable.
    </p>
  );
}

function ProductsTab() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const products = trpc.admin.listProducts.useQuery();
  const users = trpc.admin.listUsers.useQuery();
  const categories = trpc.category.list.useQuery();
  const createProduct = trpc.seller.createProduct.useMutation({
    onSuccess: () => utils.admin.listProducts.invalidate(),
  });
  const updateProduct = trpc.seller.updateProduct.useMutation({
    onSuccess: () => utils.admin.listProducts.invalidate(),
  });
  const deleteProduct = trpc.seller.deleteProduct.useMutation({
    onSuccess: () => utils.admin.listProducts.invalidate(),
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    categoryId: "",
    stock: "100",
    sellerId: "",
  });

  const sellers = users.data?.filter((u) => u.role === "seller") ?? [];

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", image: "", categoryId: "", stock: "100", sellerId: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (p: NonNullable<typeof products.data>[number]) => {
    setForm({
      name: p.name,
      description: "",
      price: String(p.price),
      image: p.image ?? "",
      categoryId: p.categoryId ? String(p.categoryId) : "",
      stock: String(p.stock ?? 0),
      sellerId: p.sellerId ? String(p.sellerId) : "",
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      image: form.image.trim() || undefined,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      stock: Number(form.stock),
      sellerId: form.sellerId ? Number(form.sellerId) : null,
    };
    if (editingId) {
      updateProduct.mutate({ id: editingId, ...payload }, { onSuccess: resetForm });
    } else {
      createProduct.mutate(payload, { onSuccess: resetForm });
    }
  };

  return (
    <div>
      <FeeBadge />
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="bg-indigo-600 hover:bg-indigo-500"
        >
          <Plus className="w-4 h-4 mr-1" />
          {showForm ? "Cancel" : "Add Product"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 mb-6 grid md:grid-cols-2 gap-3">
          <input
            required
            placeholder="Product name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-4 py-3 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 md:col-span-2"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="px-4 py-3 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 md:col-span-2"
            rows={2}
          />
          <input
            required
            type="number"
            step="0.01"
            placeholder="Listed price (what the seller receives)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="px-4 py-3 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
          <input
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="px-4 py-3 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
          <input
            placeholder="Image URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="px-4 py-3 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 md:col-span-2"
          />
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="px-4 py-3 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white focus:outline-none focus:border-indigo-500/50"
          >
            <option value="">No category</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={form.sellerId}
            onChange={(e) => setForm({ ...form, sellerId: e.target.value })}
            className="px-4 py-3 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white focus:outline-none focus:border-indigo-500/50"
          >
            <option value="">House listing (no seller, no fee)</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.email} (seller)
              </option>
            ))}
          </select>
          <Button
            type="submit"
            disabled={createProduct.isPending || updateProduct.isPending}
            className="bg-indigo-600 hover:bg-indigo-500 md:col-span-2"
          >
            {editingId ? "Save Changes" : "Create Product"}
          </Button>
        </form>
      )}

      <div className="space-y-3">
        {products.data?.map((p) => (
          <div key={p.id} className="glass-card rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-slate-500">
                Seller price: ${Number(p.price).toFixed(2)} &middot;{" "}
                {p.sellerId ? `Seller: ${p.sellerName || p.sellerEmail}` : "House listing"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusStyles[p.approvalStatus]}`}>
                {p.approvalStatus}
              </span>
              {p.sellerId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/product-chat/${p.id}`)}
                  className="border-indigo-500/30"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => startEdit(p)} className="border-slate-700">
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => deleteProduct.mutate({ id: p.id })}
                className="border-red-500/40 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {!products.data?.length && <p className="text-slate-500 text-sm">No products yet.</p>}
      </div>
    </div>
  );
}

function UsersTab() {
  const utils = trpc.useUtils();
  const users = trpc.admin.listUsers.useQuery();
  const setSellerStatus = trpc.admin.setSellerStatus.useMutation({
    onSuccess: () => utils.admin.listUsers.invalidate(),
  });

  return (
    <div className="space-y-3">
      {users.data
        ?.filter((u) => u.role !== "admin")
        .map((u) => (
          <div key={u.id} className="glass-card rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">{u.name || "Unnamed"}</p>
              <p className="text-xs text-slate-500">{u.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-full capitalize ${
                  u.role === "seller" ? "bg-indigo-500/10 text-indigo-400" : "bg-slate-700/40 text-slate-400"
                }`}
              >
                {u.role}
              </span>
              <Button
                size="sm"
                onClick={() => setSellerStatus.mutate({ userId: u.id, isSeller: u.role !== "seller" })}
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                {u.role === "seller" ? "Remove Seller" : "Make Seller"}
              </Button>
            </div>
          </div>
        ))}
      {!users.data?.length && <p className="text-slate-500 text-sm">No users yet.</p>}
    </div>
  );
}

function WithdrawalsTab() {
  const utils = trpc.useUtils();
  const withdrawals = trpc.adminWallet.listWithdrawals.useQuery();
  const updateWithdrawal = trpc.adminWallet.updateWithdrawal.useMutation({
    onSuccess: () => utils.adminWallet.listWithdrawals.invalidate(),
  });

  return (
    <div className="space-y-4">
      {withdrawals.data?.length ? (
        withdrawals.data.map((w) => (
          <div key={w.id} className="glass-card rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-lg">${Number(w.amount).toFixed(2)}</p>
              <p className="text-sm text-slate-400">
                {w.accountName} &middot; {w.bankName} &middot; {w.accountNumber}
              </p>
              <p className="text-xs text-slate-500 mt-1">User #{w.userId}</p>
            </div>
            <div className="flex items-center gap-2">
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
              {w.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    onClick={() => updateWithdrawal.mutate({ id: w.id, status: "approved" })}
                    className="bg-indigo-600 hover:bg-indigo-500"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateWithdrawal.mutate({ id: w.id, status: "rejected" })}
                    className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                  >
                    Reject
                  </Button>
                </>
              )}
              {w.status === "approved" && (
                <Button
                  size="sm"
                  onClick={() => updateWithdrawal.mutate({ id: w.id, status: "paid" })}
                  className="bg-emerald-600 hover:bg-emerald-500"
                >
                  Mark Paid
                </Button>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-slate-500 text-sm">No withdrawal requests yet.</p>
      )}
    </div>
  );
}
