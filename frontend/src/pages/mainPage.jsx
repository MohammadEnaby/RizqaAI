import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRobot, FaSearch, FaPaperPlane, FaArrowRight, FaLeaf } from 'react-icons/fa';


const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const MainPage = () => {
  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: "#071825", fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');

        .sora { font-family: 'Sora', sans-serif; }

        /* shimmer on gradient text */
        @keyframes shimmer {
          to { background-position: 200% center; }
        }
        .grad-text {
          background: linear-gradient(135deg, #34e89e 0%, #1aad72 60%, #34e89e 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        /* pulsing badge dot */
        @keyframes badgePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.65); }
        }
        .badge-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #34e89e;
          animation: badgePulse 1.8s infinite;
          display: inline-block;
        }

        /* stat divider */
        .stat-item { position: relative; }
        .stat-item:not(:last-child)::after {
          content: '';
          position: absolute; right: 0; top: 15%; bottom: 15%;
          width: 1px;
          background: rgba(52,232,158,0.18);
        }

        /* step connector line */
        .steps-grid { position: relative; }
        .steps-grid::before {
          content: '';
          position: absolute;
          top: 74px;
          left: calc(16.66% + 12px);
          right: calc(16.66% + 12px);
          height: 1px;
          background: linear-gradient(90deg,
            rgba(52,232,158,0.3),
            rgba(52,232,158,0.1),
            rgba(52,232,158,0.3)
          );
          pointer-events: none;
          z-index: 1;
        }

        /* subtle bg grid */
        .grid-overlay {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(52,232,158,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52,232,158,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* feature item left-slide on hover */
        .feature-item { transition: transform 0.25s, border-color 0.25s, background 0.25s; }
        .feature-item:hover {
          transform: translateX(5px);
          border-color: rgba(52,232,158,0.3) !important;
          background: rgba(15,52,67,0.6) !important;
        }

        /* step card hover */
        .step-card { transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s, background 0.3s; }
        .step-card:hover {
          transform: translateY(-7px);
          border-color: rgba(52,232,158,0.32) !important;
          background: rgba(15,52,67,0.75) !important;
          box-shadow: 0 28px 55px -12px rgba(52,232,158,0.14);
        }

        @media (max-width: 768px) {
          .steps-grid::before { display: none; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .features-layout { grid-template-columns: 1fr !important; gap: 40px !important; }
          .footer-inner { grid-template-columns: 1fr !important; gap: 32px !important; }
          .footer-bottom { flex-direction: column !important; align-items: flex-start !important; }
          .hero-stats { gap: 0 !important; }
          .stat-item { padding: 16px 20px !important; }
        }
      `}</style>

      {/* ── Background blobs ── */}
      <div className="grid-overlay" />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute", borderRadius: "50%", filter: "blur(110px)",
          width: "55vw", height: "55vw", top: "-18vw", left: "-14vw",
          background: "radial-gradient(circle, rgba(52,232,158,0.11) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", borderRadius: "50%", filter: "blur(110px)",
          width: "45vw", height: "45vw", bottom: "-14vw", right: "-10vw",
          background: "radial-gradient(circle, rgba(26,173,114,0.09) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", borderRadius: "50%", filter: "blur(110px)",
          width: "30vw", height: "30vw", top: "40vh", left: "50%",
          background: "radial-gradient(circle, rgba(52,232,158,0.05) 0%, transparent 70%)",
        }} />
      </div>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(7,24,37,0.78)",
        backdropFilter: "blur(18px) saturate(1.4)",
        borderBottom: "1px solid rgba(52,232,158,0.1)",
      }}>
        <div style={{
          maxWidth: 1160, margin: "0 auto", padding: "0 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 68,
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, #34e89e, #1aad72)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#071825", boxShadow: "0 4px 18px rgba(52,232,158,0.25)",
            }}>
              <FaLeaf size={18} />
            </div>
            <span className="sora" style={{ fontSize: 22, fontWeight: 800, color: "#34e89e", letterSpacing: "-0.5px" }}>
              Rizqa<span style={{ color: "#e2f8f0" }}>AI</span>
            </span>
          </Link>

          {/* Nav actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              to="/login"
              style={{
                padding: "9px 22px", borderRadius: 50, fontSize: 14, fontWeight: 600,
                border: "1px solid rgba(52,232,158,0.25)", color: "#34e89e",
                background: "rgba(52,232,158,0.06)", textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(52,232,158,0.12)";
                e.currentTarget.style.borderColor = "rgba(52,232,158,0.4)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(52,232,158,0.06)";
                e.currentTarget.style.borderColor = "rgba(52,232,158,0.25)";
              }}
            >
              Log in
            </Link>
            <Link
              to="/signup"
              style={{
                padding: "9px 22px", borderRadius: 50, fontSize: 14, fontWeight: 600,
                background: "linear-gradient(135deg, #34e89e, #1aad72)", color: "#071825",
                border: "none", textDecoration: "none",
                boxShadow: "0 4px 20px rgba(52,232,158,0.28)", transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(52,232,158,0.4)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(52,232,158,0.28)";
              }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header style={{ position: "relative", zIndex: 10, paddingTop: 160, paddingBottom: 110, textAlign: "center" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 32px" }}>

          {/* Badge */}
          <motion.div
            initial="hidden" animate="visible"
            variants={fadeUp} transition={{ duration: 0.6 }}
            style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}
          >
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 18px", borderRadius: 50,
              background: "rgba(52,232,158,0.08)", border: "1px solid rgba(52,232,158,0.22)",
              fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
              color: "#34e89e",
            }}>
              <span className="badge-dot" />
              Intelligent Job Discovery
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="sora"
            initial="hidden" animate="visible"
            variants={fadeUp} transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: "clamp(44px, 6vw, 78px)",
              fontWeight: 800, lineHeight: 1.1, letterSpacing: "-2px",
              color: "#e2f8f0", marginBottom: 24,
            }}
          >
            Find Your Next Job<br />
            <span className="grad-text">with AI Precision</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial="hidden" animate="visible"
            variants={fadeUp} transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: 18, lineHeight: 1.75, color: "rgba(226,248,240,0.6)",
              maxWidth: 560, margin: "0 auto 40px",
            }}
          >
            RizqaAI scans social media, extracts real job listings from unstructured posts,
            and connects you to opportunities through natural conversation — no complex forms,
            no wasted time.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial="hidden" animate="visible"
            variants={fadeUp} transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}
          >
            <Link
              to="/signup"
              className="sora"
              style={{
                padding: "16px 36px", borderRadius: 14, fontSize: 16, fontWeight: 700,
                background: "linear-gradient(135deg, #34e89e, #1aad72)", color: "#071825",
                border: "none", textDecoration: "none",
                display: "flex", alignItems: "center", gap: 8,
                boxShadow: "0 16px 40px -8px rgba(52,232,158,0.4)", transition: "all 0.25s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 24px 50px -8px rgba(52,232,158,0.52)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 16px 40px -8px rgba(52,232,158,0.4)";
              }}
            >
              Start for Free <FaArrowRight size={14} />
            </Link>
            <Link
              to="/login"
              className="sora"
              style={{
                padding: "16px 36px", borderRadius: 14, fontSize: 16, fontWeight: 600,
                background: "rgba(15,52,67,0.6)", color: "#e2f8f0",
                border: "1px solid rgba(52,232,158,0.18)", textDecoration: "none",
                backdropFilter: "blur(8px)", transition: "all 0.25s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(15,52,67,0.9)";
                e.currentTarget.style.borderColor = "rgba(52,232,158,0.32)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(15,52,67,0.6)";
                e.currentTarget.style.borderColor = "rgba(52,232,158,0.18)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Access Dashboard
            </Link>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial="hidden" animate="visible"
            variants={fadeUp} transition={{ duration: 0.6, delay: 0.45 }}
            className="hero-stats"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 60, flexWrap: "wrap" }}
          >
            {[
              { num: "10K+", label: "Jobs Collected" },
              { num: "98%",  label: "Match Accuracy" },
              { num: "24/7", label: "Automated Scanning" },
            ].map((s, i) => (
              <div key={i} className="stat-item" style={{ padding: "20px 44px", textAlign: "center" }}>
                <div className="sora" style={{ fontSize: 30, fontWeight: 800, color: "#34e89e", lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: 13, color: "rgba(226,248,240,0.5)", marginTop: 5 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </header>

      {/* ── HOW IT WORKS ── */}
      <section style={{
        position: "relative", zIndex: 10, padding: "100px 0",
        background: "linear-gradient(180deg, transparent 0%, rgba(15,52,67,0.25) 50%, transparent 100%)",
        borderTop: "1px solid rgba(52,232,158,0.08)",
        borderBottom: "1px solid rgba(52,232,158,0.08)",
      }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 32px" }}>
          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} transition={{ duration: 0.5 }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#34e89e", marginBottom: 14 }}>
                How it works
              </div>
              <h2 className="sora" style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-1px", color: "#e2f8f0", marginBottom: 16 }}>
                Three steps to your next job
              </h2>
              <p style={{ fontSize: 17, color: "rgba(226,248,240,0.55)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
                Our intelligent pipeline eliminates the friction of traditional job hunting —
                so you focus on interviews, not searching.
              </p>
            </motion.div>
          </div>

          {/* Cards */}
          <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {[
              {
                icon: <FaSearch size={24} />,
                num: "Step 01",
                title: "Smart Discovery",
                desc: "Our AI continuously scans Facebook groups and social platforms, extracting real job posts from unstructured text using advanced NLP pipelines.",
                delay: 0.1,
              },
              {
                icon: <FaRobot size={24} />,
                num: "Step 02",
                title: "AI Analysis",
                desc: "Each post is analyzed, categorized, and structured into clean job records stored in a centralized cloud database in real time.",
                delay: 0.2,
              },
              {
                icon: <FaPaperPlane size={24} />,
                num: "Step 03",
                title: "Conversational Match",
                desc: "Chat with RizqaAI in plain language. It understands your intent, matches semantically, and surfaces personalized opportunities instantly.",
                delay: 0.3,
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="step-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: step.delay }}
                style={{
                  padding: "36px 30px", borderRadius: 24,
                  background: "rgba(15,52,67,0.5)",
                  border: "1px solid rgba(52,232,158,0.13)",
                  backdropFilter: "blur(12px)",
                  position: "relative",
                }}
              >
                {/* Step badge */}
                <div style={{
                  position: "absolute", top: -14, left: 30,
                  background: "linear-gradient(135deg, #34e89e, #1aad72)", color: "#071825",
                  fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
                  padding: "4px 13px", borderRadius: 50,
                  fontFamily: "'Sora', sans-serif",
                }}>
                  {step.num}
                </div>
                {/* Icon */}
                <div style={{
                  width: 60, height: 60, borderRadius: 18, marginBottom: 24,
                  background: "rgba(52,232,158,0.1)", border: "1px solid rgba(52,232,158,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#34e89e", position: "relative", zIndex: 2,
                }}>
                  {step.icon}
                </div>
                <h3 className="sora" style={{ fontSize: 20, fontWeight: 700, color: "#e2f8f0", marginBottom: 12, letterSpacing: "-0.3px" }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(226,248,240,0.55)" }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES + CHAT MOCKUP ── */}
      <section style={{ position: "relative", zIndex: 10, padding: "100px 0" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 32px" }}>
          <div
            className="features-layout"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}
          >
            {/* Left: feature list */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#34e89e", marginBottom: 14 }}>
                Platform
              </div>
              <h2 className="sora" style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, letterSpacing: "-1px", color: "#e2f8f0", marginBottom: 16 }}>
                Built for real people,<br />not power users
              </h2>
              <p style={{ fontSize: 17, color: "rgba(226,248,240,0.55)", lineHeight: 1.7, marginBottom: 32 }}>
                No complicated filters. No tech know-how required. Just describe what you're looking for and let the AI do the rest.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { icon: "⚡", title: "Natural Language Search", desc: "Search jobs the same way you'd ask a friend — in your own words, any phrasing." },
                  { icon: "🗂️", title: "Automated ETL Pipeline", desc: "Raw social media posts are transformed into clean, structured job records automatically." },
                  { icon: "🛡️", title: "Admin Control Center", desc: "Full dashboard to schedule pipelines, monitor logs, and manage platform operations." },
                  { icon: "☁️", title: "Cloud-Native Architecture", desc: "Built on Firebase with real-time sync, scalable to thousands of users and data sources." },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="feature-item"
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 16,
                      padding: "18px 20px", borderRadius: 16,
                      border: "1px solid rgba(52,232,158,0.1)",
                      background: "rgba(15,52,67,0.3)", cursor: "default",
                    }}
                  >
                    <div style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{f.icon}</div>
                    <div>
                      <div className="sora" style={{ fontSize: 15, fontWeight: 700, color: "#e2f8f0", marginBottom: 4 }}>{f.title}</div>
                      <div style={{ fontSize: 14, color: "rgba(226,248,240,0.5)", lineHeight: 1.6 }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Chat mockup */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              style={{
                background: "rgba(15,52,67,0.55)",
                border: "1px solid rgba(52,232,158,0.15)",
                borderRadius: 24, overflow: "hidden",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Chat top bar */}
              <div style={{
                background: "rgba(7,24,37,0.7)",
                borderBottom: "1px solid rgba(52,232,158,0.1)",
                padding: "16px 20px",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: "linear-gradient(135deg, #34e89e, #1aad72)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#071825", fontWeight: 800, fontSize: 15,
                  fontFamily: "'Sora', sans-serif",
                }}>R</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e2f8f0" }}>RizqaAI Assistant</div>
                  <div style={{ fontSize: 12, color: "#34e89e", display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34e89e", display: "inline-block" }} />
                    Online — Ready to help
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                {/* User message */}
                <div style={{ alignSelf: "flex-end", maxWidth: "78%" }}>
                  <div style={{
                    padding: "11px 16px", borderRadius: "18px 18px 4px 18px",
                    background: "linear-gradient(135deg, #34e89e, #1aad72)",
                    color: "#071825", fontWeight: 600, fontSize: 14, lineHeight: 1.5,
                  }}>
                    أدور شغلة كاشير أو نادل قريب مني
                  </div>
                </div>

                {/* Bot message + job cards */}
                <div style={{ alignSelf: "flex-start", maxWidth: "88%" }}>
                  <div style={{
                    padding: "11px 16px", borderRadius: "18px 18px 18px 4px",
                    background: "rgba(15,52,67,0.8)",
                    border: "1px solid rgba(52,232,158,0.12)",
                    color: "rgba(226,248,240,0.85)", fontSize: 14, lineHeight: 1.5,
                    marginBottom: 10,
                  }}>
                    تمام! لقيت لك 3 فرص قريبة منك 📍
                  </div>
                  {[
                    { icon: "🏪", title: "كاشير — سوبرماركت الأندلس", meta: "القدس · دوام كامل · نُشر اليوم" },
                    { icon: "🍽️", title: "نادل — مطعم الرافدين",      meta: "رام الله · دوام جزئي · نُشر أمس" },
                  ].map((job, i) => (
                    <div key={i} style={{
                      background: "rgba(7,24,37,0.7)",
                      border: "1px solid rgba(52,232,158,0.14)",
                      borderRadius: 12, padding: "12px 14px",
                      display: "flex", alignItems: "flex-start", gap: 12,
                      marginBottom: i === 0 ? 8 : 0,
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                        background: "rgba(52,232,158,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                      }}>{job.icon}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#e2f8f0" }}>{job.title}</div>
                        <div style={{ fontSize: 12, color: "rgba(226,248,240,0.45)", marginTop: 2 }}>{job.meta}</div>
                        <span style={{
                          display: "inline-block", marginTop: 6,
                          fontSize: 11, fontWeight: 600,
                          padding: "3px 10px", borderRadius: 50,
                          background: "rgba(52,232,158,0.1)", color: "#34e89e",
                          border: "1px solid rgba(52,232,158,0.2)",
                        }}>✓ متاحة الآن</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Second user message */}
                <div style={{ alignSelf: "flex-end", maxWidth: "78%" }}>
                  <div style={{
                    padding: "11px 16px", borderRadius: "18px 18px 4px 18px",
                    background: "linear-gradient(135deg, #34e89e, #1aad72)",
                    color: "#071825", fontWeight: 600, fontSize: 14, lineHeight: 1.5,
                  }}>
                    ممتاز! أبي أشوف التفاصيل
                  </div>
                </div>
              </div>

              {/* Input row */}
              <div style={{
                borderTop: "1px solid rgba(52,232,158,0.1)",
                padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{
                  flex: 1, background: "rgba(7,24,37,0.6)",
                  border: "1px solid rgba(52,232,158,0.12)",
                  borderRadius: 50, padding: "10px 18px",
                  fontSize: 13, color: "rgba(226,248,240,0.35)",
                }}>
                  اكتب رسالتك هنا...
                </div>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "linear-gradient(135deg, #34e89e, #1aad72)", color: "#071825",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer",
                }}>
                  <FaPaperPlane size={13} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        position: "relative", zIndex: 10,
        borderTop: "1px solid rgba(52,232,158,0.1)",
        background: "rgba(7,24,37,0.88)",
        padding: "60px 0 36px",
      }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 32px" }}>
          <div
            className="footer-inner"
            style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 48, marginBottom: 48 }}
          >
            {/* Brand */}
            <div>
              <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "linear-gradient(135deg, #34e89e, #1aad72)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#071825",
                }}>
                  <FaLeaf size={14} />
                </div>
                <span className="sora" style={{ fontSize: 19, fontWeight: 800, color: "#34e89e" }}>
                  Rizqa<span style={{ color: "#e2f8f0" }}>AI</span>
                </span>
              </Link>
              <p style={{ fontSize: 14, color: "rgba(226,248,240,0.45)", marginTop: 14, maxWidth: 280, lineHeight: 1.7 }}>
                Transforming informal social-media job posts into an intelligent
                employment-search experience powered by AI and natural language.
              </p>
            </div>

            {/* Platform links */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(226,248,240,0.3)", marginBottom: 18, fontFamily: "'Sora', sans-serif" }}>
                Platform
              </div>
              {[
                { label: "Job Search Chat", to: "/chat" },
                { label: "Admin Dashboard", to: "/admin" },
                { label: "Pipeline Monitor", to: "/admin/pipelines" },
                { label: "Analytics",        to: "/admin/analytics" },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: "block", fontSize: 14,
                    color: "rgba(226,248,240,0.55)",
                    textDecoration: "none", marginBottom: 10,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#34e89e"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(226,248,240,0.55)"}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Project links */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(226,248,240,0.3)", marginBottom: 18, fontFamily: "'Sora', sans-serif" }}>
                Project
              </div>
              {[
                { label: "About RizqaAI",   to: "/about" },
                { label: "Architecture",     to: "/architecture" },
                { label: "Azrieli College",  to: "/college" },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: "block", fontSize: 14,
                    color: "rgba(226,248,240,0.55)",
                    textDecoration: "none", marginBottom: 10,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = "#34e89e"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(226,248,240,0.55)"}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(52,232,158,0.08)", marginBottom: 28 }} />

          {/* Bottom row */}
          <div
            className="footer-bottom"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}
          >
            <div style={{ fontSize: 13, color: "rgba(226,248,240,0.25)" }}>
              © {new Date().getFullYear()} RizqaAI. All rights reserved.
            </div>
            <div style={{ fontSize: 13, color: "rgba(226,248,240,0.4)" }}>
              Crafted by{" "}
              <span style={{ color: "#34e89e", fontWeight: 700 }}>Nazieh Sayegh</span>
              {" & "}
              <span style={{ color: "#34e89e", fontWeight: 700 }}>Mohammad Enaby</span>
              {" · Azrieli College of Engineering"}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
