import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { Video, Send, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function ProductChat() {
  const { productId } = useParams();
  const id = Number(productId);
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth({ redirectOnUnauthenticated: true });
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const messages = trpc.productChat.messages.useQuery({ productId: id }, { enabled: !!user && !!id });
  const sendMessage = trpc.productChat.sendMessage.useMutation({
    onSuccess: () => {
      setText("");
      utils.productChat.messages.invalidate({ productId: id });
    },
    onError: (err) => setError(err.message),
  });
  const getUploadUrl = trpc.productChat.getVideoUploadUrl.useMutation();
  const reviewProduct = trpc.admin.reviewProduct.useMutation({
    onSuccess: () => utils.productChat.messages.invalidate({ productId: id }),
  });

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setError("");
    sendMessage.mutate({ productId: id, message: text.trim() });
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const { uploadUrl, publicUrl } = await getUploadUrl.mutateAsync({ contentType: file.type });
      const putResult = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putResult.ok) throw new Error("Video upload failed");
      await sendMessage.mutateAsync({ productId: id, videoUrl: publicUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!authLoading && user && user.role === "user") {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pt-28 pb-16">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="glass-card rounded-2xl p-5 mb-4">
          <h1 className="font-bold text-lg mb-1">Product Approval Chat</h1>
          <p className="text-slate-400 text-sm">
            {user?.role === "admin"
              ? "Review the seller's live video with the product, then approve or reject."
              : "Send a short live video of you with your product so admin can approve it."}
          </p>
          {user?.role === "admin" && (
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                onClick={() => reviewProduct.mutate({ productId: id, decision: "approved" })}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => reviewProduct.mutate({ productId: id, decision: "rejected" })}
                className="border-red-500/40 text-red-400 hover:bg-red-500/10"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </div>

        <div className="glass-card rounded-2xl p-5 mb-4 space-y-4 max-h-[50vh] overflow-y-auto">
          {messages.data?.length ? (
            messages.data.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] ${m.senderRole === "admin" ? "ml-auto text-right" : ""}`}
              >
                <p className="text-xs text-slate-500 mb-1">{m.senderRole === "admin" ? "Admin" : "Seller"}</p>
                {m.videoUrl && (
                  <video controls className="rounded-xl max-w-full mb-1" src={m.videoUrl} />
                )}
                {m.message && (
                  <div
                    className={`inline-block px-4 py-2 rounded-2xl text-sm ${
                      m.senderRole === "admin" ? "bg-indigo-600 text-white" : "bg-[#141B2A] text-slate-200"
                    }`}
                  >
                    {m.message}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-sm">No messages yet. Say hello or send your product video.</p>
          )}
        </div>

        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

        <form onSubmit={handleSendText} className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-xl bg-[#141B2A] border border-indigo-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
            id="video-upload"
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="border-indigo-500/30"
          >
            <Video className="w-4 h-4" />
          </Button>
          <Button type="submit" disabled={sendMessage.isPending} className="bg-indigo-600 hover:bg-indigo-500">
            <Send className="w-4 h-4" />
          </Button>
        </form>
        {uploading && <p className="text-xs text-slate-500 mt-2">Uploading video...</p>}
      </div>
    </div>
  );
}
