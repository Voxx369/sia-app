import { getContentBatch } from "../services/contentService.js";

export const getContent = async (req, res, next) => {
  try {
    const payload = await getContentBatch(req.query.keys);
    res.json(payload);
  } catch (err) {
    next(err);
  }
};
