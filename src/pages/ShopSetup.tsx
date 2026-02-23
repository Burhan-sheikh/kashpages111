import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, ArrowRight, Upload, X, Plus, Trash2, Image as ImageIcon,
  Phone, MapPin, Save, Eye, Loader2, Check,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { firestore, storage } from "@/integrations/firebase/client";
// Removed Firestore imports for shop update
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";

interface ServiceItem {
  title: string;
  description: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

const ShopSetup = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isPro = profile?.plan === "pro";

  // --- Form State ---
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [ratingsEnabled, setRatingsEnabled] = useState(true);
  const [gallery, setGallery] = useState<string[]>([]);
  const [aboutText, setAboutText] = useState("");
  const [h2Title, setH2Title] = useState("");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [faq, setFaq] = useState<FaqItem[]>([]);

  // Step 2
  const [contactPhone, setContactPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [usePhoneForWhatsapp, setUsePhoneForWhatsapp] = useState(true);
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [mapEmbedCode, setMapEmbedCode] = useState("");

  // Fetch existing shop
  const { data: existingShop, isLoading } = useQuery({
    queryKey: ["my-shop-setup", user?.uid],
    queryFn: async () => {
      if (!user) return null;
      const q = query(
        collection(firestore, "shops"),
        where("owner_id", "==", user.uid),
        limit(1)
      );
      const snap = await getDocs(q);
      const doc = snap.docs[0];
      return doc ? { id: doc.id, ...doc.data() } : null;
    },
    enabled: !!user,
  });

  // Populate form with existing data
  useEffect(() => {
    if (existingShop) {
      setTitle(existingShop.title || "");
      setSlug(existingShop.slug || "");
      setCoverImage(existingShop.cover_image);
      setRatingsEnabled(existingShop.ratings_enabled);
      setGallery(Array.isArray(existingShop.gallery) ? existingShop.gallery as string[] : []);
      setAboutText(existingShop.about_text || "");
      setH2Title(existingShop.h2_title || "");
      setServices(Array.isArray(existingShop.services) ? (existingShop.services as unknown as ServiceItem[]) : []);
      setFaq(Array.isArray(existingShop.faq) ? (existingShop.faq as unknown as FaqItem[]) : []);
      setContactPhone(existingShop.contact_phone || "");
      setWhatsappNumber(existingShop.whatsapp_number || "");
      setUsePhoneForWhatsapp(
        typeof existingShop.use_phone_for_whatsapp === "boolean"
          ? existingShop.use_phone_for_whatsapp
          : true
      );
      setAddressLine1(existingShop.address_line1 || "");
      setAddressLine2(existingShop.address_line2 || "");
      setState(existingShop.state || "");
      setCity(existingShop.city || "");
      setPinCode(existingShop.pin_code || "");
      setMapLink(existingShop.map_link || "");
      setMapEmbedCode(existingShop.map_embed_code || "");
    }
  }, [existingShop]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!existingShop) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  }, [title, existingShop]);

  // Image upload helper
  const uploadImage = useCallback(async (file: File, path: string): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const filePath = `${user!.uid}/${path}-${Date.now()}.${ext}`;
    try {
      const storageReference = storageRef(storage, `shop-assets/${filePath}`);
      await uploadBytes(storageReference, file);
      const url = await getDownloadURL(storageReference);
      return url;
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message || "unknown error", variant: "destructive" });
      return null;
    }
  }, [user, toast]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file, "cover");
    if (url) setCoverImage(url);
    setUploading(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxGallery = isPro ? 10 : 3;
    if (gallery.length >= maxGallery) {
      toast({ title: `Gallery limit reached`, description: isPro ? "Max 10 images" : "Upgrade to Pro for more", variant: "destructive" });
      return;
    }
    setUploading(true);
    const url = await uploadImage(file, "gallery");
    if (url) setGallery((prev) => [...prev, url]);
    setUploading(false);
  };

  const removeGalleryImage = (index: number) => setGallery((prev) => prev.filter((_, i) => i !== index));

  // Services helpers
  const addService = () => setServices((prev) => [...prev, { title: "", description: "" }]);
  const updateService = (idx: number, field: keyof ServiceItem, val: string) =>
    setServices((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)));
  const removeService = (idx: number) => setServices((prev) => prev.filter((_, i) => i !== idx));

  // FAQ helpers
  const addFaq = () => setFaq((prev) => [...prev, { question: "", answer: "" }]);
  const updateFaq = (idx: number, field: keyof FaqItem, val: string) =>
    setFaq((prev) => prev.map((f, i) => (i === idx ? { ...f, [field]: val } : f)));
  const removeFaq = (idx: number) => setFaq((prev) => prev.filter((_, i) => i !== idx));

  // Save / upsert shop
  const saveShop = useMutation({
    mutationFn: async (status: string) => {
      if (!user?.uid) {
        console.error("Shop creation attempted with undefined user.uid", user);
        throw new Error("User not authenticated");
      }
      const shopData = {
        owner_id: user.uid,
        title,
        slug,
        cover_image: coverImage ?? null,
        ratings_enabled: isPro ? ratingsEnabled : true,
        gallery: gallery ?? [],
        about_text: aboutText || null,
        h2_title: h2Title || null,
        services: services.filter((s) => s.title),
        faq: faq.filter((f) => f.question),
        contact_phone: contactPhone || null,
        whatsapp_number: usePhoneForWhatsapp
          ? contactPhone || null
          : whatsappNumber || null,
        use_phone_for_whatsapp: Boolean(usePhoneForWhatsapp),
        address_line1: addressLine1 || null,
        address_line2: addressLine2 || null,
        state: state || null,
        city: city || null,
        pin_code: pinCode || null,
        map_link: mapLink || null,
        map_embed_code: mapEmbedCode || null,
        status,
      };

      if (existingShop && existingShop.id) {
        await fetch(`http://localhost:3001/api/shop-update?shopId=${existingShop.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(shopData),
        });
      } else {
        await fetch(`http://localhost:3001/api/shop-create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(shopData),
        });
      }
    },
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["my-shop"] });
      queryClient.invalidateQueries({ queryKey: ["my-shop-setup"] });
      toast({ title: status === "published" ? "Shop published!" : "Draft saved" });
      navigate("/dashboard");
    },
    onError: (err: any) => {
      toast({ title: "Error saving shop", description: err.message, variant: "destructive" });
    },
  });

  const handleSave = async (status: string) => {
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    if (!slug.trim()) {
      toast({ title: "Slug required", variant: "destructive" });
      return;
    }
    setSaving(true);
    await saveShop.mutateAsync(status);
    setSaving(false);
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${step === 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>1 Content</span>
              <ArrowRight size={12} />
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${step === 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>2 Contact</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleSave("draft")} disabled={saving}>
              <Save size={14} className="mr-1" /> Draft
            </Button>
            <Button variant="hero" size="sm" onClick={() => handleSave("published")} disabled={saving}>
              {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Eye size={14} className="mr-1" />}
              Publish
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="text-2xl font-display font-bold text-foreground mb-1">Shop Content</h1>
              <p className="text-muted-foreground text-sm mb-8">Set up your shop's content and appearance</p>

              <div className="space-y-6">
                {/* Cover Image */}
                <div>
                  <Label>Cover Image</Label>
                  <div className="mt-2">
                    {coverImage ? (
                      <div className="relative rounded-xl overflow-hidden border border-border">
                        <img src={coverImage} alt="Cover" className="w-full h-48 object-cover" />
                        <button onClick={() => setCoverImage(null)} className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-full hover:bg-background">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-48 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors">
                        {uploading ? <Loader2 className="animate-spin text-muted-foreground" size={24} /> : (
                          <>
                            <Upload size={24} className="text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">Upload cover image</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <Label htmlFor="title">Shop Title *</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Awesome Shop" className="mt-1.5" />
                </div>

                {/* Slug */}
                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">/s/</span>
                    <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="my-shop" />
                  </div>
                </div>

                {/* Ratings Toggle (Pro) */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-card-gradient border border-border/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">Show Ratings</p>
                    <p className="text-xs text-muted-foreground">Display average rating on your shop page</p>
                  </div>
                  <Switch checked={ratingsEnabled} onCheckedChange={setRatingsEnabled} disabled={!isPro} />
                  {!isPro && <span className="text-[10px] font-semibold uppercase text-primary ml-2">Pro</span>}
                </div>

                {/* Gallery */}
                <div>
                  <Label>Gallery {!isPro && <span className="text-muted-foreground text-xs">(max 3 — Pro: 10)</span>}</Label>
                  <div className="mt-2 grid grid-cols-3 gap-3">
                    {gallery.map((url, i) => (
                      <div key={i} className="relative rounded-lg overflow-hidden border border-border aspect-square">
                        <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                        <button onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 p-1 bg-background/80 rounded-full hover:bg-background">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {gallery.length < (isPro ? 10 : 3) && (
                      <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors aspect-square">
                        {uploading ? <Loader2 className="animate-spin text-muted-foreground" size={16} /> : (
                          <>
                            <ImageIcon size={16} className="text-muted-foreground mb-1" />
                            <span className="text-[10px] text-muted-foreground">Add</span>
                          </>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />
                      </label>
                    )}
                  </div>
                </div>

                {/* About */}
                <div>
                  <Label htmlFor="about">About Your Shop</Label>
                  <Textarea id="about" value={aboutText} onChange={(e) => setAboutText(e.target.value)} placeholder="Tell customers about your shop..." className="mt-1.5 min-h-[100px]" />
                </div>

                {/* H2 + Services */}
                <div>
                  <Label htmlFor="h2">Services Section Title</Label>
                  <Input id="h2" value={h2Title} onChange={(e) => setH2Title(e.target.value)} placeholder="Our Services" className="mt-1.5" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Services</Label>
                    <Button variant="ghost" size="sm" onClick={addService}><Plus size={14} className="mr-1" /> Add</Button>
                  </div>
                  <div className="space-y-3">
                    {services.map((s, i) => (
                      <div key={i} className="p-3 rounded-lg border border-border/50 bg-card-gradient space-y-2">
                        <div className="flex items-center gap-2">
                          <Input value={s.title} onChange={(e) => updateService(i, "title", e.target.value)} placeholder="Service name" className="flex-1" />
                          <button onClick={() => removeService(i)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                        </div>
                        <Textarea value={s.description} onChange={(e) => updateService(i, "description", e.target.value)} placeholder="Brief description" className="min-h-[60px]" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQ */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>FAQ</Label>
                    <Button variant="ghost" size="sm" onClick={addFaq}><Plus size={14} className="mr-1" /> Add</Button>
                  </div>
                  <div className="space-y-3">
                    {faq.map((f, i) => (
                      <div key={i} className="p-3 rounded-lg border border-border/50 bg-card-gradient space-y-2">
                        <div className="flex items-center gap-2">
                          <Input value={f.question} onChange={(e) => updateFaq(i, "question", e.target.value)} placeholder="Question" className="flex-1" />
                          <button onClick={() => removeFaq(i)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                        </div>
                        <Textarea value={f.answer} onChange={(e) => updateFaq(i, "answer", e.target.value)} placeholder="Answer" className="min-h-[60px]" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button onClick={() => setStep(2)} variant="hero">
                  Next: Contact <ArrowRight size={16} />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h1 className="text-2xl font-display font-bold text-foreground mb-1">Contact & Location</h1>
              <p className="text-muted-foreground text-sm mb-8">How can customers reach you?</p>

              <div className="space-y-6">
                {/* Phone */}
                <div>
                  <Label htmlFor="phone">Contact Phone</Label>
                  <div className="relative mt-1.5">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input id="phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+91 98765 43210" className="pl-10" />
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-card-gradient border border-border/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">Use phone for WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Use the same number for WhatsApp</p>
                  </div>
                  <Switch checked={usePhoneForWhatsapp} onCheckedChange={setUsePhoneForWhatsapp} />
                </div>
                {!usePhoneForWhatsapp && (
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <Input id="whatsapp" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+91 98765 43210" className="mt-1.5" />
                  </div>
                )}

                {/* Address */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2"><MapPin size={14} /> Location</Label>
                  <Input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Address Line 1" />
                  <Input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Address Line 2" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
                    <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" />
                  </div>
                  <Input value={pinCode} onChange={(e) => setPinCode(e.target.value)} placeholder="Pin Code" />
                </div>

                {/* Map */}
                <div>
                  <Label htmlFor="mapLink">Google Maps Link</Label>
                  <Input id="mapLink" value={mapLink} onChange={(e) => setMapLink(e.target.value)} placeholder="https://maps.google.com/..." className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="mapEmbed">Map Embed Code</Label>
                  <Textarea id="mapEmbed" value={mapEmbedCode} onChange={(e) => setMapEmbedCode(e.target.value)} placeholder='<iframe src="https://www.google.com/maps/embed?...">' className="mt-1.5 min-h-[80px] font-mono text-xs" />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} /> Back
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleSave("draft")} disabled={saving}>
                    <Save size={14} className="mr-1" /> Save Draft
                  </Button>
                  <Button variant="hero" onClick={() => handleSave("published")} disabled={saving}>
                    {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Check size={14} className="mr-1" />}
                    Publish
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ShopSetup;
