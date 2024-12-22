import { supabase } from "./supabase";

/**
 * Downloads a file from private Supabase storage and converts it to a URL that can be used in the browser
 *
 * @param bucket - The storage bucket name
 * @param fileRef - The file reference/path in the bucket
 *
 * @returns URL string or undefined if file doesn't exist or couldn't be downloaded
 */
export const getStorageFileUrl = async (
  bucket: string,
  fileRef: string | null,
) => {
  if (!fileRef) return undefined;

  try {
    const { data: blob } = await supabase.storage
      .from(bucket)
      .download(fileRef);

    if (!blob) return undefined;

    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error downloading file from storage:", error);
    return undefined;
  }
};
