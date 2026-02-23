import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { firestore } from "@/integrations/firebase/client";
import { Loader2, Phone, MapPin, Star, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, orderBy, limit, getDocs, addDoc } from "firebase/firestore";

interface ServiceItem { title: string; description: string; }
interface FaqItem { question: string; answer: string; }

const PublicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Review form
  const [reviewerName, setReviewerName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const { data: shop, isLoading } = useQuery({
    queryKey: ["public-shop", slug],
    queryFn: async () => {
      const q = query(
        collection(firestore, "shops"),
        where("slug", "==", slug),
        where("status", "==", "published"),
        limit(1)
      );
      const snap = await getDocs(q);
      const doc = snap.docs[0];
      return doc ? { id: doc.id, ...doc.data() } : null;
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ["public-reviews", shop?.id],
    queryFn: async () => {
      const q = query(
        collection(firestore, "reviews"),
        where("shop_id", "==", shop!.id),
        where("is_visible", "==", true),
        orderBy("created_at", "desc"),
        limit(20)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    enabled: !!shop?.id && shop?.ratings_enabled,
  });

  // Track page view
  useEffect(() => {
    if (shop?.id) {
      addDoc(collection(firestore, "analytics_events"), { shop_id: shop.id, event_type: "page_view", created_at: new Date() });
    }
  }, [shop?.id]);

  const avgRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const submitReview = useMutation({
    mutationFn: async () => {
      if (!shop) return;
      await addDoc(collection(firestore, "reviews"), {
        shop_id: shop.id,
        reviewer_name: reviewerName,
        rating: reviewRating,
        comment: reviewComment || null,
        is_visible: true,
        created_at: new Date(),
      });
    },
    onSuccess: () => {
      toast({ title: "Review submitted!" });
      setReviewerName("");
      setReviewRating(5);
      setReviewComment("");
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const trackClick = (type: string) => {
    if (shop?.id) {
      addDoc(collection(firestore, "analytics_events"), { shop_id: shop.id, event_type: type, created_at: new Date() });
    }
  };

  const gallery = Array.isArray(shop?.gallery) ? (shop.gallery as string[]) : [];
  const services = Array.isArray(shop?.services) ? (shop.services as unknown as ServiceItem[]) : [];
  const faq = Array.isArray(shop?.faq) ? (shop.faq as unknown as FaqItem[]) : [];
  const whatsappNum = shop?.use_phone_for_whatsapp ? shop?.contact_phone : shop?.whatsapp_number;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">404</h1>
          <p className="text-muted-foreground">Shop not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Cover Image */}
      {shop.cover_image && (
        <div className="h-56 md:h-72 lg:h-80 relative">
          <img src={shop.cover_image} alt={shop.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
      )}

      <div className="container mx-auto px-4 max-w-3xl">
        {/* Title + Rating */}
        <div className={`${shop.cover_image ? "-mt-12 relative z-10" : "pt-10"}`}>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">{shop.title}</h1>
          {shop.ratings_enabled && avgRating && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10">
                <Star size={14} className="text-primary fill-primary" />
                <span className="text-sm font-semibold text-primary">{avgRating}</span>
              </div>
              <span className="text-sm text-muted-foreground">({reviews?.length} reviews)</span>
            </div>
          )}
        </div>

        {/* Gallery */}
        {gallery.length > 0 && (
          <section className="mt-8">
            <div className={`grid gap-3 ${gallery.length === 1 ? "grid-cols-1" : gallery.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {gallery.map((url, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-border aspect-square">
                  <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* About */}
        {shop.about_text && (
          <section className="mt-8">
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">About</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{shop.about_text}</p>
          </section>
        )}

        {/* Services */}
        {services.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">{shop.h2_title || "Our Services"}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {services.filter(s => s.title).map((s, i) => (
                <div key={i} className="p-4 rounded-xl bg-card-gradient border border-border/50">
                  <h3 className="font-medium text-foreground mb-1">{s.title}</h3>
                  {s.description && <p className="text-sm text-muted-foreground">{s.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Location */}
        {(shop.address_line1 || shop.city) && (
          <section className="mt-10">
            <h2 className="text-lg font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <MapPin size={18} /> Location
            </h2>
            <div className="text-muted-foreground text-sm space-y-0.5">
              {shop.address_line1 && <p>{shop.address_line1}</p>}
              {shop.address_line2 && <p>{shop.address_line2}</p>}
              {(shop.city || shop.state) && <p>{[shop.city, shop.state].filter(Boolean).join(", ")} {shop.pin_code}</p>}
            </div>
            {shop.map_embed_code && (
              <div className="mt-4 rounded-xl overflow-hidden border border-border" dangerouslySetInnerHTML={{ __html: shop.map_embed_code }} />
            )}
          </section>
        )}

        {/* FAQ */}
        {faq.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">FAQ</h2>
            <div className="space-y-2">
              {faq.filter(f => f.question).map((f, i) => (
                <div key={i} className="rounded-xl border border-border/50 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left text-sm font-medium text-foreground hover:bg-muted/30 transition-colors"
                  >
                    {f.question}
                    {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground">{f.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        {shop.ratings_enabled && (
          <section className="mt-10">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">Reviews</h2>

            {/* Submit Review */}
            <div className="p-4 rounded-xl bg-card-gradient border border-border/50 mb-6">
              <p className="text-sm font-medium text-foreground mb-3">Leave a review</p>
              <div className="space-y-3">
                <Input value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} placeholder="Your name" />
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setReviewRating(n)} className="p-0.5">
                      <Star size={20} className={n <= reviewRating ? "text-primary fill-primary" : "text-muted-foreground"} />
                    </button>
                  ))}
                </div>
                <Textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Your review (optional)" className="min-h-[60px]" />
                <Button
                  size="sm"
                  onClick={() => submitReview.mutate()}
                  disabled={!reviewerName.trim() || submitReview.isPending}
                >
                  {submitReview.isPending ? "Submitting…" : "Submit Review"}
                </Button>
              </div>
            </div>

            {/* Reviews List */}
            {reviews && reviews.length > 0 && (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl border border-border/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{r.reviewer_name}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={12} className="text-primary fill-primary" />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                    <p className="text-[10px] text-muted-foreground/60 mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* Branding Footer */}
      {!shop.remove_branding && (
        <div className="mt-12 py-4 text-center text-xs text-muted-foreground">
          Built with <a href="/" className="text-primary hover:underline font-medium">Kashpages</a>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      {(whatsappNum || shop.contact_phone || shop.map_link) && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-secondary border-t border-sidebar-border">
          <div className="container mx-auto px-4 max-w-3xl flex items-center justify-center gap-3 h-14">
            {whatsappNum && (
              <a
                href={`https://wa.me/${whatsappNum.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick("whatsapp_click")}
                className="flex-1"
              >
                <Button variant="hero" className="w-full gap-2" size="sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </Button>
              </a>
            )}
            {shop.contact_phone && (
              <a href={`tel:${shop.contact_phone}`} onClick={() => trackClick("phone_click")} className="flex-1">
                <Button variant="outline" className="w-full gap-2 bg-secondary-foreground/10 border-sidebar-border text-secondary-foreground hover:bg-secondary-foreground/20" size="sm">
                  <Phone size={14} /> Call
                </Button>
              </a>
            )}
            {shop.map_link && (
              <a href={shop.map_link} target="_blank" rel="noopener noreferrer" onClick={() => trackClick("map_click")} className="flex-1">
                <Button variant="outline" className="w-full gap-2 bg-secondary-foreground/10 border-sidebar-border text-secondary-foreground hover:bg-secondary-foreground/20" size="sm">
                  <MapPin size={14} /> Location
                </Button>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicPage;
