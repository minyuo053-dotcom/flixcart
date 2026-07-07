import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  Search,
  ShoppingCart,
  Star,
  Filter,
  X,
  ChevronDown,
  Plus,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/providers/trpc";

export default function Shop() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [showFilters, setShowFilters] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const { data: categories } = trpc.category.list.useQuery();
  const { data: products } = trpc.product.list.useQuery({
    search: search || undefined,
    categoryId: selectedCategory
      ? categories?.find((c) => c.slug === selectedCategory)?.id
      : undefined,
  });

  const { addItem, setIsOpen } = useCart();

  // Clear added animation after 2 seconds
  useEffect(() => {
    if (addedIds.size > 0) {
      const timer = setTimeout(() => setAddedIds(new Set()), 2000);
      return () => clearTimeout(timer);
    }
  }, [addedIds]);

  const handleAddToCart = (product: NonNullable<typeof products>[0]) => {
    addItem({
      id: product.id,
      quantity: 1,
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      productImage: product.image,
      productStock: 100,
      categoryName: product.categoryName,
      categoryColor: product.categoryColor,
    });
    setAddedIds((prev) => new Set(prev).add(product.id));
  };

  const getCategoryColor = (color: string | null) => {
    if (!color) return "#4F46E5";
    return color;
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <Navbar />

      {/* Header */}
      <div className="pt-24 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">
                Shop <span className="text-indigo-400">Everything</span>
              </h1>
              <p className="text-slate-400 mt-1">
                {products?.length || 0} products available
              </p>
            </div>

            {/* Search */}
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-slate-400 hover:text-white" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-sm hover:border-indigo-500/40 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>

            <button
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                !selectedCategory
                  ? "bg-indigo-600 text-white"
                  : "bg-[#141B2A] border border-indigo-500/20 text-slate-300 hover:border-indigo-500/40"
              }`}
            >
              All
            </button>

            {categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setSelectedCategory(cat.slug === selectedCategory ? "" : cat.slug)
                }
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === cat.slug
                    ? "text-white"
                    : "bg-[#141B2A] border border-indigo-500/20 text-slate-300 hover:border-indigo-500/40"
                }`}
                style={
                  selectedCategory === cat.slug
                    ? { backgroundColor: cat.color }
                    : {}
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-4 pb-24">
        <div className="max-w-7xl mx-auto">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="glass-card rounded-2xl overflow-hidden group hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image || "/images/food-dish.jpg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.categoryColor && (
                      <div
                        className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: `${product.categoryColor}80` }}
                      >
                        {product.categoryName}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1 truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-slate-400">
                        {product.rating}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-indigo-400">
                        ${product.price}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          addedIds.has(product.id)
                            ? "bg-emerald-500"
                            : "bg-indigo-600 hover:bg-indigo-500"
                        }`}
                      >
                        {addedIds.has(product.id) ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <Plus className="w-4 h-4 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <ShoppingCart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-slate-400">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
