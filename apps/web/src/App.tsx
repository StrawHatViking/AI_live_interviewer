import { Toaster } from "sonner";
import ProfileForm from "./ProfileForm";
import { BrowserRouter, Route, Routes } from "react-router";
import Interview from "./Interview";

export function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProfileForm />} />
          <Route path="/interview/:id" element={<Interview />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" duration={2000} />
    </div>
  );
}

export default App;
