import { motion } from "framer-motion";
import { ArrowRight, Code2, Mic, BarChart } from "lucide-react";
import { useNavigate } from "react-router";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-stone-900 selection:bg-amber-100 overflow-x-hidden">
      {/* Navigation */}
      <nav className="w-full px-6 py-6 md:px-12 flex items-center justify-between z-50 relative">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-6 h-6 rounded-full bg-stone-900 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
          </div>
          <span className="font-bold tracking-tight text-xl">Crazyy</span>
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate('/setup')}
          className="text-xs font-bold uppercase tracking-[0.1em] px-5 py-2.5 rounded-full border border-stone-200 hover:border-stone-900 hover:bg-stone-900 hover:text-white transition-all cursor-pointer"
        >
          Get Started
        </motion.button>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-24 pb-32 px-6 md:px-12 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[800px] h-[400px] bg-gradient-to-b from-stone-200/50 to-transparent blur-[80px] md:blur-[100px] -z-10 rounded-full opacity-50" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-stone-200 shadow-sm mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Live Voice AI</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-[5.5rem] leading-[1.1] font-bold tracking-tighter text-stone-900 max-w-4xl"
        >
          The most realistic <br className="hidden md:block" /> mock interviews.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 text-xl text-stone-500 max-w-2xl font-medium"
        >
          Practice engineering and system design in real-time with <span className="text-stone-900 font-bold">Crazyy</span>. An advanced voice-to-voice AI that pulls context directly from your resume.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
        >
          <button 
            onClick={() => navigate('/setup')}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-stone-900 text-white hover:bg-stone-800 transition-all duration-300 text-sm font-bold tracking-[0.1em] uppercase shadow-[0_10px_30px_rgba(28,25,23,0.15)] hover:shadow-[0_10px_40px_rgba(28,25,23,0.25)] hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
          >
            Start Practice Session <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section className="px-6 md:px-12 py-32 bg-white relative z-10 border-t border-stone-100">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] border border-stone-100 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-stone-900" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-stone-900">Context Aware</h3>
            <p className="text-stone-500 font-medium leading-relaxed">
              Crazyy scans your repositories and resume to ask hyper-relevant questions about your actual experience.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] border border-stone-100 flex items-center justify-center">
              <Mic className="w-5 h-5 text-stone-900" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-stone-900">Real-time Voice</h3>
            <p className="text-stone-500 font-medium leading-relaxed">
              No typing. Speak naturally with ultra-low latency voice streaming built on Google's Gemini Flash Live API.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] border border-stone-100 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-amber-400/10"></div>
              <BarChart className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-stone-900">Deep Analytics</h3>
            <p className="text-stone-500 font-medium leading-relaxed">
              Receive an immediate score out of 100, detailed architectural feedback, and a full session transcript.
            </p>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
