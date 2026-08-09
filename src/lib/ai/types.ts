export type DocumentSummaryOutput = {
  summary: string;
  key_points: string[];
  important_terms: Array<{ term: string; definition: string }>;
  suggested_topics: string[];
  difficulty_level: "easy" | "medium" | "hard";
  estimated_study_minutes: number;
};

export type StudyPlanOutput = {
  title: string;
  summary: string;
  priority_reasoning: string;
  workflow_steps: Array<{
    title: string;
    description: string;
    course?: string;
    topic?: string;
    type: "study" | "review" | "practice" | "break";
    duration_minutes: number;
    reasoning: string;
  }>;
  recommended_time_blocks: Array<{ title: string; start_time: string; end_time: string; reason: string }>;
  next_action: string;
  calendar_events_to_create: Array<{ title: string; description: string; start_time: string; end_time: string }>;
};
