import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { Buffer } from "node:buffer";
import pdfParse from "npm:pdf-parse@1.1.1";
import { createClient } from "npm:@supabase/supabase-js@2";

type ProcessDocumentPayload = {
  folder_id: string;
  study_set_id: string;
  bucket: string;
  path: string;
  source_filename?: string;
  mime_type?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function htmlFromText(text: string) {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${block.replace(/[&<>]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char] ?? char))}</p>`)
    .join("\n");
}

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = (await request.json()) as ProcessDocumentPayload;
    if (!payload.folder_id || !payload.study_set_id || !payload.bucket || !payload.path) {
      return new Response(JSON.stringify({ error: "Missing required payload fields." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Supabase environment variables are missing." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    await supabase
      .from("folders")
      .update({ processing_status: "processing" })
      .eq("id", payload.folder_id);

    const { data: fileData, error: downloadError } = await supabase.storage
      .from(payload.bucket)
      .download(payload.path);

    if (downloadError || !fileData) {
      throw new Error(downloadError?.message ?? "Could not download the uploaded PDF.");
    }

    const fileBuffer = Buffer.from(await fileData.arrayBuffer());
    const parsed = await pdfParse(fileBuffer);
    const extractedText = (parsed.text ?? "").trim();
    const processedHtml = htmlFromText(extractedText);
    const pageCount = Number(parsed.numpages ?? 0);

    const { error: folderUpdateError } = await supabase
      .from("folders")
      .update({
        source_filename: payload.source_filename,
        storage_bucket: payload.bucket,
        storage_path: payload.path,
        mime_type: payload.mime_type ?? "application/pdf",
        page_count: pageCount,
        extracted_text: extractedText,
        processed_html: processedHtml,
        processing_status: "ready",
        summary_status: extractedText ? "ready" : "idle",
        metadata: {
          parsed_pages: pageCount,
          parsed_chars: extractedText.length,
          parsed_via: "pdf-parse",
        },
      })
      .eq("id", payload.folder_id);

    if (folderUpdateError) {
      throw new Error(folderUpdateError.message);
    }

    const { error: studySetUpdateError } = await supabase
      .from("study_sets")
      .update({
        source: "upload",
        status: extractedText ? "ready" : "draft",
        total_pages: pageCount,
      })
      .eq("id", payload.study_set_id);

    if (studySetUpdateError) {
      throw new Error(studySetUpdateError.message);
    }

    return new Response(
      JSON.stringify({
        folder_id: payload.folder_id,
        study_set_id: payload.study_set_id,
        page_count: pageCount,
        text_length: extractedText.length,
        processing_status: "ready",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown processing error.";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
