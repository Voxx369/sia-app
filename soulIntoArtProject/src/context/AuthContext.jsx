import { createContext, useContext, useEffect, useState } from "react";
import { setAuthToken } from "../api/client";

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem("sia:auth");
    return saved ? JSON.parse(saved) : { user: null, token: null };
  });

  useEffect(() => {
    if (auth?.token) {
      setAuthToken(auth.token);
      localStorage.setItem("sia:auth", JSON.stringify(auth));
    } else {
      setAuthToken(null);
      localStorage.removeItem("sia:auth");
    }
  }, [auth]);

  const setUser = (user, token) => setAuth({ user, token });
  const logout = () => setAuth({ user: null, token: null });

  return (
    <AuthContext.Provider value={{ user: auth.user, token: auth.token, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
