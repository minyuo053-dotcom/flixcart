import { Link } from "react-router";
import { Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6 animate-neon-pulse">
          <AlertTriangle className="w-12 h-12 text-indigo-400" />
        </div>
        <h1 className="text-6xl font-bold mb-4">
          4<span className="text-indigo-400">0</span>4
        </h1>
        <p className="text-slate-400 text-lg mb-8">
          This page doesn't exist in the FlexiCart universe.
        </p>
        <Link to="/">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-8 py-6">
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
