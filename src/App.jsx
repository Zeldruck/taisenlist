import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Stats from './pages/Stats';

function App() {
  const [animes, setAnimes] = useState([]);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('animes');

    if (stored)
      setAnimes(JSON.parse(stored));

    setIsDark(document.documentElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const handleUpdateAnime = (id, patch) => {
    const updated = animes.map(a => (a.id === id ? { ...a, ...patch } : a));
    setAnimes(updated);
    localStorage.setItem('animes', JSON.stringify(updated));
  };

  const baseBg = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const baseText = isDark ? 'text-gray-100' : 'text-gray-900';

  return (
    <div className={`App min-h-screen ${baseBg} ${baseText}`}>
      <Navbar />

      <div className="p-4">
        <Routes>
          <Route
            path="/"
            element={<Home animes={animes} onUpdate={handleUpdateAnime} />}
          />
          <Route
            path="/stats"
            element={<Stats animes={animes} />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
