import { BrowserRouter, Route, Routes } from "react-router";
import SignInPage from "./pages/sign-in-page";
import ChatAppPage from "./pages/chat-app-page";
import { Toaster } from "sonner";
import SignUpPage from "./pages/sign-up-page";
import ProtectedRoute from "./components/auth/protected-route";
import { useThemeStore } from "./stores/use-theme-store";
import { useEffect } from "react";
import { useAuthStore } from "./stores/use-auth-store";
import { useSocketStore } from "./stores/use-socket-store";

function App() {
  const { isDark, setTheme } = useThemeStore();
  const { accessToken } = useAuthStore();
  const { connectSocket, disconnectSocket } = useSocketStore();

  useEffect(() => {
    setTheme(isDark);
  }, [isDark]);

  useEffect(() => {
    if (accessToken) {
      connectSocket();
    }

    return () => disconnectSocket();
  }, [accessToken]);

  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          {/* public routes */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* protectect routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<ChatAppPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
