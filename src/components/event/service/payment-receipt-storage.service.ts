import {
  getSupabaseStorage,
  RECEIPTS_BUCKET,
} from "../../../config/supabase-storage";

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

const isAllowedReceiptMime = (mimeType: string) => {
  return Object.prototype.hasOwnProperty.call(EXTENSION_BY_MIME, mimeType);
};

const buildReceiptPath = (
  eventId: string,
  employeeId: string,
  mimeType: string
) => {
  const extension = EXTENSION_BY_MIME[mimeType];
  return `${eventId}/${employeeId}-${Date.now()}.${extension}`;
};

const uploadReceiptObject = async (
  path: string,
  buffer: Buffer,
  mimeType: string
) => {
  const { error } = await getSupabaseStorage()
    .storage.from(RECEIPTS_BUCKET)
    .upload(path, buffer, {
      contentType: mimeType,
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw error;
};

const removeReceiptObjects = async (paths: string[]) => {
  if (!paths.length) return;

  const { error } = await getSupabaseStorage()
    .storage.from(RECEIPTS_BUCKET)
    .remove(paths);

  if (error) throw error;
};

const getReceiptPublicUrl = (path: string) => {
  const { data } = getSupabaseStorage()
    .storage.from(RECEIPTS_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
};

export {
  isAllowedReceiptMime,
  buildReceiptPath,
  uploadReceiptObject,
  removeReceiptObjects,
  getReceiptPublicUrl,
};
