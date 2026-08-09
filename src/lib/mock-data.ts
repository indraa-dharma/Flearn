// ============================================================
// EduPulse Mock Data — structured for Supabase/API migration
// ============================================================

// --- Dashboard ---
export const aiInsight = {
  title: "Focus on Biology Chapter 4",
  description:
    "Based on your upcoming quiz on Friday and your recent lecture notes uploaded 2 hours ago. You've mastered 65% of the related concepts.",
  action: "Review Now",
  link: "/sources/bio-101-cell-structure",
};

export const studyReadiness = {
  percentage: 85,
  label: "Study Readiness",
  sublabel: "Optimal level for upcoming exams",
};

export const todayFocus: any[] = [];

export const weeklySchedule = {
  weekRange: "October 14 — October 20",
  days: [
    { label: "MON", date: 14, isToday: false },
    { label: "TUE", date: 15, isToday: false },
    { label: "WED", date: 16, isToday: false },
    { label: "THU", date: 17, isToday: false },
    { label: "FRI", date: 18, isToday: true },
    { label: "SAT", date: 19, isToday: false },
    { label: "SUN", date: 20, isToday: false },
  ],
  events: [] as { id: string; title: string; location?: string; time?: string; day: number; color: string }[],
};

export const recentSources: any[] = [];

// --- Sources Library ---
export const allSources: any[] = [];

// --- Document Detail ---
export const documentDetail = {
  id: "bio-101-cell-structure",
  title: "Biology 101: Cell Structure",
  subject: "BIOLOGY",
  fileName: "Biology_Lecture_1",
  uploadDate: "Oct 12",
  pages: 12,
  tags: ["Biology", "CellStructure"],
  outline: [
    { title: "Introduction", page: 1, active: true },
    { title: "Cell Membrane", page: 3, active: false },
    { title: "Organelles", page: 5, active: false },
    { title: "Nucleus", page: 7, active: false },
    { title: "Mitochondria", page: 9, active: false },
    { title: "Summary", page: 12, active: false },
  ],
  overview:
    "This lecture provides a comprehensive introduction to the fundamental building blocks of life. It covers the structural differences between prokaryotic and eukaryotic cells, explores the detailed architecture of the cell membrane, and dives into the specific roles of various organelles, specifically focusing on the nucleus and mitochondria as the regulatory and energy centers of the cell.",
  keyConcepts: [
    {
      title: "Cell Theory",
      content:
        "All living organisms are composed of one or more cells. The cell is the basic unit of structure and organization in organisms. Cells arise from pre-existing cells.",
    },
    {
      title: "Types of Cells",
      content:
        "Distinction between Prokaryotes (unicellular, no nucleus) and Eukaryotes (complex, membrane-bound organelles).",
    },
  ],
  importantTerms: [
    {
      term: "Prokaryotic",
      definition: "An organism whose cells do not have an enclosed nucleus or membrane-bound organelles.",
    },
    {
      term: "Eukaryotic",
      definition: "An organism whose cells contain a nucleus and membrane-bound organelles.",
    },
    {
      term: "Mitochondria",
      definition: "The powerhouse of the cell, responsible for producing ATP through cellular respiration.",
    },
  ],
};

export const chatMessages = [
  {
    id: "m1",
    role: "assistant" as const,
    content:
      "Hi! I've analyzed your lecture notes. Would you like me to explain the role of the cell membrane in signal transduction?",
    time: "10:45 AM",
  },
  {
    id: "m2",
    role: "user" as const,
    content: "Yes, specifically why it is considered selectively permeable.",
    time: "10:46 AM",
  },
  {
    id: "m3",
    role: "assistant" as const,
    content:
      "The cell membrane's selective permeability is due to its lipid bilayer structure. It allows small non-polar molecules like O2 to pass through easily while requiring transport proteins for ions and polar molecules.",
    time: "10:46 AM",
    citation: "Page 4",
  },
];

// --- Calendar ---
export const calendarStats = [
  { label: "CLASSES", value: "12 This Week", icon: "book" as const, color: "blue" as const },
  { label: "TIMELINE", value: "4 Deadlines", icon: "calendar" as const, color: "gray" as const },
  { label: "URGENT", value: "2 High-Risk", icon: "alert" as const, color: "danger" as const },
  { label: "PRODUCTIVITY", value: "15h Free Study", icon: "clock" as const, color: "primary" as const },
];

