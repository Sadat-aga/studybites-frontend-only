import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, createAdminClient, jsonResponse } from "../_shared/admin.ts";
import { generateJsonFromAi } from "../_shared/ai-client.ts";

type Payload = {
  study_set_id: string;
  text_content: string;
};

type FlashcardDraft = {
  topic: string;
  front_text: string;
  back_text: string;
  source_excerpt?: string;
  explanation?: string;
  mnemonic?: string;
  example?: string;
  difficulty?: string;
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

    const result = await generateJsonFromAi<{ flashcards: FlashcardDraft[] }>({
      schemaDescription:
        'Return JSON with shape {"flashcards":[{"topic":"string","front_text":"string","back_text":"string","source_excerpt":"string","explanation":"string","mnemonic":"string","example":"string","difficulty":"easy|medium|hard"}]}. Generate 12 concise, high-quality study flashcards.',
      prompt: `Study set title: ${folder.title}\n\nSource text:\n${payload.text_content}`,
    });

    await supabase.from("flashcards").delete().eq("folder_id", folder.id);

    const rows = (result.flashcards ?? []).map((card, index) => ({
      study_set_id: payload.study_set_id,
      folder_id: folder.id,
      owner_user_id: folder.owner_user_id,
      topic: card.topic ?? folder.title,
      front_text: card.front_text,
      back_text: card.back_text,
      source_excerpt: card.source_excerpt ?? null,
      explanation: card.explanation ?? null,
      difficulty: (card.difficulty ?? "easy").toLowerCase(),
      metadata: {
        mnemonic: card.mnemonic ?? "",
        example: card.example ?? "",
      },
      sort_order: index,
    }));

    const { data: saved, error: saveError } = await supabase
      .from("flashcards")
      .insert(rows)
      .select("*");

    if (saveError) {
      throw new Error(saveError.message);
    }

    return jsonResponse({ flashcards: saved ?? [] });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Unknown error." }, 500);
  }
});
