
import { useAuth } from "@/hooks/useAuth";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { storage } from "@/integrations/firebase/client";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const Profile = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  if (!profile) return <div className="p-8">Loading...</div>;


  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setSaving(true);
    const ext = file.name.split('.').pop();
    const filePath = `avatars/${user.uid}.${ext}`;
    const storageReference = storageRef(storage, filePath);
    await uploadBytes(storageReference, file);
    const url = await getDownloadURL(storageReference);
    setAvatarUrl(url);
    setSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    if (!user) return;
    await fetch(`http://localhost:3001/api/profile-update?uid=${user.uid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, bio, avatar_url: avatarUrl }),
    });
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-10 bg-card rounded-2xl shadow-lg mt-8">
      <h1 className="text-3xl font-bold mb-6 text-center">My Profile</h1>
      <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
        <div className="relative group">
          <img
            src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`}
            alt="Avatar"
            className="w-28 h-28 rounded-full border-4 border-primary object-cover shadow-md"
          />
          {editing && (
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
          <Textarea value={bio} onChange={e => setBio(e.target.value)} />
        ) : (
          <div className="text-base">{profile.bio || <span className="text-muted-foreground">No bio set.</span>}</div>
        )}
      </div>
      <div className="flex flex-col md:flex-row gap-3 mt-8 justify-center">
        {editing ? (
          <>
            <Button onClick={handleSave} disabled={saving} variant="hero">{saving ? "Saving..." : "Save Changes"}</Button>
            <Button onClick={() => setEditing(false)} variant="outline">Cancel</Button>
          </>
        ) : (
          <Button onClick={() => setEditing(true)} variant="outline">Edit Profile</Button>
        )}
        <Button onClick={() => navigate("/dashboard")} variant="ghost">Back to Dashboard</Button>
      </div>
      <div className="mt-10 text-center">
        <Button variant="destructive" onClick={() => alert('Password change coming soon!')}>Change Password</Button>
      </div>
    </div>
  );
};

export default Profile;
