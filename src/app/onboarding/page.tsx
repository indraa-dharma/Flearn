"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Calendar,
  Upload,
  BookOpen,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  FileText,
  Laptop,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { isCalendarConnected, calendarEmail, connectGoogleCalendar, updateProfile } = useAuth();
  
  // Step 1 states
  const [isConnectingCal, setIsConnectingCal] = useState(false);

  // Step 2 states (Laptop Direct Upload)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3 states
  const [major, setMajor] = useState("Computer Science");
  const [targetGoal, setTargetGoal] = useState("Maintain 3.8+ GPA (High Academic Honors)");

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      updateProfile({ major });
      router.push("/dashboard");
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // Connect Google Calendar handler
  const handleConnectCalendar = async () => {
    setIsConnectingCal(true);
    await connectGoogleCalendar();
    setIsConnectingCal(false);
  };

  // Laptop File Upload handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setIsUploading(true);
      setUploadProgress(20);

      const formData = new FormData();
      formData.append("file", file);

      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev < 85 ? prev + 20 : prev));
      }, 250);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        clearInterval(interval);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUploadProgress(100);
            setTimeout(() => {
              setUploadedFiles((prev) => [...prev, data.source]);
              setIsUploading(false);
              setSelectedFile(null);
              setUploadProgress(0);
            }, 800);
          }
        }
      } catch (err) {
        clearInterval(interval);
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12 transition-colors duration-300">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sky shadow-md">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-extrabold tracking-tight text-foreground">FLearn</span>
      </div>

      {/* Step Progress Bar */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-accent -z-10" />
          {[1, 2, 3].map((item) => {
            const isCompleted = step > item;
            const isCurrent = step === item;
            return (
              <div key={item} className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold text-sm transition-all shadow-sm ${
                    isCompleted
                      ? "bg-primary dark:bg-blue-600 border-primary dark:border-blue-600 text-white"
                      : isCurrent
                      ? "bg-card border-primary dark:border-blue-500 text-primary dark:text-blue-400 shadow-md"
                      : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : item}
                </div>
                <span className="mt-2 text-xs font-bold text-muted-foreground hidden sm:block">
                  {item === 1 ? "Connect Calendar" : item === 2 ? "Upload Sources" : "Academic Profile"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wizard Card */}
      <Card className="w-full max-w-lg shadow-xl animate-fade-in bg-card border-border rounded-3xl overflow-hidden">
        {step === 1 && (
          <>
            <CardHeader className="text-center pb-4 pt-8">
              <CardTitle className="text-2xl font-bold text-foreground">Connect Your Google Calendar</CardTitle>
              <CardDescription className="text-sm mt-2 text-muted-foreground max-w-sm mx-auto leading-relaxed">
                FLearn syncs your lecture schedules, assignment due dates, and study blocks to power the AI Decision Engine.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6 px-8">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 mb-6 shadow-inner">
                <Calendar className="h-10 w-10" />
              </div>
              
              {isCalendarConnected ? (
                <div className="w-full rounded-2xl border border-success/40 bg-green-50 dark:bg-green-950/30 p-5 text-center shadow-sm space-y-2">
                  <div className="flex items-center justify-center gap-2 text-success dark:text-green-400 font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5" /> Google Calendar Connected
                  </div>
                  <p className="text-xs text-muted-foreground">{calendarEmail || "alex.chen@gmail.com"}</p>
                </div>
              ) : (
                <Button
                  onClick={handleConnectCalendar}
                  disabled={isConnectingCal}
                  className="h-11 w-full max-w-xs gap-2 rounded-xl bg-primary dark:bg-blue-600 hover:bg-primary-dark text-white font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {isConnectingCal ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Connecting…
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4" /> Connect Google Calendar
                    </>
                  )}
                </Button>
              )}
              <p className="mt-4 text-xs text-muted-foreground">You can also connect Outlook or Apple Calendar later in settings.</p>
            </CardContent>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader className="text-center pb-4 pt-8">
              <CardTitle className="text-2xl font-bold text-foreground">Upload Initial Sources From Laptop</CardTitle>
              <CardDescription className="text-sm mt-2 text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Directly connect to your laptop storage. Upload course syllabi, lecture notes, or slides to build your AI knowledge base.
              </CardDescription>
            </CardHeader>
            <CardContent className="py-6 px-8 space-y-6">
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id="onboarding-laptop-upload"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-accent/40 py-10 px-6 text-center shadow-inner cursor-pointer hover:bg-accent/60 transition-all"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-primary dark:text-blue-400 mb-4 shadow-sm">
                  <Laptop className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-foreground">Click to browse laptop files or drag & drop</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, PPTX, or MP4 (up to 50MB)</p>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>Uploading & Parsing with AI…</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-accent rounded-full overflow-hidden border border-border">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-sky transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider">Uploaded Documents</p>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border shadow-sm">
                        <div className="flex items-center gap-3 truncate">
                          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-500 border border-red-100 dark:border-red-900/50">
                            <FileText className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-bold text-foreground truncate">{file.title}</span>
                        </div>
                        <span className="text-[10px] font-extrabold text-success dark:text-green-400 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/50 px-2.5 py-0.5 rounded-full">
                          AI Processed
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader className="text-center pb-4 pt-8">
              <CardTitle className="text-2xl font-bold text-foreground">Set Your Academic Profile</CardTitle>
              <CardDescription className="text-sm mt-2 text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Tell us what you are studying so FLearn can benchmark task difficulties and calibrate priority scoring.
              </CardDescription>
            </CardHeader>
            <CardContent className="py-6 px-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Major / Program</label>
                <select
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-accent/40 px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 focus:bg-card transition-all shadow-sm cursor-pointer"
                >
                  <option className="bg-card text-foreground" value="Computer Science">Computer Science</option>
                  <option className="bg-card text-foreground" value="Biology & Life Sciences">Biology & Life Sciences</option>
                  <option className="bg-card text-foreground" value="Economics & Finance">Economics & Finance</option>
                  <option className="bg-card text-foreground" value="Mathematics & Statistics">Mathematics & Statistics</option>
                  <option className="bg-card text-foreground" value="Engineering & Robotics">Engineering & Robotics</option>
                  <option className="bg-card text-foreground" value="History & Humanities">History & Humanities</option>
                  <option className="bg-card text-foreground" value="Psychology & Cognitive Science">Psychology & Cognitive Science</option>
                  <option className="bg-card text-foreground" value="Business Administration">Business Administration</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Target Academic Goal</label>
                <select
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-accent/40 px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 focus:bg-card transition-all shadow-sm cursor-pointer"
                >
                  <option className="bg-card text-foreground" value="Maintain 3.8+ GPA (High Academic Honors)">Maintain 3.8+ GPA (High Academic Honors)</option>
                  <option className="bg-card text-foreground" value="Optimize Study Time (Save 5h+/wk for Extracurriculars)">Optimize Study Time (Save 5h+/wk for Extracurriculars)</option>
                  <option className="bg-card text-foreground" value="Never Miss a Deadline (Perfect Compliance & Low Stress)">Never Miss a Deadline (Perfect Compliance & Low Stress)</option>
                  <option className="bg-card text-foreground" value="Research & Thesis Excellence (Deep Concept Mastery)">Research & Thesis Excellence (Deep Concept Mastery)</option>
                  <option className="bg-card text-foreground" value="Career & Internship Preparation (Practical Skill Building)">Career & Internship Preparation (Practical Skill Building)</option>
                </select>
              </div>
            </CardContent>
          </>
        )}

        <CardFooter className="flex items-center justify-between px-8 py-6 bg-accent/30 border-t border-border">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="h-10 px-5 rounded-xl bg-card hover:bg-accent border-border text-foreground font-semibold gap-2 shadow-sm disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            onClick={handleNext}
            className="h-10 px-6 rounded-xl bg-gradient-to-r from-primary to-sky hover:from-primary-dark hover:to-primary text-white font-bold gap-2 shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            {step === 3 ? "Get Started" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
