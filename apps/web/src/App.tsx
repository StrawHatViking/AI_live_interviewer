import { Toaster } from "sonner";
import ProfileForm from "./Pages/ProfileForm";
import { BrowserRouter, Route, Routes } from "react-router";
import InterviewRoom from "./Pages/InterviewRoom";

export function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProfileForm />} />
          <Route path="/interview/:id" element={<InterviewRoom />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" duration={2000} />
    </div>
  );
}

export default App;
