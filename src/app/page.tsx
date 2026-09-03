"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight, BarChart3, Clock, CheckCircle, Smartphone, Building, ShieldCheck, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-primary selection:text-slate-800">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass py-3' : 'py-5 bg-transparent'}`}>
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
          <div className="text-xl font-bold flex items-center gap-2">
            <Building className="text-primary w-6 h-6" />
            <span>Fix My Hostel</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-800">
            <a href="#features" className="hover:text-slate-800 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-800 transition-colors">How it Works</a>
            <a href="#stats" className="hover:text-slate-800 transition-colors">Insights</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/student" className="text-sm font-medium hover:text-primary transition-colors">
              Student Login
            </Link>
            <Link href="/auth/admin" className="px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:scale-105 transition-transform">
              Admin Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
        <div className="absolute inset-0 bg-animated-gradient opacity-20 -z-10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -z-10" />

        <div className="container px-6 max-w-5xl mx-auto text-center z-10">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-slate-100 text-xs font-medium text-primary mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              The Next Generation of Facility Management
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
              Modern Complaint Management for <span className="text-gradient">Smart Hostels.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="textlg md:text-xl text-slate-800 mb-10 max-w-2xl mx-auto leading-relaxed">
              Automate facility ticketing with our smart priority algorithm, realtime analytics, and community-driven voting system. Say goodbye to messy WhatsApp groups.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/auth/student" className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-slate-800 font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-105 shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/admin" className="w-full sm:w-auto px-8 py-4 rounded-full glass text-slate-800 font-semibold  transition-all">
                Access Dashboard
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 relative border-t border-white/5">
        <div className="container px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Precision Engineering for <span className="text-slate-800">Hostels</span></h2>
            <p className="text-slate-800">Built to handle scale across multiple blocks with zero downtime.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: "Smart Priority Algorithm", desc: "Tickets are auto-prioritized based on severity, pending days, and community votes." },
              { icon: BarChart3, title: "Real-Time Analytics", desc: "Stunning visualizations of ticket trends, category breakdowns, and resolution times." },
              { icon: Building, title: "Multi-Hostel Support", desc: "Manage multiple blocks and floors seamlessly from a single unified admin interface." },
              { icon: CheckCircle, title: "Community Voting", desc: "Students can upvote common issues, automatically escalating them to administrators." },
              { icon: HelpCircle, title: "FixBot Assistant", desc: "Rule-based chatbot ready to assist students with FAQs and tracking procedures immediately." },
              { icon: Smartphone, title: "Mobile Optimized", desc: "Every view, chart, and interaction is fully responsive and feels native on mobile devices." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-white shadow-sm border border-white/5  transition-colors group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-24 border-t border-white/5 bg-gradient-to-b from-black to-blue-900/10">
        <div className="container px-6 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { stat: "10,000+", label: "Complaints Resolved" },
              { stat: "95%", label: "Faster Resolution Time" },
              { stat: "50+", label: "Hostels Onboarded globally" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="text-center p-10 rounded-3xl glass-card flex flex-col items-center justify-center"
              >
                <div className="text-5xl font-extrabold text-slate-900 mb-2">
                  {item.stat}
                </div>
                <div className="text-slate-800 font-medium">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-32 bg-slate-50 relative">
        <div className="container px-6 max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">A Frictionless <span className="text-primary text-gradient">Workflow</span></h2>
            <p className="text-slate-800 max-w-2xl mx-auto">From reporting a broken tap to full resolution, the pipeline is transparent and instantaneous.</p>
          </div>

          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-4 md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:to-transparent">
            {[
              { step: "01", title: "Raise a Complaint", desc: "Students provide room details, issue category, and severity in a concise form." },
              { step: "02", title: "Auto Prioritization", desc: "The algorithm immediately scores the ticket based on community votes and urgency." },
              { step: "03", title: "Admin Assignment", desc: "Administrators view the highly-ranked tickets on their visually rich dashboard." },
              { step: "04", title: "Resolution Tracking", desc: "Real-time updates are sent back to the student, closing the feedback loop seamlessly." }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`flex items-center justify-between md:justify-normal w-full group ${i % 2 === 0 ? 'md:flex-row-reverse left-timeline' : 'right-timeline'}`}
              >
                <div className="order-1 w-full md:w-5/12"></div>
                <div className="z-20 flex items-center justify-center order-1 bg-slate-50 shadow-xl w-10 h-10 rounded-full border-2 border-primary group-hover:scale-125 transition-transform">
                  <div className="bg-primary mx-auto rounded-full w-2 h-2"></div>
                </div>
                <div className="order-1 glass rounded-2xl p-6 md:p-8 w-full md:w-5/12 ml-4 md:ml-0 md:group-odd:text-right hover:bg-white shadow-sm transition-colors">
                  <h3 className="mb-2 font-bold text-primary text-sm tracking-widest">STEP {step.step}</h3>
                  <h4 className="mb-2 font-bold text-xl md:text-2xl">{step.title}</h4>
                  <p className="text-sm leading-snug tracking-wide text-slate-800 text-opacity-100">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50 py-12">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Building className="w-5 h-5 text-primary" />
            <span>Fix My Hostel</span>
          </div>
          <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Fix My Hostel.
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-slate-800 hover:text-slate-800 transition-colors">Twitter</a>
            <a href="#" className="text-slate-800 hover:text-slate-800 transition-colors">GitHub</a>
            <a href="#" className="text-slate-800 hover:text-slate-800 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
