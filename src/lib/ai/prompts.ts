const system = `You are Flearn, an AI academic study planner for Indonesian students.
Return ONLY valid JSON matching the requested schema. Do not include markdown fences, commentary, or extra keys. Use friendly bilingual Indonesian-English wording when useful.`;

export function buildSummaryPrompt(input: { title: string; text: string }) {
  return `${system}

Task: Summarize this academic document.
Schema: {"summary":"string","key_points":["string"],"important_terms":[{"term":"string","definition":"string"}],"suggested_topics":["string"],"difficulty_level":"easy|medium|hard","estimated_study_minutes":number}

Title: ${input.title}
Document text:
${input.text.slice(0, 24000)}`;
}

export function buildStudyPlanPrompt(input: { documents: string; calendar: string; now: string; preferences?: unknown }) {
  const hasDocs = input.documents.trim().length > 0;
  const docsSection = hasDocs
    ? `Documents:
${input.documents.slice(0, 30000)}`
    : `Documents: None uploaded yet. Create a general weekly study plan based on typical university courses and the student's calendar.`;

  return `${system}

Task: Create a realistic calendar-aware study workflow${hasDocs ? " based on the uploaded documents" : ""}.
You are a smart scheduler. The current date and time is: ${input.now}.
Look at the user's existing calendar events. Find free time slots today or in the next few days to schedule the workflow_steps. Output exact ISO start_time and end_time for each block without overlapping existing events.

Schema: {"title":"string","summary":"string","priority_reasoning":"string","workflow_steps":[{"title":"string","description":"string","course":"string","topic":"string","type":"study|review|practice|break","duration_minutes":number,"reasoning":"string"}],"recommended_time_blocks":[{"title":"string","start_time":"ISO string","end_time":"ISO string","reason":"string"}],"next_action":"string","calendar_events_to_create":[{"title":"string","description":"string","start_time":"ISO string","end_time":"ISO string"}]}

${docsSection}

Calendar events:
${input.calendar}

Preferences:
${JSON.stringify(input.preferences ?? { language: "id-en", sessionMinutes: 60 })}`;
}
