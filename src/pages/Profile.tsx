import { useAuth } from "@/hooks/useAuth";
import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { storage, firestore } from "@/integrations/firebase/client";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!profile || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({ 
        title: "File too large", 
        description: "Maximum file size is 5MB", 
        variant: "destructive" 
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({ 
        title: "Invalid file type", 
        description: "Only image files are allowed", 
        variant: "destructive" 
      });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `avatars/${user.uid}.${ext}`;
      const storageReference = storageRef(storage, filePath);
      
      const metadata = {
        contentType: file.type,
        customMetadata: {
          'uploadedBy': user.uid,
        }
      };
      
      await uploadBytes(storageReference, file, metadata);
      const url = await getDownloadURL(storageReference);
      setAvatarUrl(url);
      toast({ title: "Avatar uploaded!", description: "Image uploaded successfully" });
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      let errorMessage = "Upload failed";
      
      if (err.code === 'storage/unauthorized') {
        errorMessage = "Permission denied. Please make sure storage rules are deployed.";
      } else if (err.code === 'storage/canceled') {
        errorMessage = "Upload was cancelled";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast({ 
        title: "Upload failed", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  }, [user, toast]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Update profile in Firestore
      const profileRef = doc(firestore, "profiles", user.uid);
      await updateDoc(profileRef, {
        username,
        bio,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });
      
      toast({ 
        title: "Profile updated!", 
        description: "Your changes have been saved" 
      });
      setEditing(false);
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (err: any) {
      console.error("Profile update error:", err);
      toast({ 
        title: "Update failed", 
        description: err.message || "Failed to update profile", 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-10 bg-card rounded-2xl shadow-lg mt-8">
      <h1 className="text-3xl font-bold mb-6 text-center">My Profile</h1>
      <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
        <div className="relative group">
          {uploading ? (
            <div className="w-28 h-28 rounded-full border-4 border-primary flex items-center justify-center">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : (
            <img
              src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`}
              alt="Avatar"
              className="w-28 h-28 rounded-full border-4 border-primary object-cover shadow-md"
            />
          )}
          {editing && !uploading && (
            <>
              <button
                className="absolute bottom-2 right-2 bg-primary text-primary-foreground rounded-full p-2 shadow hover:bg-primary/90 transition"
                onClick={() => fileInputRef.current?.click()}
                title="Change Avatar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3h3z" /></svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </>
          )}
        </div>
        <div className="flex-1 w-full">
          <div className="mb-3">
            <div className="font-semibold text-muted-foreground text-xs uppercase">Username</div>
            {editing ? (
              <Input value={username} onChange={e => setUsername(e.target.value)} />
            ) : (
              <div className="text-lg font-mono">@{profile.username}</div>
            )}
          </div>
          <div className="mb-3">
            <div className="font-semibold text-muted-foreground text-xs uppercase">Email</div>
            <div className="text-base">{user?.email}</div>
          </div>
          <div className="mb-3">
            <div className="font-semibold text-muted-foreground text-xs uppercase">Plan</div>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/10 text-primary">
              {profile.plan}
            </span>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <div className="font-semibold text-muted-foreground text-xs uppercase mb-1">Bio</div>
        {editing ? (
          <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." />
        ) : (
          <div className="text-base">{profile.bio || <span className="text-muted-foreground">No bio set.</span>}</div>
        )}
      </div>
      <div className="flex flex-col md:flex-row gap-3 mt-8 justify-center">
        {editing ? (
          <>
            <Button onClick={handleSave} disabled={saving || uploading} variant="hero">
              {saving ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={14} />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button onClick={() => setEditing(false)} variant="outline" disabled={saving || uploading}>Cancel</Button>
          </>
        ) : (
          <Button onClick={() => setEditing(true)} variant="outline">Edit Profile</Button>
        )}
        <Button onClick={() => navigate("/dashboard")} variant="ghost">Back to Dashboard</Button>
      </div>
      <div className="mt-10 text-center">
        <Button variant="destructive" onClick={() => toast({ title: "Coming soon!", description: "Password change feature is under development" })}>Change Password</Button>
      </div>
    </div>
  );
};

export default Profile;