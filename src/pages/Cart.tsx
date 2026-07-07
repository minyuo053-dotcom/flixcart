import { useNavigate } from "react-router";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";

export default function Cart() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Your Cart</h1>
              <p className="text-slate-400 text-sm">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </p>
            </div>
          </div>

          {items.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="glass-card rounded-2xl p-4 flex gap-4 animate-bounce-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={item.productImage || "/images/food-dish.jpg"}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {item.productName}
                      </h3>
                      <p className="text-indigo-400 font-medium mt-0.5">
                        ${item.productPrice}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-7 h-7 rounded-full bg-[#141B2A] border border-indigo-500/20 flex items-center justify-center hover:border-indigo-500/40 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-7 h-7 rounded-full bg-[#141B2A] border border-indigo-500/20 flex items-center justify-center hover:border-indigo-500/40 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="glass-card rounded-2xl p-6 h-fit">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Delivery</span>
                    <span className="text-emerald-400">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Tax</span>
                    <span>${(totalPrice * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-indigo-500/10 pt-3 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-indigo-400">
                      ${(totalPrice * 1.08).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-6 font-semibold"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <button
                  onClick={() => navigate("/shop")}
                  className="w-full mt-3 text-slate-400 hover:text-indigo-400 transition-colors text-sm"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-slate-400 mb-6">
                Add some items to get started!
              </p>
              <Button
                onClick={() => navigate("/shop")}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-8"
              >
                Start Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
