import { useState } from "react";
import { useNavigate } from "react-router";
import { Store, Plus, MessageCircle } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400",
  approved: "bg-emerald-500/10 text-emerald-400",
  rejected: "bg-red-500/10 text-red-400",
};

export default function SellerDashboard() {
  const { user, isLoading } = useAuth({ redirectOnUnauthenticated: true });
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const products = trpc.seller.myProducts.useQuery(undefined, { enabled: !!user });
  const categories = trpc.category.list.useQuery();
  const createProduct = trpc.seller.createProduct.useMutation({
    onSuccess: () => {
      utils.seller.myProducts.invalidate();
      setShowForm(false);
      setForm({ name: "", description: "", price: "", image: "", categoryId: "", stock: "100" });
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    categoryId: "",
    stock: "100",
  });

  if (!isLoading && user && user.role !== "seller" && user.role !== "admin") {
    navigate("/");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      image: form.image.trim() || undefined,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      stock: Number(form.stock),
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-28 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-['Poppins']">My Shop</h1>
            <p className="text-slate-400 text-sm">List products and chat with admin to get them approved</p>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <Button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-500">
            <Plus className="w-4 h-4 mr-1" />
            {showForm ? "Cancel" : "List a Product"}
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
              placeholder="Your price (what you'll receive)"
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
              className="px-4 py-3 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white focus:outline-none focus:border-indigo-500/50 md:col-span-2"
            >
              <option value="">No category</option>
              {categories.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 md:col-span-2">
              After submitting, open the chat below and send a short video of you with the product --
              admin needs to see and approve it before it goes live.
            </p>
            <Button type="submit" disabled={createProduct.isPending} className="bg-indigo-600 hover:bg-indigo-500 md:col-span-2">
              Submit for Approval
            </Button>
          </form>
        )}

        <div className="space-y-3">
          {products.data?.map((p) => (
            <div key={p.id} className="glass-card rounded-2xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-slate-500">${Number(p.price).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusStyles[p.approvalStatus]}`}>
                  {p.approvalStatus}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/product-chat/${p.id}`)}
                  className="border-indigo-500/30"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Chat
                </Button>
              </div>
            </div>
          ))}
          {!products.data?.length && <p className="text-slate-500 text-sm">No products listed yet.</p>}
        </div>
      </div>
    </div>
  );
}
