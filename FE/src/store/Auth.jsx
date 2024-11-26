/* eslint-disable react/prop-types */
import { useState, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  const login = (data) => {
    setData(data);
  };

  const logout = () => {
    setData(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ data, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
