import { useContext } from "react";
import { AuthContext, defaultAuthContextValue } from "./AuthContext";

export function useAuth() {
  return useContext(AuthContext) ?? defaultAuthContextValue;
}