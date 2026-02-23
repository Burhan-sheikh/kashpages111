import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { firestore } from "@/integrations/firebase/client";
import { Button } from "@/components/ui/button";
import { collection, query, where, orderBy, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Search, Eye, EyeOff, Trash2, Star, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Props {
  shop: any | null;
  userPlan: string;
}

const Reviews = ({ shop, userPlan }: Props) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["shop-reviews", shop?.id],
    queryFn: async () => {
      if (!shop) return [];
      const q = query(
        collection(firestore, "reviews"),
        where("shop_id", "==", shop.id),
        orderBy("created_at", "desc")
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    enabled: !!shop,
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      await updateDoc(doc(firestore, "reviews", id), { is_visible: visible });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shop-reviews"] }),
  });

  const deleteReview = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(firestore, "reviews", id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-reviews"] });
      toast({ title: "Review deleted" });
    },
  });

  if (userPlan === "free") {
    return (
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">Reviews</h1>
        <p className="text-muted-foreground text-sm mb-8">Manage your shop reviews</p>
        <div className="text-center py-20">
          <Lock size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-4">Reviews management is a Pro feature.</p>
          <Link to="/pricing">
            <Button variant="hero">Upgrade to Pro</Button>
          </Link>
        </div>
      </div>
    );
  }

  const filtered = reviews.filter((r) => {
    const matchSearch = !search || r.reviewer_name.toLowerCase().includes(search.toLowerCase()) || r.comment?.toLowerCase().includes(search.toLowerCase());
    const matchRating = !filterRating || r.rating === filterRating;
    return matchSearch && matchRating;
  });

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-1">Reviews</h1>
      <p className="text-muted-foreground text-sm mb-8">{reviews.length} total reviews</p>

      {!shop ? (
        <p className="text-center text-muted-foreground py-12">Create a shop first to manage reviews.</p>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
            <div className="flex gap-1">
              <button onClick={() => setFilterRating(null)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${!filterRating ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>All</button>
              {[5, 4, 3, 2, 1].map((r) => (
                <button key={r} onClick={() => setFilterRating(r)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filterRating === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {r}★
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No reviews found.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((review) => (
                <div key={review.id} className={`p-4 rounded-xl bg-card-gradient border border-border/50 shadow-soft ${!review.is_visible ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground text-sm">{review.reviewer_name}</span>
                        <span className="text-primary text-sm">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                        {!review.is_visible && <span className="text-xs text-muted-foreground">(hidden)</span>}
                      </div>
                      {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                      <p className="text-xs text-muted-foreground mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleVisibility.mutate({ id: review.id, visible: !review.is_visible })}
                        title={review.is_visible ? "Hide" : "Show"}
                      >
                        {review.is_visible ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteReview.mutate(review.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reviews;
