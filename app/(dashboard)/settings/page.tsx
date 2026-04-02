"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Palette,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  AlertTriangle,
} from "lucide-react";

type Tab = "profile" | "appearance" | "security";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Profile tab state
  const [profileData, setProfileData] = useState({
    name: session?.user?.name || "",
    bio: session?.user?.bio || "",
    image: session?.user?.image || "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    session?.user?.image || null
  );

  // Security tab state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const showToast = (message: string) => {
    setToast({ message });
    setTimeout(() => setToast(null), 3000);
  };

  // Profile handlers
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileData.name,
          bio: profileData.bio,
          image: avatarPreview || profileData.image,
        }),
      });

      if (!response.ok) throw new Error("Failed to save profile");

      await update();
      showToast("Profile updated successfully!");
    } catch (error) {
      showToast("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Password handler
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) throw new Error("Failed to change password");

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showToast("Password changed successfully!");
    } catch (error) {
      showToast("Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      showToast("Please type DELETE to confirm");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete account");

      showToast("Account deleted. Redirecting...");
      // Redirect to home after deletion
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      showToast("Failed to delete account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile, preferences, and account security
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        {[
          { tab: "profile" as Tab, label: "Profile", icon: User },
          { tab: "appearance" as Tab, label: "Appearance", icon: Palette },
          { tab: "security" as Tab, label: "Security", icon: Lock },
        ].map(({ tab, label, icon: Icon }) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 pb-2 font-medium text-sm transition-colors ${
              activeTab === tab
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-6 space-y-6">
            <h2 className="text-xl font-bold">Profile Information</h2>

            {/* Avatar */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Avatar</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("avatar-upload")?.click()
                    }
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAvatarPreview(null)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                placeholder="Your name"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Bio ({profileData.bio.length}/200)
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    setProfileData({
                      ...profileData,
                      bio: e.target.value,
                    });
                  }
                }}
                placeholder="Tell us about yourself..."
                className="w-full px-3 py-2 border rounded-lg bg-background"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {200 - profileData.bio.length} characters remaining
              </p>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Appearance Tab */}
      {activeTab === "appearance" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-6 space-y-6">
            <h2 className="text-xl font-bold">Theme Preference</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { value: "light", label: "Light", icon: "☀️" },
                { value: "dark", label: "Dark", icon: "🌙" },
                { value: "system", label: "System", icon: "⚙️" },
              ].map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => setTheme(themeOption.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-center space-y-2 ${
                    theme === themeOption.value
                      ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950"
                      : "border-border hover:border-indigo-300"
                  }`}
                >
                  <div className="text-3xl">{themeOption.icon}</div>
                  <div className="font-medium text-sm">{themeOption.label}</div>
                  {theme === themeOption.value && (
                    <Badge className="w-fit mx-auto" variant="default">
                      Active
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Change Password */}
          <Card className="p-6 space-y-6">
            <h2 className="text-xl font-bold">Change Password</h2>

            {/* Current Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg bg-background pr-10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      current: !showPasswords.current,
                    })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg bg-background pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      new: !showPasswords.new,
                    })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg bg-background pr-10"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      confirm: !showPasswords.confirm,
                    })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border-red-200 dark:border-red-900 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
            </div>

            <p className="text-sm text-muted-foreground">
              Deleting your account is permanent and cannot be undone.
            </p>

            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Account"
        description="This action cannot be undone. Please type DELETE to confirm."
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-900">
            <p className="text-sm text-red-900 dark:text-red-100">
              All your data will be permanently deleted.
            </p>
          </div>

          <Input
            placeholder="Type DELETE to confirm"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
          />

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteConfirmText("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE" || isLoading}
              className="flex-1"
            >
              {isLoading ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 bg-card border rounded-lg p-4 shadow-lg"
        >
          {toast.message}
        </motion.div>
      )}
    </div>
  );
}
