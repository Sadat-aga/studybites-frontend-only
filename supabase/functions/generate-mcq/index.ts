import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, createAdminClient, jsonResponse } from "../_shared/admin.ts";
import { generateJsonFromAi } from "../_shared/ai-client.ts";

type Payload = {
  study_set_id: string;
  text_content: string;
};

type McqDraft = {
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  prompt: string;
  choices: { id: string; label: string }[];
  correct_choice_id: string;
  source_excerpt?: string;
  explanation?: string;
  xp_reward?: number;
};

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = (await request.json()) as Payload;
    if (!payload.study_set_id || !payload.text_content?.trim()) {
      return jsonResponse({ error: "study_set_id and text_content are required." }, 400);
    }

    const supabase = createAdminClient();
    const { data: folder, error: folderError } = await supabase
      .from("folders")
      .select("id, owner_user_id, title")
      .eq("study_set_id", payload.study_set_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (folderError || !folder) {
      throw new Error(folderError?.message ?? "No folder found for this study set.");
    }

    const result = await generateJsonFromAi<{ questions: McqDraft[] }>({
      schemaDescription:
        'Return JSON with shape {"questions":[{"topic":"string","difficulty":"easy|medium|hard","prompt":"string","choices":[{"id":"a","label":"string"},{"id":"b","label":"string"},{"id":"c","label":"string"},{"id":"d","label":"string"}],"correct_choice_id":"a|b|c|d","source_excerpt":"string","explanation":"string","xp_reward":10}]}. Generate 20 multiple-choice questions with exactly 4 choices each.',
      prompt: `Study set title: ${folder.title}\n\nSource text:\n${payload.text_content}`,
    });

    await supabase.from("mcq_questions").delete().eq("folder_id", folder.id);

    const rows = (result.questions ?? []).map((question, index) => ({
      study_set_id: payload.study_set_id,
      folder_id: folder.id,
      owner_user_id: folder.owner_user_id,
      topic: question.topic ?? folder.title,
      difficulty: question.difficulty ?? "easy",
      prompt: question.prompt,
      choices: question.choices,
      correct_choice_id: question.correct_choice_id,
      source_excerpt: question.source_excerpt ?? null,
      explanation: question.explanation ?? null,
      xp_reward: question.xp_reward ?? 10,
      sort_order: index,
    }));

    const { data: saved, error: saveError } = await supabase
      .from("mcq_questions")
      .insert(rows)
      .select("*");

    if (saveError) {
      throw new Error(saveError.message);
    }

    return jsonResponse({ mcq_questions: saved ?? [] });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Unknown error." }, 500);
  }
});
