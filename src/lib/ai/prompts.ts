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

export function buildStudyPlanPrompt(input: { documents: string; calendar: string; now: string; preferences?: any }) {
  const hasDocs = input.documents.trim().length > 0;

  const userRequest = input.preferences?.prompt 
    ? `\nUSER REQUEST: "${input.preferences.prompt}"\n`
    : "";

  const docsInstruction = hasDocs
    ? `\n## UPLOADED DOCUMENTS (PRIMARY SOURCE — USE THIS!):\n${input.documents.slice(0, 30000)}\n\nCRITICAL RULES:\n- Your ENTIRE study plan MUST be based on the documents above.\n- Extract real topics, chapter names, concepts, and terminology from the document text.\n- The "course" field must reflect the actual subject from the document, NOT generic courses like "Matematika" or "Fisika" unless the document is actually about those subjects.\n- DO NOT invent or hallucinate topics that are not present in the documents.\n- If the document is a proposal, base the study plan on preparing/reviewing/improving that proposal.\n- If the document is lecture material, base the study plan on studying those specific topics.`
    : `\nNo documents uploaded. Create a general weekly study plan. You may use common university courses.`;

  return `${system}

Task: Create a study workflow for an Indonesian university student.
Current date/time: ${input.now}.
${userRequest}
SCHEDULING RULES:
- Check the student's calendar events below. Find free time slots today or in the next few days.
- Output exact ISO start_time and end_time for each block. Never overlap with existing events.
${docsInstruction}

Calendar events:
${input.calendar}

Schema: {"title":"string","summary":"string","priority_reasoning":"string","workflow_steps":[{"title":"string","description":"string","course":"string","topic":"string","type":"study|review|practice|break","duration_minutes":number,"reasoning":"string"}],"recommended_time_blocks":[{"title":"string","start_time":"ISO string","end_time":"ISO string","reason":"string"}],"next_action":"string","calendar_events_to_create":[{"title":"string","description":"string","start_time":"ISO string","end_time":"ISO string"}]}

Language: ${input.preferences?.language || "id-en"}`;
}
