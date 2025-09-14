import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Stats from './pages/Stats';

function App() {
  const [animes, setAnimes] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('animes');
    if (stored) setAnimes(JSON.parse(stored));
  }, []);

  const handleUpdateAnime = (id, patch) => {
    const updated = animes.map(a => (a.id === id ? { ...a, ...patch } : a));
    setAnimes(updated);
    localStorage.setItem('animes', JSON.stringify(updated));
  };

  return (
    <div className="App">
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

