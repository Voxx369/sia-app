import { updateZoomConfig, findById } from "../models/userModel.js";
import { forbidden, notFound } from "../utils/httpError.js";

export const getMyZoomConfig = async (user) => {
  if (user.role !== "teacher") {
    throw forbidden("teacher_only", "Teacher role required to access Zoom config");
  }
  const fullUser = await findById(user.id);
  if (!fullUser) throw notFound("user_not_found");
  
  return {
    zoom_api_key: fullUser.zoom_api_key || "",
    zoom_api_secret: fullUser.zoom_api_secret || "",
    zoom_account_id: fullUser.zoom_account_id || "",
  };
};

export const saveMyZoomConfig = async (user, { zoom_api_key, zoom_api_secret, zoom_account_id }) => {
  if (user.role !== "teacher") {
    throw forbidden("teacher_only", "Teacher role required to save Zoom config");
  }
  return await updateZoomConfig(user.id, { zoom_api_key, zoom_api_secret, zoom_account_id });
};
