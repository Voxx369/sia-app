import { login, signup } from "../services/authService.js";

export const postLogin = async (req, res, next) => {
  try {
    const { user, token } = await login(req.body || {});
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
};

export const postSignup = async (req, res, next) => {
  try {
    const { user, token } = await signup(req.body || {});
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};
