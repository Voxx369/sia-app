import { getMyZoomConfig, saveMyZoomConfig } from "../services/zoomService.js";

export const getZoomConfig = async (req, res, next) => {
  try {
    const config = await getMyZoomConfig(req.user);
    res.json(config);
  } catch (err) {
    next(err);
  }
};

export const putZoomConfig = async (req, res, next) => {
  try {
    const result = await saveMyZoomConfig(req.user, req.body || {});
    res.json(result);
  } catch (err) {
    next(err);
  }
};
