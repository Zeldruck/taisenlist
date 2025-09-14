import { useState, useEffect, useRef } from "react";
import AnimeCard from '../components/AnimeCard';
import AnimeListItem from '../components/AnimeListItem';
import AnimeDetailsModal from '../components/AnimeDetailsModal';

export default function Home() {
  const [animes, setAnimes] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [view, setView] = useState('grid');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchLocal, setSearchLocal] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('none');
  const debounceRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('animes');
    if (stored) setAnimes(JSON.parse(stored));
  }, []);

  const handleUpdateAnime = (id, patch) => {
    const updated = animes.map(a => a.id === id ? { ...a, ...patch } : a);
    setAnimes(updated);
    localStorage.setItem('animes', JSON.stringify(updated));
  };

  const handleToggleWatched = (id) => {
    const anime = animes.find(a => a.id === id);
    if (!anime) return;
    handleUpdateAnime(id, { watched: !anime.watched });
  };

  const handleDeleteAnime = (id) => {
    const updated = animes.filter(a => a.id !== id);
    setAnimes(updated);
    localStorage.setItem('animes', JSON.stringify(updated));
  };


  const handleOpenDetails = (anime) => setSelectedAnime(anime);
  const handleCloseDetails = () => setSelectedAnime(null);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(animes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'animes.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = JSON.parse(ev.target.result);
      setAnimes(data);
      localStorage.setItem('animes', JSON.stringify(data));
    };
    reader.readAsText(file);
  };

  const fetchSuggestions = async (searchTerm) => {
    if (!searchTerm) return setSuggestions([]);
    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(searchTerm)}&limit=5`);
      const data = await res.json();
      setSuggestions(data.data || []);
    } catch (err) {
      console.error(err);
      setSuggestions([]);
    }
  };

  const addAnimeFromAPI = async (anime) => {
    if (!anime) return;
    const newAnime = {
      id: anime.mal_id,
      title: anime.title,
      image: anime.images.jpg.image_url,
      description: anime.synopsis,
      year: anime.aired?.from ? new Date(anime.aired.from).getFullYear() : undefined,
      tags: [
        ...(anime.genres?.map(g => g.name) || []),
        ...(anime.themes?.map(t => t.name) || [])
      ],
      watched: false,
      rating: 0,
    };
    setAnimes(prev => {
      const updated = [...prev, newAnime];
      localStorage.setItem('animes', JSON.stringify(updated));
      return updated;
    });
    setQuery('');
    setSuggestions([]);
  };

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) 
      clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 1000);
  };

  let displayedAnimes = [...animes];
  if (searchLocal) {
    const queryLower = searchLocal.toLowerCase();
    displayedAnimes = displayedAnimes.filter(a =>
      a.title.toLowerCase().includes(queryLower) ||
      (a.tags && a.tags.some(tag => tag.toLowerCase().includes(queryLower)))
    );
  }

  if (filter !== 'all') {
    displayedAnimes = displayedAnimes.filter(a => {
      if (filter === 'watched') return a.watched;
      if (filter === 'unwatched') return !a.watched;
      if (filter === 'top') return a.rating >= 4;
      return true;
    });
  }

  if (sort !== 'none') {
    displayedAnimes.sort((a, b) => {
      if (sort === 'title') return a.title.localeCompare(b.title);
      if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sort === 'year') return (b.year || 0) - (a.year || 0);
      return 0;
    });
  }

  return (
    <div className="p-4">
      <div className="bg-white p-4 rounded shadow mb-6 relative">
        <div className="flex gap-2 mb-3">
          <input 
            value={query} 
            onChange={handleQueryChange} 
            placeholder="Add an anime (API Jikan)" 
            className="flex-grow border p-2 rounded" 
          />
          <button 
            onClick={() => query && addAnimeFromAPI({ mal_id: Date.now(), title: query })}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Add
          </button>
        </div>

        {suggestions.length > 0 && (
          <ul className="absolute bg-white border rounded mt-1 w-full z-50 max-h-60 overflow-y-auto">
            {suggestions.map(anime => (
              <li
                key={anime.mal_id}
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => addAnimeFromAPI(anime)}
              >
                {anime.title}
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2 items-center mt-6">
          <input
            value={searchLocal}
            onChange={e => setSearchLocal(e.target.value)}
            placeholder="🔍 Search locally or by tag name"
            className="flex-grow border p-2 rounded"
          />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded p-2">
            <option value="all">All</option>
            <option value="watched">Watched</option>
            <option value="unwatched">To watch</option>
            <option value="top">⭐ Top</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)} className="border rounded p-2">
            <option value="none">-- Sorting --</option>
            <option value="title">Title</option>
            <option value="rating">Stars</option>
            <option value="year">Year</option>
          </select>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setView('grid')} className={`px-3 py-1 rounded ${view==='grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Gallery</button>
            <button onClick={() => setView('list')} className={`px-3 py-1 rounded ${view==='list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>List</button>
            <button onClick={exportJSON} className="px-3 py-1 rounded bg-green-500 text-white">Export</button>
            <label className="px-3 py-1 rounded bg-yellow-500 text-white cursor-pointer">
              Import
              <input type="file" accept=".json" onChange={importJSON} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      <div className={view === 'grid' ? 'grid grid-cols-3 gap-4' : 'flex flex-col gap-3'}>
        {displayedAnimes.map(anime => (
          view === 'grid' ? (
            <AnimeCard
              key={anime.id}
              anime={anime}
              onToggleWatched={handleToggleWatched}
              onOpenDetails={handleOpenDetails}
              onUpdate={handleUpdateAnime}
              onDelete={handleDeleteAnime}
            />
          ) : (
            <AnimeListItem
              key={anime.id}
              anime={anime}
              onToggleWatched={handleToggleWatched}
              onOpenDetails={handleOpenDetails}
              onUpdate={handleUpdateAnime}
              onDelete={handleDeleteAnime}
            />
          )
        ))}
      </div>

      {selectedAnime && (
        <AnimeDetailsModal
          anime={selectedAnime}
          onClose={handleCloseDetails}
          onUpdate={handleUpdateAnime}
        />
      )}
    </div>
  );
}
