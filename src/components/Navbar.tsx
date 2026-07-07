import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ShoppingCart, Search, User, Menu, X, Sparkles } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalItems, setIsOpen } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-indigo-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-['Poppins'] text-white">
              Flexi<span className="text-indigo-400">Cart</span>
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-[#141B2A] border border-indigo-500/20 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 rounded-xl hover:bg-indigo-500/10 transition-colors group"
            >
              <ShoppingCart className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 text-white text-xs flex items-center justify-center font-medium animate-bounce-in">
                  {totalItems}
                </span>
              )}
            </button>

            {user ? (
              <div className="hidden sm:flex items-center gap-1">
                {user.role === "seller" && (
                  <Link
                    to="/seller"
                    className="px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                  >
                    My Shop
                  </Link>
                )}
                {(user.role === "seller" || user.role === "admin") && (
                  <Link
                    to="/wallet"
                    className="px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                  >
                    Wallet
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="px-3 py-2 rounded-xl text-sm text-slate-300 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-indigo-500/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-slate-300 hidden lg:block">{user.name || "Account"}</span>
                </Link>
              </div>
            ) : (
              <Link to="/login">
                <Button
                  size="sm"
                  className="hidden sm:flex bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-5"
                >
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-indigo-500/10 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-slate-300" />
              ) : (
                <Menu className="w-5 h-5 text-slate-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass-card border-t border-indigo-500/10 px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-[#141B2A] border border-indigo-500/20 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </form>
          <Link
            to="/shop"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-indigo-400 transition-colors"
          >
            Shop
          </Link>
          <Link
            to="/cart"
            onClick={() => setIsMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-indigo-400 transition-colors"
          >
            Cart ({totalItems})
          </Link>
          {!user && (
            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-full">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
