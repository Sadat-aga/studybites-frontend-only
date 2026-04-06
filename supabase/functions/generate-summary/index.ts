import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders, createAdminClient, jsonResponse } from "../_shared/admin.ts";
import { AI_MODEL, generateJsonFromAi } from "../_shared/ai-client.ts";

type Payload = {
  study_set_id: string;
  text_content: string;
};

type SummaryDraft = {
  title: string;
  overview: string;
  key_points: string[];
  sections: { title: string; body: string }[];
};

function renderSummaryHtml(summary: SummaryDraft) {
  return [
    `<p>${summary.overview}</p>`,
    ...summary.sections.map((section) => `<h2>${section.title}</h2><p>${section.body}</p>`),
  ].join("\n");
}

function renderSummaryText(summary: SummaryDraft) {
  return [summary.overview, ...summary.sections.map((section) => `${section.title}\n${section.body}`)].join("\n\n");
}

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

    const summary = await generateJsonFromAi<SummaryDraft>({
      schemaDescription:
        'Return JSON with shape {"title":"string","overview":"string","key_points":["string"],"sections":[{"title":"string","body":"string"}]}. Generate a concise but rich study summary with 4-6 sections.',
      prompt: `Study set title: ${folder.title}\n\nSource text:\n${payload.text_content}`,
    });

    const contentHtml = renderSummaryHtml(summary);
    const contentText = renderSummaryText(summary);

    await supabase.from("summaries").delete().eq("folder_id", folder.id);

    const { data: saved, error: saveError } = await supabase
      .from("summaries")
      .insert({
        study_set_id: payload.study_set_id,
        folder_id: folder.id,
        user_id: folder.owner_user_id,
        title: summary.title || `${folder.title} Summary`,
        status: "ready",
        language: "en",
        format: "html",
        content_text: contentText,
        content_html: contentHtml,
        ai_model: AI_MODEL,
        metadata: {
          key_points: summary.key_points ?? [],
          section_count: summary.sections?.length ?? 0,
        },
      })
      .select("*")
      .single();

    if (saveError) {
      throw new Error(saveError.message);
    }

    await supabase
      .from("folders")
      .update({ summary_status: "ready" })
      .eq("id", folder.id);

    return jsonResponse({ summary: saved });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : "Unknown error." }, 500);
  }
});
