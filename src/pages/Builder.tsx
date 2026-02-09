import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Eye, Save, Undo2, Redo2, Monitor, Tablet, Smartphone,
  Plus, GripVertical, Type, AlignLeft, Image, Video, MousePointer,
  Layout, Star, DollarSign, HelpCircle, Grid, Mail, Minus, Move,
  Share2, MapPin, Trash2, ChevronDown
} from "lucide-react";
import type { ContentBlock, BlockType, BuilderState } from "@/types";

const blockCategories = [
  {
    label: "Sections",
    blocks: [
      { type: "hero" as BlockType, icon: Layout, label: "Hero" },
      { type: "features" as BlockType, icon: Grid, label: "Features" },
      { type: "testimonials" as BlockType, icon: Star, label: "Testimonials" },
      { type: "pricing" as BlockType, icon: DollarSign, label: "Pricing" },
      { type: "faq" as BlockType, icon: HelpCircle, label: "FAQ" },
      { type: "gallery" as BlockType, icon: Image, label: "Gallery" },
      { type: "contact" as BlockType, icon: Mail, label: "Contact" },
    ],
  },
  {
    label: "Elements",
    blocks: [
      { type: "heading" as BlockType, icon: Type, label: "Heading" },
      { type: "paragraph" as BlockType, icon: AlignLeft, label: "Paragraph" },
      { type: "button" as BlockType, icon: MousePointer, label: "Button" },
      { type: "image" as BlockType, icon: Image, label: "Image" },
      { type: "video" as BlockType, icon: Video, label: "Video" },
      { type: "divider" as BlockType, icon: Minus, label: "Divider" },
      { type: "spacer" as BlockType, icon: Move, label: "Spacer" },
      { type: "social-links" as BlockType, icon: Share2, label: "Social Links" },
      { type: "map" as BlockType, icon: MapPin, label: "Map" },
    ],
  },
];

const defaultBlockProps: Record<BlockType, Record<string, unknown>> = {
  hero: { title: "Welcome to My Business", subtitle: "We provide the best services in Kashmir", buttonText: "Learn More", buttonUrl: "#" },
  features: { title: "Our Features", items: [{ title: "Quality", desc: "Best quality products" }, { title: "Fast", desc: "Quick delivery" }, { title: "Trusted", desc: "Trusted by thousands" }] },
  testimonials: { title: "What People Say", items: [{ name: "Ahmed", text: "Excellent service!", rating: 5 }] },
  pricing: { title: "Pricing", plans: [{ name: "Basic", price: "₹499", features: ["Feature 1", "Feature 2"] }] },
  faq: { title: "FAQ", items: [{ q: "How does it work?", a: "Simply sign up and start building." }] },
  gallery: { title: "Gallery", images: [] },
  contact: { title: "Contact Us", email: "", phone: "" },
  footer: { text: "© 2026 My Business" },
  heading: { text: "Section Heading", level: "h2" },
  paragraph: { text: "Add your content here. Click to edit." },
  button: { text: "Click Me", url: "#", variant: "primary" },
  image: { src: "", alt: "Image description" },
  video: { src: "", title: "Video" },
  form: { fields: [] },
  divider: { style: "solid" },
  spacer: { height: 48 },
  "social-links": { links: [] },
  map: { address: "Srinagar, Kashmir" },
};

