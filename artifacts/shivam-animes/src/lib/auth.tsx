import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useGetMe, User } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  setToken: (token: string | null) => void;
  deviceId: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A simple device fingerprinting function
const generateFingerprint = async () => {
  const userAgent = navigator.userAgent;
  const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  
  // Try to use a canvas fingerprint
  let canvasFingerprint = "no-canvas";
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("SHIVAM ANIMES PREMIUM", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("SHIVAM ANIMES PREMIUM", 4, 17);
      canvasFingerprint = canvas.toDataURL().slice(-50);
    }
  } catch (e) {
    // Ignore canvas errors
  }
  
  const rawString = `${userAgent}|${screenInfo}|${canvasFingerprint}`;
  
  // Simple hash
  let hash = 0;
  for (let i = 0; i < rawString.length; i++) {
    const char = rawString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return `dev_${Math.abs(hash).toString(16)}`;
};

// Monkey patch customFetch to include token
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const token = localStorage.getItem("anime_token");
  
  const modifiedInit = { ...init };
  if (token) {
    modifiedInit.headers = {
      ...modifiedInit.headers,
      "Authorization": `Bearer ${token}`
    };
  }
  
  // Apply the same logic to customFetch internally if needed, but since it uses fetch, 
  // patching window.fetch might be enough.
  return originalFetch(input, modifiedInit);
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem("anime_token"));
  const [deviceId, setDeviceId] = useState<string>("dev_unknown");

  useEffect(() => {
    generateFingerprint().then(setDeviceId);
  }, []);

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("anime_token", newToken);
    } else {
      localStorage.removeItem("anime_token");
    }
    setTokenState(newToken);
  };

  const { data: user, isLoading } = useGetMe({
    query: {
      enabled: !!token,
      retry: false
    }
  });

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading: isLoading && !!token, token, setToken, deviceId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