export const calendarCategories = [
  { name: "Classes", color: "#3b82f6", checked: true },
  { name: "Assignments", color: "#64748b", checked: true },
  { name: "Quizzes", color: "#f59e0b", checked: true },
  { name: "Exams", color: "#ef4444", checked: true },
  { name: "Personal", color: "#3b82f6", checked: true },
];

export const calendarEvents: any[] = [];

export const aiInsights = {
  detectedRisks: [
    {
      title: "Scheduling Conflict",
      description: "Bio Lab overlap with History Essay Deadline (Thursday).",
      type: "danger" as const,
    },
  ],
  efficiencyGaps: [
    { title: "Morning Gap (Tue)", duration: "2.5h", icon: "sunrise" as const },
    { title: "Evening Gap (Mon)", duration: "3h", icon: "moon" as const },
  ],
  recommendations: [
    {
      title: "Calculus Mastery",
      description: "Schedule 2h for Calculus on Tuesday morning to prepare for exam.",
      action: "+ Add to Calendar",
    },
  ],
  criticalAlerts: [
    { title: "History Paper", description: "Final draft due soon", hoursLeft: 48 },
  ],
};

// --- Priorities ---
export const priorities: any[] = [];

export const priorityLogic = {
  deadlineProximity: {
    label: "Deadline Proximity",
    severity: "CRITICAL" as const,
    description: "Submission window closes in less than 24 hours. No extensions detected.",
    value: 95,
    color: "danger" as const,
  },
  taskDifficulty: {
    label: "Task Difficulty",
    score: "7.8 / 10",
    description: 'Module contains "Cell Metabolism" which historically takes you 30% longer than average.',
    value: 78,
    color: "primary" as const,
  },
  progressCompletion: {
    label: "Progress Completion",
    severity: "Low" as const,
    description: "You have only completed the abstract. Methodology and Analysis remain unstarted.",
    value: 20,
    color: "primary" as const,
  },
  upcomingExams: {
    label: "Upcoming Exams",
    severity: "3 DAYS AWAY" as const,
    description: "Midterm exam weighting for this topic is 35% of final grade.",
    value: 85,
    color: "warning" as const,
  },
};

export const priorityInsight =
  "AI Insight: Completing this lab report now will reduce your cognitive load by 40% before your Macroeconomics study block tomorrow morning.";

// --- Study Plan ---
export const studyPlanItems: any[] = [];

export const planSummary = {
  totalStudyTime: "3.5h",
  freeTimeRemaining: "5h 20m",
  studyReadiness: 85,
};

export const mostUrgent = {
  title: "Biology Lab Report Draft",
  deadline: "Due tomorrow at 11:59 PM",
};

export const recommendedNext = {
  title: "Readings: Chapter 4",
  subject: "Discrete Math",
  duration: "20 mins",
};

// --- Analytics ---
export const weeklyStudyData = [
  { day: "Mon", hours: 4.5 },
  { day: "Tue", hours: 3.2 },
  { day: "Wed", hours: 5.1 },
  { day: "Thu", hours: 2.8 },
  { day: "Fri", hours: 4.0 },
  { day: "Sat", hours: 1.5 },
  { day: "Sun", hours: 3.0 },
];

export const subjectDistribution = [
  { subject: "Biology", percentage: 30, color: "#3b82f6" },
  { subject: "Mathematics", percentage: 25, color: "#8b5cf6" },
  { subject: "History", percentage: 20, color: "#f59e0b" },
  { subject: "Economics", percentage: 15, color: "#10b981" },
  { subject: "Computer Science", percentage: 10, color: "#ef4444" },
];

export const productivityMetrics = {
  avgFocusSession: "47 min",
  completionRate: "78%",
  streakDays: 12,
  totalHoursThisWeek: "24.1h",
  tasksCompleted: 18,
  tasksRemaining: 7,
  peakHour: "9:00 AM - 11:00 AM",
  improvementFromLastWeek: "+12%",
};

export const weeklyAISummary =
  "This week you spent 24.1 hours studying across 5 subjects. Your strongest focus areas were Biology (30%) and Mathematics (25%). You completed 18 of 25 tasks. Your peak productivity window was 9-11 AM on weekdays. Consider allocating more time to History — your upcoming midterm has a high impact on your overall grade.";

// --- User ---
export const currentUser = {
  name: "",
  role: "",
  avatar: "",
  university: "",
  year: "",
  major: "",
  courses: [],
};
