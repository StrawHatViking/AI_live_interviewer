import { useState } from "react";
import { toast } from "sonner";
import "../styles/globals.css";
import axios from "axios";
import { useNavigate } from "react-router";

const ProfileForm = () => {
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  async function submitFunction(e: React.FormEvent) {
    e.preventDefault();

    if (!github) {
      toast.error("Please provide the details");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/pre-interview",
        {
          linkedin,
          github,
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      const data = res.data.data;

      toast.success("Profile submitted successfully!");
      navigate(`/interview/${data.id}`);
      setGithub("");
      setLinkedin("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <form
        onSubmit={submitFunction}
        className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl space-y-6"
      >
        <h1 className="text-2xl font-semibold text-white text-center">
          AI Interviewer
        </h1>
        <p className="text-sm text-white/60 text-center -mt-4">
          Enter your profiles to get started
        </p>

        <div className="space-y-2">
          <label className="text-sm text-white/80 block">LinkedIn URL</label>
          <input
            type="url"
            value={linkedin}
            placeholder="https://linkedin.com/in/... (optional)"
            onChange={(e) => setLinkedin(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-white/80 block">GitHub URL</label>
          <input
            type="url"
            value={github}
            placeholder="https://github.com/..."
            onChange={(e) => setGithub(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-medium transition cursor-pointer"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default ProfileForm;
