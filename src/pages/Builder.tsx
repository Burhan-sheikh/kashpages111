// Placeholder - replaced by Shop Setup Wizard in Phase 4
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Builder = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-display font-bold text-foreground mb-4">Shop Setup</h1>
        <p className="text-muted-foreground mb-6">The shop setup wizard will be built in the next phase.</p>
        <Link to="/dashboard">
          <Button variant="outline"><ArrowLeft size={16} className="mr-2" /> Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default Builder;
