import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) document.documentElement.classList.remove("dark");
    else document.documentElement.classList.add("dark");
    setDarkMode(!darkMode);
    localStorage.setItem("darkMode", !darkMode);
  };

  return (
    <nav className="flex items-center gap-2 sticky top-0 z-50 p-4 bg-gradient-to-r from-blue-400 to-blue-500 dark:from-gray-800 dark:to-gray-900 shadow-md dark:shadow-black transition-colors duration-500 overflow-x-auto">      
      {["/", "/stats"].map((path) => (
        <NavLink key={path} to={path}>
          {({ isActive }) => (
            <motion.div
              className="relative px-4 py-2 font-medium text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {path === "/" ? "Home" : "Stats"}
              <motion.span
                className="absolute bottom-0 left-0 h-0.5 bg-white dark:bg-green-400"
                initial={{ width: 0 }}
                animate={{ width: isActive ? "100%" : 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          )}
        </NavLink>

      ))}

      <div className="flex-grow" />

      <motion.a
        href="https://github.com/Zeldruck/zelanime-watch"
        target="_blank"
        rel="noopener noreferrer"
        className="px-2 py-1 rounded flex items-center justify-center"
        title="View on GitHub"
        whileHover={{ scale: 1.2, rotate: 10 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg
          className="w-6 h-6 text-white dark:text-green-400 transition-colors duration-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577
            0-.285-.01-1.04-.015-2.04-3.338.725-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.744.082-.729.082-.729
            1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.304.76-1.604-2.665-.304-5.466-1.334-5.466-5.932
            0-1.31.467-2.382 1.235-3.222-.123-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 013.003-.404c1.02.005
            2.047.138 3.003.404 2.29-1.552 3.296-1.23 3.296-1.23.653 1.653.241 2.874.118 3.176.77.84 1.233 1.912 1.233 3.222
            0 4.61-2.803 5.625-5.475 5.921.43.37.823 1.102.823 2.222 0 1.604-.015 2.896-.015 3.286 0 .32.216.694.825.576C20.565
            21.796 24 17.3 24 12c0-6.627-5.373-12-12-12z"
          />
        </svg>
      </motion.a>

      <motion.button
        onClick={toggleDarkMode}
        className="ml-2 px-3 py-1 rounded text-white dark:text-green-400 transition-colors duration-500"
        title="Toggle Dark / Light mode"
        whileHover={{ scale: 1.2, rotate: 10 }}
        whileTap={{ scale: 0.95 }}
      >
        {darkMode ? "🌙" : "☀️"}
      </motion.button>
    </nav>
  );
}
