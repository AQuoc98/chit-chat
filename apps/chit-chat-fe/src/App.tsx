import SignInPage from "./pages/sign-in-page";
import SignUpPage from "./pages/sign-up-page";
import ChatAppPage from "./pages/chat-app-page";
import { Toaster } from "sonner";
import { BrowserRouter, Route, Routes } from "react-router";

function App() {
  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/" element={<ChatAppPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