const BlockPreview = ({ block, isSelected, onClick }: { block: ContentBlock; isSelected: boolean; onClick: () => void }) => {
  const renderContent = () => {
    switch (block.type) {
      case "hero":
        return (
          <div className="bg-hero-gradient p-8 rounded-lg text-center">
            <h2 className="text-2xl font-display font-bold text-secondary-foreground mb-2">{block.props.title as string}</h2>
            <p className="text-secondary-foreground/60 text-sm mb-4">{block.props.subtitle as string}</p>
            <span className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">{block.props.buttonText as string}</span>
          </div>
        );
      case "heading":
        return <h2 className="text-xl font-display font-bold text-foreground">{block.props.text as string}</h2>;
      case "paragraph":
        return <p className="text-muted-foreground text-sm">{block.props.text as string}</p>;
      case "divider":
        return <hr className="border-border" />;
      case "spacer":
        return <div style={{ height: block.props.height as number }} className="bg-muted/30 rounded flex items-center justify-center text-xs text-muted-foreground">{block.props.height as number}px spacer</div>;
      case "button":
        return <span className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">{block.props.text as string}</span>;
      case "features":
        return (
          <div className="text-center">
            <h3 className="font-display font-bold text-foreground mb-3">{block.props.title as string}</h3>
            <div className="grid grid-cols-3 gap-2">
              {(block.props.items as Array<{ title: string; desc: string }>).map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground capitalize">{block.type} Block</p>
          </div>
        );
    }
  };

  return (
    <motion.div
      layout
      onClick={onClick}
      className={`group relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
        isSelected ? "border-primary shadow-saffron" : "border-transparent hover:border-border"
      }`}
    >
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical size={16} className="text-muted-foreground" />
      </div>
      {renderContent()}
      {isSelected && (
        <div className="absolute -top-2 -right-2 flex gap-1">
          <button className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center shadow-sm">
            <Trash2 size={12} className="text-destructive-foreground" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

const Builder = () => {
  const [state, setState] = useState<BuilderState>({
    blocks: [
      { id: "1", type: "hero", props: defaultBlockProps.hero, order: 0 },
      { id: "2", type: "features", props: defaultBlockProps.features, order: 1 },
      { id: "3", type: "paragraph", props: { text: "Welcome to our beautiful page. Edit this text to tell your story." }, order: 2 },
    ],
    selectedBlockId: null,
    previewMode: "desktop",
    isDirty: false,
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const addBlock = useCallback((type: BlockType) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      props: { ...defaultBlockProps[type] },
      order: state.blocks.length,
    };
    setState((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
      selectedBlockId: newBlock.id,
      isDirty: true,
    }));
  }, [state.blocks.length]);

  const removeBlock = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== id),
      selectedBlockId: prev.selectedBlockId === id ? null : prev.selectedBlockId,
      isDirty: true,
    }));
  }, []);

  const previewWidths = { desktop: "100%", tablet: "768px", mobile: "375px" };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Toolbar */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card-gradient flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft size={18} /></Button>
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Page Builder</h1>
            <p className="text-xs text-muted-foreground">Untitled Page</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => setState((s) => ({ ...s, previewMode: mode }))}
              className={`p-1.5 rounded-md transition-colors ${
                state.previewMode === mode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon"><Undo2 size={16} /></Button>
          <Button variant="ghost" size="icon"><Redo2 size={16} /></Button>
          <Button variant="outline" size="sm"><Eye size={14} className="mr-1" /> Preview</Button>
          <Button variant="hero" size="sm"><Save size={14} className="mr-1" /> Save</Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Block sidebar */}
        {sidebarOpen && (
          <aside className="w-64 border-r border-border bg-card-gradient overflow-y-auto flex-shrink-0">
            <div className="p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Add Blocks</h3>
              {blockCategories.map((cat) => (
                <div key={cat.label} className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">{cat.label}</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {cat.blocks.map((block) => (
                      <button
                        key={block.type}
                        onClick={() => addBlock(block.type)}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <block.icon size={18} />
                        <span className="text-[10px] font-medium">{block.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Canvas */}
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <div
            className="mx-auto bg-background rounded-xl border border-border shadow-card min-h-[600px] transition-all duration-300"
            style={{ maxWidth: previewWidths[state.previewMode] }}
          >
            <div className="p-6 space-y-2">
              {state.blocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Plus size={32} className="mb-3 text-border" />
                  <p className="text-sm">Click a block from the sidebar to start building</p>
                </div>
              ) : (
                state.blocks.map((block) => (
                  <BlockPreview
                    key={block.id}
                    block={block}
                    isSelected={state.selectedBlockId === block.id}
                    onClick={() => setState((s) => ({ ...s, selectedBlockId: block.id }))}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Builder;
