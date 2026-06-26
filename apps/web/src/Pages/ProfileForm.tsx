import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useNavigate } from "react-router";
import { API_URL } from "../lib/config";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

function CustomSelect({ value, onChange, options, label }: { value: string, onChange: (v: string) => void, options: {label: string, value: string}[], label: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="space-y-2.5 relative" ref={containerRef}>
      <label className="text-[11px] font-bold tracking-[0.2em] text-stone-400 uppercase">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 rounded-md bg-white border text-stone-800 transition-all duration-300 cursor-pointer font-medium flex items-center justify-between select-none ${isOpen ? 'border-stone-400 ring-4 ring-stone-100' : 'border-stone-200 hover:border-stone-300'}`}
      >
        <span className="text-sm">{selectedOption.label}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-stone-400" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-white rounded-md shadow-lg border border-stone-100 overflow-hidden"
          >
            {options.map((opt) => (
              <div 
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors ${value === opt.value ? 'bg-stone-50 text-stone-900' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'}`}
              >
                {opt.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ProfileForm = () => {
  const [step, setStep] = useState(1);
  
  // Step 1 State
  const [difficulty, setDifficulty] = useState("Medium");
  const [duration, setDuration] = useState("10");
  
  // Step 2 State
  const [jobRole, setJobRole] = useState("");
  const [github, setGithub] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  async function submitFunction(e: React.FormEvent) {
    e.preventDefault();

    if (!github) {
      toast.error("Please provide your GitHub URL");
      return;
    }

    setLoading(true);

    if (!file) {
      toast.error("Please provide your resume in PDF format");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("github", github);
      formData.append("jobRole", jobRole);
      formData.append("difficulty", difficulty);
      formData.append("duration", duration);
      
      formData.append("resume", file);

      const res = await axios.post(`${API_URL}/pre-interview`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data.data;

      toast.success("Profile submitted successfully!");
      navigate(`/interview/${data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-screen bg-[#FAFAFA] flex items-center justify-center p-4 md:p-8 font-sans text-stone-900 selection:bg-stone-200 relative">
      <div className="w-full max-w-lg relative z-10">
        
        {/* Modern Linear-style Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 md:p-10 relative overflow-hidden">
          
          {/* Integrated Minimal Progress Line */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-stone-100">
            <div 
              className="h-full bg-stone-900 transition-all duration-700 ease-in-out" 
              style={{ width: step === 1 ? '50%' : '100%' }} 
            />
          </div>

          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 ease-out fill-mode-both">
              
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight text-stone-900">
                  Configure Session
                </h1>
                <p className="text-sm text-stone-500 font-medium">
                  Set up your practice environment.
                </p>
              </div>

              <div className="space-y-6">
                <CustomSelect
                  label="Difficulty"
                  value={difficulty}
                  onChange={setDifficulty}
                  options={[
                    { label: "Easy (Foundations)", value: "Easy" },
                    { label: "Medium (Problem Solving)", value: "Medium" },
                    { label: "Hard (System Design)", value: "Hard" }
                  ]}
                />

                <CustomSelect
                  label="Duration"
                  value={duration}
                  onChange={setDuration}
                  options={[
                    { label: "10 Minutes", value: "10" },
                    { label: "20 Minutes", value: "20" },
                    { label: "30 Minutes", value: "30" }
                  ]}
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 rounded-md bg-stone-900 text-white hover:bg-stone-800 transition-colors font-semibold tracking-wide text-sm shadow-sm cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={submitFunction} className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 ease-out fill-mode-both">
              
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight text-stone-900">
                  Your Profile
                </h1>
                <p className="text-sm text-stone-500 font-medium">
                  Provide context for the AI interviewer.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2.5">
                  <label className="text-[11px] font-bold tracking-[0.2em] text-stone-400 uppercase">Job Role</label>
                  <input
                    type="text"
                    value={jobRole}
                    placeholder="e.g. Frontend Developer"
                    onChange={(e) => setJobRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-md bg-white border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100 transition-all font-medium"
                  />
                </div>

                <div className="space-y-2.5">
                  <label className="text-[11px] font-bold tracking-[0.2em] text-stone-400 uppercase flex items-center gap-1">
                    GitHub URL <span className="text-stone-900 text-sm leading-none">*</span>
                  </label>
                  <input
                    type="url"
                    value={github}
                    placeholder="https://github.com/..."
                    onChange={(e) => setGithub(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-md bg-white border border-stone-200 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100 transition-all font-medium"
                    required
                  />
                </div>

                <div className="space-y-2.5">
                  <label className="text-[11px] font-bold tracking-[0.2em] text-stone-400 uppercase flex items-center gap-1">
                    Resume (PDF) <span className="text-stone-900 text-sm leading-none">*</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept=".pdf"
                      required
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setFile(file);
                      }}
                      className="w-full px-4 py-2.5 rounded-md bg-white border border-stone-200 text-sm text-stone-600 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200 cursor-pointer transition-all focus:outline-none focus:border-stone-400 focus:ring-4 focus:ring-stone-100"
                    />
                  </div>
                  {file && (
                    <div className="mt-2 text-xs text-stone-600 flex items-center gap-2 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-stone-900"></div>
                      {file.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-md bg-white border border-stone-200 hover:bg-stone-50 hover:border-stone-300 text-stone-600 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-md bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-semibold tracking-wide text-sm shadow-sm transition-colors cursor-pointer flex justify-center items-center"
                >
                  {loading ? (
                    <span className="flex items-center gap-2.5">
                      <div className="w-3.5 h-3.5 border-2 border-stone-400 border-t-white rounded-full animate-spin"></div>
                      Preparing
                    </span>
                  ) : (
                    "Start Interview"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
