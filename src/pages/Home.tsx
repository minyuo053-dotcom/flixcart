import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ShoppingCart,
  Search,
  ArrowRight,
  UtensilsCrossed,
  Shirt,
  Headphones,
  Home as HomeIcon,
  Clock,
  MapPin,
  Shield,
  CreditCard,
  Truck,
  Star,
  Download,
  Apple,
  Play,
  MessageCircle,
  X,
  Send,
  ChevronRight,
  Zap,
  Package,
  Phone,
  Lock,
  Heart,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/providers/trpc";

/* ─── Home Page ─── */
export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <CategoryOrbit />
      <SearchSection />
      <FoodShowcase />
      <FashionShowcase />
      <GadgetsShowcase />
      <HowItWorks />
      <PaymentOptions />
      <DeliveryMap />
      <Testimonials />
      <SafetySection />
      <FinalCTA />
      <FooterWithChatbot />
    </div>
  );
}

/* ─── Section 1: Hero ─── */
function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const categoryIcons: Record<string, React.ReactNode> = {
    food: <UtensilsCrossed className="w-16 h-16 text-cyan-400" />,
    fashion: <Shirt className="w-16 h-16 text-pink-400" />,
    gadgets: <Headphones className="w-16 h-16 text-violet-400" />,
    home: <HomeIcon className="w-16 h-16 text-emerald-400" />,
  };

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-radial from-indigo-900/20 via-transparent to-transparent" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-indigo-300 font-medium">
                Delivery in 25 minutes
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight mb-6">
              Order{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent animate-neon-text">
                anything
              </span>
              <span className="text-indigo-400">.</span>
            </h1>

            <p className="text-lg text-slate-400 mb-8 max-w-md leading-relaxed">
              Groceries, hot meals, fashion, and essentials — delivered to your
              door in minutes.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => navigate("/shop")}
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all hover:-translate-y-0.5"
              >
                Start Shopping
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-indigo-400 transition-colors"
              >
                Explore categories
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right: Floating Cart Card */}
          <div
            className={`relative flex justify-center lg:justify-end transition-all duration-1000 delay-300 ${
              isVisible ? "translate-x-0 opacity-100" : "translate-x-20 opacity-0"
            }`}
          >
            <div className="relative w-full max-w-md">
              {/* Main Card */}
              <div className="glass-card rounded-[28px] p-8 shadow-2xl shadow-black/40">
                {/* Cart Icon that transforms */}
                <div
                  className="w-40 h-40 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#141B2A] to-[#1a2340] flex items-center justify-center border border-indigo-500/20 animate-float-slow transition-all duration-500"
                  onMouseEnter={() => setHoveredCategory("food")}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className="transition-all duration-500 transform">
                    {hoveredCategory && categoryIcons[hoveredCategory] ? (
                      <div className="animate-bounce-in">
                        {categoryIcons[hoveredCategory]}
                      </div>
                    ) : (
                      <ShoppingCart className="w-20 h-20 text-indigo-400" />
                    )}
                  </div>
                </div>

                {/* Mini item chip */}
                <div className="absolute top-8 right-8 bg-[#141B2A] rounded-2xl p-3 border border-cyan-500/20 shadow-lg animate-float">
                  <div className="w-12 h-12 rounded-xl overflow-hidden">
                    <img
                      src="/images/food-dish.jpg"
                      alt="Fresh"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-cyan-400 font-medium mt-1 block text-center">
                    Fresh
                  </span>
                </div>

                {/* Category pills */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    { icon: <UtensilsCrossed className="w-3 h-3" />, label: "Food", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
                    { icon: <Shirt className="w-3 h-3" />, label: "Fashion", color: "text-pink-400 bg-pink-400/10 border-pink-400/20" },
                    { icon: <Headphones className="w-3 h-3" />, label: "Gadgets", color: "text-violet-400 bg-violet-400/10 border-violet-400/20" },
                    { icon: <HomeIcon className="w-3 h-3" />, label: "Home", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
                  ].map((cat) => (
                    <button
                      key={cat.label}
                      onMouseEnter={() => setHoveredCategory(cat.label.toLowerCase())}
                      onMouseLeave={() => setHoveredCategory(null)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:scale-105 ${cat.color}`}
                    >
                      {cat.icon}
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl" />
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-violet-500/10 rounded-full blur-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 2: Category Orbit ─── */
function CategoryOrbit() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const categories = [
    { name: "Food", icon: <UtensilsCrossed className="w-8 h-8" />, color: "#22D3EE", slug: "food", image: "/images/food-dish.jpg" },
    { name: "Fashion", icon: <Shirt className="w-8 h-8" />, color: "#F472B6", slug: "fashion", image: "/images/fashion-sneakers.jpg" },
    { name: "Gadgets", icon: <Headphones className="w-8 h-8" />, color: "#A78BFA", slug: "gadgets", image: "/images/gadgets-headphones.jpg" },
    { name: "Home", icon: <HomeIcon className="w-8 h-8" />, color: "#34D399", slug: "home", image: "/images/product-lamp.jpg" },
  ];

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <div className="w-[500px] h-[500px] rounded-full border border-indigo-500" />
        <div className="absolute w-[350px] h-[350px] rounded-full border border-indigo-500" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <h2
          className={`text-4xl sm:text-5xl font-bold mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Order <span className="text-indigo-400">anything</span>
        </h2>

        <div className="relative w-72 h-72 sm:w-96 sm:h-96 mx-auto">
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-indigo-500 animate-neon-pulse" />

          {/* Orbiting categories */}
          {categories.map((cat, i) => {
            const angle = (i * 90 - 45) * (Math.PI / 180);
            const radius = 140;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <button
                key={cat.name}
                onClick={() => navigate(`/shop?category=${cat.slug}`)}
                className={`absolute w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all duration-700 hover:scale-110 cursor-pointer ${
                  isVisible ? "opacity-100 scale-100" : "opacity-0 scale-50"
                }`}
                style={{
                  left: `calc(50% + ${x}px - 48px)`,
                  top: `calc(50% + ${y}px - 48px)`,
                  borderColor: `${cat.color}30`,
                  backgroundColor: `${cat.color}10`,
                  color: cat.color,
                  transitionDelay: `${i * 150}ms`,
                }}
              >
                {cat.icon}
                <span className="text-xs font-medium">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 3: Search ─── */
function SearchSection() {
  const [query, setQuery] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section ref={sectionRef} className="py-24 px-4">
      <div
        className={`max-w-3xl mx-auto transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        }`}
      >
        <form onSubmit={handleSearch} className="glass-card rounded-[28px] p-4 sm:p-6 flex items-center gap-4 animate-neon-pulse">
          <Search className="w-6 h-6 text-indigo-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you need? Try 'burger', 'sneakers'..."
            className="flex-1 bg-transparent text-lg text-white placeholder-slate-500 focus:outline-none"
          />
          <Button
            type="submit"
            size="icon"
            className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-500 flex-shrink-0"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Try: pizza, charger, sneakers, coffee, lamp...
        </p>
      </div>
    </section>
  );
}

/* ─── Section 4: Food Showcase ─── */
function FoodShowcase() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
            }`}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-sm font-medium mb-4">
              <Clock className="w-4 h-4" />
              25 min delivery
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Craving <span className="text-cyan-400">something?</span>
            </h2>
            <p className="text-slate-400 text-lg mb-6 leading-relaxed">
              From local kitchens to your couch — hot, fresh, and on time.
              Browse hundreds of restaurants and get your favorites delivered.
            </p>
            <button
              onClick={() => navigate("/shop?category=food")}
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              Browse restaurants
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Card */}
          <div
            className={`transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            }`}
          >
            <div className="glass-card rounded-[28px] p-6 sm:p-8 relative overflow-hidden group cursor-pointer"
              onClick={() => navigate("/shop?category=food")}
            >
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-sm font-medium">
                25 min
              </div>
              <h3 className="text-xl font-semibold text-cyan-400 mb-6">Food Delivery</h3>
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src="/images/food-dish.jpg"
                  alt="Food"
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 5: Fashion Showcase ─── */
function FashionShowcase() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Card */}
          <div
            className={`transition-all duration-1000 order-2 lg:order-1 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
            }`}
          >
            <div className="glass-card rounded-[28px] p-6 sm:p-8 relative overflow-hidden group cursor-pointer"
              onClick={() => navigate("/shop?category=fashion")}
            >
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-pink-400/10 border border-pink-400/20 text-pink-400 text-sm font-medium">
                Same day
              </div>
              <h3 className="text-xl font-semibold text-pink-400 mb-6">Fashion Delivery</h3>
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src="/images/fashion-sneakers.jpg"
                  alt="Fashion"
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>

          {/* Right: Text */}
          <div
            className={`transition-all duration-1000 delay-200 order-1 lg:order-2 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            }`}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-400/10 border border-pink-400/20 text-pink-400 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Same day delivery
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              New look, <span className="text-pink-400">fast.</span>
            </h2>
            <p className="text-slate-400 text-lg mb-6 leading-relaxed">
              Trends drop daily. Get them delivered before the hype cools.
              From streetwear to essentials, we've got your style covered.
            </p>
            <button
              onClick={() => navigate("/shop?category=fashion")}
              className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors font-medium"
            >
              Shop fashion
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 6: Gadgets Showcase ─── */
function GadgetsShowcase() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
            }`}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-400/10 border border-violet-400/20 text-violet-400 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              45 min delivery
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Upgrade your <span className="text-violet-400">setup.</span>
            </h2>
            <p className="text-slate-400 text-lg mb-6 leading-relaxed">
              From cables to over-ear audio — get the tools you use every day.
              Premium tech, delivered fast.
            </p>
            <button
              onClick={() => navigate("/shop?category=gadgets")}
              className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors font-medium"
            >
              Shop gadgets
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Card */}
          <div
            className={`transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            }`}
          >
            <div className="glass-card rounded-[28px] p-6 sm:p-8 relative overflow-hidden group cursor-pointer"
              onClick={() => navigate("/shop?category=gadgets")}
            >
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-violet-400/10 border border-violet-400/20 text-violet-400 text-sm font-medium">
                45 min
              </div>
              <h3 className="text-xl font-semibold text-violet-400 mb-6">Gadgets</h3>
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src="/images/gadgets-headphones.jpg"
                  alt="Gadgets"
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 7: How It Works ─── */
function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const steps = [
    { icon: <Search className="w-8 h-8" />, title: "Search or browse", desc: "Type what you need or pick a category." },
    { icon: <ShoppingCart className="w-8 h-8" />, title: "Add to cart", desc: "One-tap add, easy edits, clear totals." },
    { icon: <Truck className="w-8 h-8" />, title: "Get it delivered", desc: "Real-time tracking, updates, and safe handoff." },
  ];

  return (
    <section ref={sectionRef} className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2
          className={`text-4xl font-bold text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          How <span className="text-indigo-400">FlexiCart</span> works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className={`glass-card rounded-[28px] p-8 text-center transition-all duration-700 hover:border-indigo-500/30 group ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-6 group-hover:bg-indigo-500/20 transition-colors">
                {step.icon}
              </div>
              <div className="text-3xl font-bold text-indigo-400/30 mb-2">0{i + 1}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 8: Payment Options ─── */
function PaymentOptions() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2
          className={`text-4xl font-bold text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Flexible <span className="text-indigo-400">payments</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card Payment */}
          <div
            className={`glass-card rounded-[28px] p-8 transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
            }`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Secure card payment</h3>
                <p className="text-slate-400 text-sm">Encrypted checkout</p>
              </div>
            </div>
            <img
              src="/images/payment-card.jpg"
              alt="Card Payment"
              className="w-full h-40 object-cover rounded-2xl"
            />
          </div>

          {/* Pay on Delivery */}
          <div
            className={`glass-card rounded-[28px] p-8 transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            }`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Truck className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Pay on delivery</h3>
                <p className="text-slate-400 text-sm">Cash or card at door</p>
              </div>
            </div>
            <img
              src="/images/delivery-truck.jpg"
              alt="Pay on Delivery"
              className="w-full h-40 object-cover rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 9: Delivery Map ─── */
function DeliveryMap() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Map */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
            }`}
          >
            <div className="glass-card rounded-[28px] overflow-hidden">
              <img
                src="/images/map-ui.jpg"
                alt="Delivery Map"
                className="w-full h-72 object-cover"
              />
            </div>
          </div>

          {/* Speed Info */}
          <div
            className={`transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            }`}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Fast <span className="text-indigo-400">Delivery</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              We match you with the nearest rider and optimize routes in real
              time. Track your order every step of the way.
            </p>

            <div className="flex flex-wrap gap-3">
              {[
                { label: "Avg 28 min", icon: <Clock className="w-4 h-4" /> },
                { label: "Live map", icon: <MapPin className="w-4 h-4" /> },
                { label: "Safe packaging", icon: <Package className="w-4 h-4" /> },
              ].map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium"
                >
                  {chip.icon}
                  {chip.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 10: Testimonials ─── */
function Testimonials() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const testimonials = [
    { text: "FlexiCart saved dinner — arrived hot in 18 minutes. The app is so smooth!", author: "Sarah M.", rating: 5 },
    { text: "I ordered sneakers at 9am. Wore them by noon. Same-day delivery is a game changer.", author: "James L.", rating: 5 },
    { text: "Groceries are fresh, refunds are instant, support is fast. Best delivery app.", author: "Aisha K.", rating: 5 },
  ];

  return (
    <section ref={sectionRef} className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h2
          className={`text-4xl font-bold text-center mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Loved by <span className="text-indigo-400">thousands</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`glass-card rounded-[28px] p-6 transition-all duration-700 hover:border-indigo-500/30 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-slate-300 mb-4 leading-relaxed">"{t.text}"</p>
              <p className="text-sm text-slate-500 font-medium">— {t.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Section 11: Safety ─── */
function SafetySection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
            }`}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Built for <span className="text-indigo-400">safety.</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Verified riders, encrypted payments, and real-time order
              protection. Your security is our priority.
            </p>

            <div className="flex flex-wrap gap-3">
              {[
                { label: "Encrypted", icon: <Lock className="w-4 h-4" /> },
                { label: "Verified riders", icon: <Shield className="w-4 h-4" /> },
                { label: "24/7 support", icon: <Phone className="w-4 h-4" /> },
              ].map((badge) => (
                <span
                  key={badge.label}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 ${
                    isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
                  }`}
                  style={{ transitionDelay: "300ms" }}
                >
                  <span className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    {badge.icon}
                  </span>
                  {badge.label}
                </span>
              ))}
            </div>
          </div>

          <div
            className={`transition-all duration-1000 delay-200 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="glass-card rounded-[28px] p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4 animate-neon-pulse">
                  <Shield className="w-12 h-12 text-indigo-400" />
                </div>
                <p className="text-2xl font-bold text-indigo-400">100%</p>
                <p className="text-slate-400">Secure Transactions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 12: Final CTA ─── */
function FinalCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4">
      <div
        className={`max-w-4xl mx-auto glass-card rounded-[28px] p-8 sm:p-12 transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
        }`}
      >
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Download the <span className="text-indigo-400">App</span>
            </h2>
            <p className="text-slate-400 mb-8">
              Shop faster. Track in real time. Get exclusive drops.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <Apple className="w-5 h-5" />
                <span className="text-sm font-medium">App Store</span>
              </button>
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <Play className="w-5 h-5" />
                <span className="text-sm font-medium">Google Play</span>
              </button>
            </div>
          </div>
          <div className="flex justify-center">
            <img
              src="/images/phone-mockup.jpg"
              alt="App"
              className="w-48 rounded-2xl shadow-2xl animate-float"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section 13: Footer + Chatbot ─── */
function FooterWithChatbot() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Hi! I'm Flexi, your shopping assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const sendMessage = trpc.chat.send.useMutation();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsTyping(true);

    try {
      const result = await sendMessage.mutateAsync({ message: userMsg });
      setMessages((prev) => [...prev, { role: "assistant", content: result.response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble right now. Please try again later!" },
      ]);
    }
    setIsTyping(false);
  };

  return (
    <>
      {/* Footer */}
      <footer className="border-t border-indigo-500/10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold font-['Poppins']">
                  Flexi<span className="text-indigo-400">Cart</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Order anything. Delivered in minutes.
              </p>
            </div>
            {[
              { title: "Product", links: ["Shop", "Categories", "Deals"] },
              { title: "Support", links: ["Help Center", "Contact", "FAQ"] },
              { title: "Company", links: ["About", "Careers", "Terms", "Privacy"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <span className="text-slate-400 hover:text-indigo-400 transition-colors text-sm cursor-pointer">
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-indigo-500/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              2024 FlexiCart. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Heart className="w-5 h-5 text-slate-500 hover:text-pink-400 transition-colors cursor-pointer" />
              <MessageCircle className="w-5 h-5 text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>

      {/* Chatbot FAB */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center hover:scale-110 transition-transform animate-neon-pulse"
      >
        {chatOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <img src="/images/chatbot-avatar.jpg" alt="Chat" className="w-10 h-10 rounded-full" />
        )}
      </button>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 glass-card rounded-2xl border border-indigo-500/20 shadow-2xl flex flex-col animate-bounce-in"
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div className="p-4 border-b border-indigo-500/10 flex items-center gap-3">
            <img src="/images/chatbot-avatar.jpg" alt="Flexi" className="w-10 h-10 rounded-full" />
            <div>
              <p className="font-semibold text-sm">Flexi Assistant</p>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Online
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-[#141B2A] text-slate-300 border border-indigo-500/10 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#141B2A] border border-indigo-500/10 px-4 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-indigo-500/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-[#141B2A] border border-indigo-500/20 rounded-full px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
              />
              <button
                onClick={handleSend}
                className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
