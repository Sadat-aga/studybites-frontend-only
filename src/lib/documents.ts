"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const DOCUMENTS_BUCKET = "documents";

type UploadDocumentOptions = {
  userId?: string;
  file?: File | null;
  existingFolderId?: string;
};

type UploadDocumentResult = {
  studySetId: string;
  folderId: string;
  storagePath: string;
  fileName: string;
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function sanitizeFilename(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

function titleFromFilename(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || "Uploaded Document";
}

export async function uploadDocumentAndProcess({
  userId,
  file,
  existingFolderId,
}: UploadDocumentOptions): Promise<UploadDocumentResult> {
  if (!userId) {
    throw new Error("You must be signed in to upload a document.");
  }

  if (!file) {
    throw new Error("Choose a PDF document before uploading.");
  }

  const supabase = getSupabaseBrowserClient();
  let studySetId: string | null = null;
  let folderId = existingFolderId ?? null;
  let folderTitle = titleFromFilename(file.name);

  if (existingFolderId) {
    const { data: existingFolder, error: folderError } = await supabase
      .from("folders")
      .select("id, study_set_id, title")
      .eq("id", existingFolderId)
      .maybeSingle();

    if (folderError || !existingFolder) {
      throw new Error(folderError?.message ?? "Could not load the destination study set.");
    }

    studySetId = existingFolder.study_set_id;
    folderTitle = existingFolder.title || folderTitle;
  } else {
    const title = titleFromFilename(file.name);
    const { data: studySet, error: studySetError } = await supabase
      .from("study_sets")
      .insert({
        owner_user_id: userId,
        title,
        slug: `${slugify(title)}-${crypto.randomUUID().slice(0, 8)}`,
        source: "upload",
        status: "processing",
      })
      .select("id")
      .single();

    if (studySetError || !studySet) {
      throw new Error(studySetError?.message ?? "Could not create a new study set.");
    }

    studySetId = studySet.id;
  }

  const storagePath = `${userId}/${studySetId}/${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;
  const { error: uploadError } = await supabase.storage.from(DOCUMENTS_BUCKET).upload(storagePath, file, {
    contentType: file.type || "application/pdf",
    upsert: true,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  if (folderId) {
    const { error: updateError } = await supabase
      .from("folders")
      .update({
        source_filename: file.name,
        storage_bucket: DOCUMENTS_BUCKET,
        storage_path: storagePath,
        mime_type: file.type || "application/pdf",
        processing_status: "queued",
        summary_status: "pending",
      })
      .eq("id", folderId);

    if (updateError) {
      throw new Error(updateError.message);
    }
  } else {
    const { data: folder, error: folderInsertError } = await supabase
      .from("folders")
      .insert({
        study_set_id: studySetId,
        owner_user_id: userId,
        title: folderTitle,
        source_filename: file.name,
        storage_bucket: DOCUMENTS_BUCKET,
        storage_path: storagePath,
        mime_type: file.type || "application/pdf",
        processing_status: "queued",
        summary_status: "pending",
      })
      .select("id")
      .single();

    if (folderInsertError || !folder) {
      throw new Error(folderInsertError?.message ?? "Could not create the study folder.");
    }

    folderId = folder.id;
  }

  const { error: invokeError } = await supabase.functions.invoke("process-document", {
    body: {
      folder_id: folderId,
      study_set_id: studySetId,
      bucket: DOCUMENTS_BUCKET,
      path: storagePath,
      source_filename: file.name,
      mime_type: file.type || "application/pdf",
    },
  });

  if (invokeError) {
    throw new Error(invokeError.message);
  }

  if (!studySetId || !folderId) {
    throw new Error("Upload finished without creating the study set metadata.");
  }

  return {
    studySetId,
    folderId,
    storagePath,
    fileName: file.name,
  };
}
