import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Stats from './pages/Stats';

function App() {
  const [animes, setAnimes] = useState(() => {
    const storedAnimes = localStorage.getItem('animes');
    return storedAnimes ? JSON.parse(storedAnimes) : [];
  });

  const [darkMode, setDarkMode] = useState(() => {
    const storedDark = localStorage.getItem('darkMode');
    if (storedDark === 'true') {
      document.documentElement.classList.add('dark');
      return true
    }
    return false;
  });

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', !darkMode);
  };

  const handleUpdateAnime = (id, patch) => {
    const updated = animes.map(a => (a.id === id ? { ...a, ...patch } : a));
    setAnimes(updated);
    localStorage.setItem('animes', JSON.stringify(updated));
  };

  return (
    <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="p-4 transition-colors duration-500">
        <Routes>
          <Route path="/" element={<Home animes={animes} onUpdate={handleUpdateAnime} />} />
          <Route path="/stats" element={<Stats animes={animes} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
