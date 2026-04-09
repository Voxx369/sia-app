import { getPublishedContentByKeys } from "../models/siteContentModel.js";
import { badRequest } from "../utils/httpError.js";

const normalizeKeys = (keysInput) => {
  if (Array.isArray(keysInput)) {
    return keysInput.map((k) => String(k).trim()).filter(Boolean);
  }

  if (typeof keysInput === "string") {
    return keysInput
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
  }

  return [];
};

export const getContentBatch = async (keysInput) => {
  const keys = Array.from(new Set(normalizeKeys(keysInput)));
  if (keys.length === 0) {
    throw badRequest("missing_keys", "keys query param is required");
  }

  const rows = await getPublishedContentByKeys(keys);
  const output = Object.fromEntries(keys.map((key) => [key, null]));

  for (const row of rows) {
    output[row.key] = row.payload;
  }

  return output;
};
