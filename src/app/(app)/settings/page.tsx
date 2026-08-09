"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  GraduationCap,
  Calendar,
  Shield,
  Upload,
  Trash2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user, isCalendarConnected, calendarEmail, connectGoogleCalendar, disconnectGoogleCalendar, updateProfile, logout, profileVersion } = useAuth();
  
  const [formName, setFormName] = useState(user?.name || "");
  const [formEmail, setFormEmail] = useState(user?.email || "");
  const [formUniversity, setFormUniversity] = useState(user?.university || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [formMajor, setFormMajor] = useState(user?.major || "");
  const [customMajor, setCustomMajor] = useState("");
  const [formTarget, setFormTarget] = useState("");
  const [customTarget, setCustomTarget] = useState("");
  
  const [newCourse, setNewCourse] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormName(user.name || "");
      setFormEmail(user.email || "");
      setFormUniversity(user.university || "");
      
      const majorOptions = [
        "Computer Science",
        "Biology & Life Sciences",
        "Economics & Finance",
        "Mathematics & Statistics",
        "Engineering & Robotics",
        "History & Humanities",
        "Psychology & Cognitive Science",
        "Business Administration"
      ];
      if (user.major && !majorOptions.includes(user.major)) {
        setFormMajor("Lainnya...");
        setCustomMajor(user.major);
      } else {
        setFormMajor(user.major || "");
      }

      const targetOptions = [
        "Maintain 3.8+ GPA (High Academic Honors)",
        "Optimize Study Time (Save 5h+/wk for Extracurriculars)",
        "Never Miss a Deadline (Perfect Compliance & Low Stress)",
        "Research & Thesis Excellence (Deep Concept Mastery)",
        "Career & Internship Preparation (Practical Skill Building)"
      ];
      const userTarget = (user as any).target || "";
      if (userTarget && !targetOptions.includes(userTarget)) {
        setFormTarget("Lainnya...");
        setCustomTarget(userTarget);
      } else {
        setFormTarget(userTarget || "");
        setCustomTarget("");
      }
    }
  }, [user, profileVersion]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileSaved(false);

    const actualMajor = formMajor === "Lainnya..." ? customMajor : formMajor;
    const actualTarget = formTarget === "Lainnya..." ? customTarget : formTarget;

    const fields = {
      name: formName,
      email: formEmail,
      university: formUniversity,
      major: actualMajor,
      target: actualTarget,
      courses: user?.courses || [],
    };

    updateProfile(fields);

    try {
      await fetch('/api/profile', { 
        method: 'PUT', 
        body: JSON.stringify(fields),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save profile", error);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddCourse = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newCourse.trim()) {
      e.preventDefault();
      const updatedCourses = [...(user?.courses || []), newCourse.trim()];
      updateProfile({ courses: updatedCourses });
      setNewCourse("");
    }
  };

  const handleRemoveCourse = (courseToRemove: string) => {
    const updatedCourses = (user?.courses || []).filter(c => c !== courseToRemove);
    updateProfile({ courses: updatedCourses });
  };



  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      const confirmText = window.prompt('Type "HAPUS" to confirm account deletion:');
      if (confirmText === "HAPUS") {
        try {
          localStorage.removeItem("flearn-user-profile");
          localStorage.removeItem("flearn-language");
          logout();
        } catch (error) {
          console.error("Error deleting account", error);
        }
      } else if (confirmText !== null) {
        alert("Deletion cancelled: confirmation text did not match.");
      }
    }
  };

  const handleConnectToggle = async () => {
    setIsConnecting(true);
    if (isCalendarConnected) {
      await disconnectGoogleCalendar();
    } else {
      await connectGoogleCalendar();
    }
    setIsConnecting(false);
  };

  return (
    <div className="anim-page space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your academic profile, calendar integrations, and AI preferences</p>
      </div>

      {/* 1. Profile */}
      <Card className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden card-hover">
        <CardHeader className="bg-accent/40 border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <User className="h-5 w-5 text-primary dark:text-blue-400" />
            <div>
              <CardTitle className="text-sm font-bold text-foreground">Personal Profile</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">Your personal details and avatar</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-6">
            <Avatar size="lg" className="ring-4 ring-primary/20 dark:ring-blue-500/20 shadow-sm">
              {user?.avatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.avatar} alt={user.name || "Avatar"} className="h-full w-full object-cover" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-primary to-sky text-white text-lg font-black">
                  {user?.name ? user.name.split(" ").map((n) => n[0]).join("") : "AC"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg" 
                  className="hidden" 
                  id="avatar-upload" 
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const localUrl = URL.createObjectURL(file);
                      updateProfile({ avatar: localUrl });

                      const formData = new FormData();
                      formData.append("file", file);
                      try {
                        const res = await fetch("/api/upload-avatar", {
                          method: "POST",
                          body: formData
                        });
                        const data = await res.json();
                        if (data.success) {
                          updateProfile({ avatar: data.url });
                        } else {
                          console.error("Avatar upload failed:", data.error);
                        }
                      } catch (err) {
                        console.error("Avatar upload failed:", err);
                      }
                    }
                  }} 
                />
                <label htmlFor="avatar-upload" className="inline-flex items-center justify-center h-9 px-4 rounded-xl bg-primary dark:bg-blue-600 hover:bg-primary-dark text-white shadow-sm text-xs font-semibold gap-1.5 cursor-pointer">
                  <Upload className="h-3.5 w-3.5" /> Change Avatar
                </label>
                <Button size="sm" variant="outline" onClick={async () => {
                  try {
                    await fetch("/api/upload-avatar", { method: "DELETE" });
                  } catch (err) {
                    console.error("Avatar remove failed:", err);
                  }
                  updateProfile({ avatar: "" });
                }} className="h-9 px-4 rounded-xl text-xs bg-card hover:bg-accent border-border text-foreground">
                  Remove
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">Recommended size: 256x256px. Formats: JPG, PNG.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-accent/40 px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 focus:bg-card transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-accent/40 px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 focus:bg-card transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">University</label>
              <input
                type="text"
                value={formUniversity}
                onChange={(e) => setFormUniversity(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-accent/40 px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 focus:bg-card transition-all shadow-sm"
              />
            </div>
          </div>
          <div className="pt-4 flex items-center gap-3 w-full justify-end border-t border-border mt-4">
            {profileSaved && (
              <span className="flex items-center text-success text-sm font-medium gap-1 animate-in fade-in zoom-in duration-300">
                <CheckCircle2 className="h-4 w-4" /> Saved
              </span>
            )}
            <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="h-10 px-6 rounded-xl bg-primary dark:bg-blue-600 hover:bg-primary-dark text-white shadow-sm text-sm font-semibold gap-2">
              {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Simpan Perubahan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Academic Profile */}
      <Card className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden card-hover">
        <CardHeader className="bg-accent/40 border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="h-5 w-5 text-primary dark:text-blue-400" />
            <div>
              <CardTitle className="text-sm font-bold text-foreground">Academic Profile</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">Major, study year, and active courses</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Major / Program</label>
              <select
                value={formMajor}
                onChange={(e) => setFormMajor(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-accent/40 px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 focus:bg-card transition-all shadow-sm cursor-pointer"
              >
                <option value="" disabled className="bg-card text-muted-foreground">Pilih jurusan...</option>
                <option className="bg-card text-foreground" value="Computer Science">Computer Science</option>
                <option className="bg-card text-foreground" value="Biology & Life Sciences">Biology & Life Sciences</option>
                <option className="bg-card text-foreground" value="Economics & Finance">Economics & Finance</option>
                <option className="bg-card text-foreground" value="Mathematics & Statistics">Mathematics & Statistics</option>
                <option className="bg-card text-foreground" value="Engineering & Robotics">Engineering & Robotics</option>
                <option className="bg-card text-foreground" value="History & Humanities">History & Humanities</option>
                <option className="bg-card text-foreground" value="Psychology & Cognitive Science">Psychology & Cognitive Science</option>
                <option className="bg-card text-foreground" value="Business Administration">Business Administration</option>
                <option className="bg-card text-foreground" value="Lainnya...">Lainnya...</option>
              </select>
              {formMajor === "Lainnya..." && (
                <input
                  type="text"
                  placeholder="Masukkan jurusan..."
                  value={customMajor}
                  onChange={(e) => setCustomMajor(e.target.value)}
                  className="w-full h-10 mt-2 rounded-xl border border-border bg-accent/40 px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 focus:bg-card transition-all shadow-sm"
                />
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">Target Academic Goal</label>
              <select 
                value={formTarget}
                onChange={(e) => setFormTarget(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-accent/40 px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 focus:bg-card transition-all shadow-sm cursor-pointer">
                <option value="" disabled className="bg-card text-muted-foreground">Pilih target...</option>
                <option className="bg-card text-foreground" value="Maintain 3.8+ GPA (High Academic Honors)">Maintain 3.8+ GPA (High Academic Honors)</option>
                <option className="bg-card text-foreground" value="Optimize Study Time (Save 5h+/wk for Extracurriculars)">Optimize Study Time (Save 5h+/wk for Extracurriculars)</option>
                <option className="bg-card text-foreground" value="Never Miss a Deadline (Perfect Compliance & Low Stress)">Never Miss a Deadline (Perfect Compliance & Low Stress)</option>
                <option className="bg-card text-foreground" value="Research & Thesis Excellence (Deep Concept Mastery)">Research & Thesis Excellence (Deep Concept Mastery)</option>
                <option className="bg-card text-foreground" value="Career & Internship Preparation (Practical Skill Building)">Career & Internship Preparation (Practical Skill Building)</option>
                <option className="bg-card text-foreground" value="Lainnya...">Lainnya...</option>
              </select>
              {formTarget === "Lainnya..." && (
                <input
                  type="text"
                  placeholder="Masukkan target..."
                  value={customTarget}
                  onChange={(e) => setCustomTarget(e.target.value)}
                  className="w-full h-10 mt-2 rounded-xl border border-border bg-accent/40 px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 focus:bg-card transition-all shadow-sm"
                />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">Active Courses</label>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Type a course and press Enter..."
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                onKeyDown={handleAddCourse}
                className="w-full h-10 rounded-xl border border-border bg-accent/40 px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 focus:bg-card transition-all shadow-sm"
              />
              <div className="flex flex-wrap gap-2">
                {user?.courses?.map((course) => (
                  <span key={course} className="inline-flex items-center gap-1.5 rounded-xl bg-accent border border-border px-3 py-1.5 text-xs font-bold text-foreground shadow-sm">
                    <GraduationCap className="h-3.5 w-3.5 text-primary dark:text-blue-400" />
                    {course}
                    <button onClick={() => handleRemoveCourse(course)} className="ml-1 text-muted-foreground hover:text-danger focus:outline-none cursor-pointer">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {(!user?.courses || user.courses.length === 0) && (
                  <span className="text-xs text-muted-foreground italic">No active courses. Add one above.</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Connected Accounts */}
      <Card className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden card-hover">
        <CardHeader className="bg-accent/40 border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-5 w-5 text-primary dark:text-blue-400" />
            <div>
              <CardTitle className="text-sm font-bold text-foreground">Connected Accounts</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">External Google Calendar integration</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 shadow-sm">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground">Google Calendar</p>
                {isCalendarConnected ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-success dark:text-green-400 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/50 px-2.5 py-0.5 rounded-full shadow-sm">
                    <CheckCircle2 className="h-3 w-3" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-muted-foreground bg-accent border border-border px-2.5 py-0.5 rounded-full shadow-sm">
                    Not Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isCalendarConnected ? calendarEmail || "alex.chen@gmail.com" : "No account linked"}
              </p>
            </div>
          </div>
          <Button
            variant={isCalendarConnected ? "outline" : "default"}
            onClick={handleConnectToggle}
            disabled={isConnecting}
            className={`h-9 px-5 rounded-xl text-xs font-semibold shadow-sm gap-2 transition-all ${
              isCalendarConnected
                ? "border-danger text-danger hover:bg-danger-light dark:hover:bg-red-950/30"
                : "bg-gradient-to-r from-primary to-sky text-white hover:scale-[1.02]"
            }`}
          >
            {isConnecting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating…
              </>
            ) : isCalendarConnected ? (
              "Disconnect"
            ) : (
              "Connect Google Calendar"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 4. Data & Privacy */}
      <Card className="bg-card shadow-sm rounded-2xl border border-border overflow-hidden card-hover">
        <CardHeader className="bg-accent/40 border-b border-border px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Shield className="h-5 w-5 text-primary dark:text-blue-400" />
            <div>
              <CardTitle className="text-sm font-bold text-foreground">Data & Privacy</CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">Manage your personal data and account deletion</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-danger dark:text-red-400">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">Permanently remove your account, calendar sync, and all uploaded documents.</p>
            </div>
            <Button onClick={handleDeleteAccount} variant="outline" className="h-9 px-4 rounded-xl text-xs border-danger text-danger hover:bg-danger-light dark:hover:bg-red-950/30 font-semibold gap-1.5 shadow-sm">
              <Trash2 className="h-3.5 w-3.5" /> Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
