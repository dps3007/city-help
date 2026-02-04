import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 overflow-x-hidden">
      {/* NAVBAR */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between px-8 py-5 bg-white shadow-sm"
      >
        <h1 className="text-2xl font-bold text-blue-600">CityHelp</h1>
        <div className="space-x-4">
          <Link to="/login" className="text-gray-600 hover:text-blue-600">
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
      </motion.nav>

      {/* HERO */}
      <section className="px-8 py-24 text-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6 }}
          className="text-5xl font-extrabold mb-6"
        >
          Report Civic Issues. <br /> Get Them Resolved Faster.
        </motion.h2>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="text-lg max-w-2xl mx-auto mb-10 opacity-90"
        >
          Garbage, roads, water, electricity — report issues in seconds and track
          them in real-time.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link
              to="/login"
              className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg"
            >
              Report an Issue
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Link
              to="/login"
              className="px-6 py-3 border border-white rounded-lg hover:bg-white hover:text-blue-700"
            >
              Track Complaint
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-8 py-20 bg-white">
        <motion.h3
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          How CityHelp Works
        </motion.h3>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto"
        >
          {[
            "Report Issue with location & photo",
            "Authority auto-assigned",
            "Track, resolve & rate",
          ].map((text, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="p-6 rounded-xl border hover:shadow-lg transition bg-gray-50"
            >
              <h4 className="text-xl font-semibold mb-3">
                Step {i + 1}
              </h4>
              <p className="text-gray-600">{text}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="px-8 py-20 bg-gray-50">
        <motion.h3
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          Why CityHelp?
        </motion.h3>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {[
            "📍 Location-based complaints",
            "🔔 Real-time updates",
            "🏆 Reward points",
            "🚫 Duplicate complaint prevention (geo + time based)",
            "🧑‍💼 Admin dashboards",
            "📊 Transparent lifecycle",
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="p-5 bg-white rounded-lg shadow-sm"
            >
              {feature}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* STATS */}
      <section className="px-8 py-16 bg-white">
        {/* TITLE + INFO TOOLTIP */}
        <div className="flex justify-center items-center gap-2 mb-8">
            <h3 className="text-3xl font-bold text-center">Platform Stats</h3>

            <div className="relative group">
            <span className="cursor-pointer text-gray-400 hover:text-gray-600">
                ℹ️
            </span>

            <div
                className="absolute left-1/2 -translate-x-1/2 mt-2 w-64
                        rounded-lg bg-gray-900 text-white text-xs px-3 py-2
                        opacity-0 group-hover:opacity-100 transition
                        pointer-events-none z-10"
            >
                Statistics shown are based on demo and test data.
            </div>
            </div>
        </div>

        {/* STATS GRID */}
        <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-5xl mx-auto"
        >
            {[
            ["1K+", "Issues Reported"],
            ["92%", "Resolved"],
            ["50+", "Authorities"],
            ["24x7", "Tracking"],
            ].map(([num, label], i) => (
            <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.08 }}
            >
                <h4 className="text-3xl font-bold text-blue-600">{num}</h4>
                <p className="text-gray-600">{label}</p>
            </motion.div>
            ))}
        </motion.div>
        </section>

      {/* CTA */}
      <section className="px-8 py-20 bg-blue-600 text-white text-center">
        <motion.h3
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-4xl font-bold mb-6"
        >
          Make Your City Better. Start Today.
        </motion.h3>

        <motion.div whileHover={{ scale: 1.08 }}>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl"
          >
            Join CityHelp
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="px-8 py-6 bg-gray-900 text-gray-400 text-center">
        © {new Date().getFullYear()} CityHelp • Built for smart cities❤️
      </footer>
    </div>
  );
}
