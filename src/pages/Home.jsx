import { useState, useEffect, useRef } from "react";
import { Squares2X2Icon, Bars3Icon, ArrowUpTrayIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
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
  const [isDark, setIsDark] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('animes');

    if (stored) setAnimes(JSON.parse(stored));
    
    setIsDark(document.documentElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
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
      favorite: false,
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

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 1000);
  };

  let displayedAnimes = [...animes];
  if (searchLocal) {
    const queryLower = searchLocal.toLowerCase().trim();
    const tokens = queryLower.split(/\s+/);

    displayedAnimes = displayedAnimes.filter(a => {
      const title = a.title.toLowerCase();
      const tags = (a.tags || []).map(t => t.toLowerCase());

      return tokens.every(token => {
        if (token.includes("|")) {
          const orParts = token.split("|").map(t => t.trim());

          return orParts.some(part => {
            if (part.startsWith("-")) {
              const term = part.slice(1);
              return !(title.includes(term) || tags.some(tag => tag.includes(term)));
            }
            if (part.startsWith("+")) {
              const term = part.slice(1);
              return title.includes(term) || tags.some(tag => tag.includes(term));
            }
            const term = part;
            return title.includes(term) || tags.some(tag => tag.includes(term));
          });
        }

        if (token.startsWith("-")) {
          const term = token.slice(1);
          return !(title.includes(term) || tags.some(tag => tag.includes(term)));
        }
        if (token.startsWith("+")) {
          const term = token.slice(1);
          return title.includes(term) || tags.some(tag => tag.includes(term));
        }
        const term = token;
        return title.includes(term) || tags.some(tag => tag.includes(term));
      });
    });
  }

  if (filter !== 'all') {
    displayedAnimes = displayedAnimes.filter(a => {
      if (filter === 'watched') return a.watched;
      if (filter === 'unwatched') return !a.watched;
      if (filter === 'top') return a.rating >= 4;
      if (filter === 'favorites') return a.favorite;
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

  const baseBg = isDark ? 'bg-gray-900' : 'bg-gray-50';
  const baseBorder = isDark ? 'border-gray-700' : 'border-gray-300';
  const baseText = isDark ? 'text-gray-100' : 'text-gray-900';
  const inputBg = isDark ? 'bg-gray-800 text-gray-100 placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500';
  const dropdownBg = isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900';

  return (
    <div className={`p-4 ${baseBg} ${baseText} min-h-screen transition-colors duration-500`}>
      <div className={`p-4 rounded shadow mb-6 relative border ${baseBorder} transition-colors duration-500`}>
        <div className="flex gap-2 mb-3">
          <input 
            value={query} 
            onChange={handleQueryChange} 
            placeholder="Add an anime (API Jikan)" 
            className={`flex-grow border p-2 rounded ${inputBg} border ${baseBorder} transition-colors duration-500`} 
          />
        </div>

        {suggestions.length > 0 && (
          <ul className={`absolute border rounded mt-1 w-full z-50 max-h-60 overflow-y-auto ${dropdownBg} border ${baseBorder} transition-colors duration-500`}>
            {suggestions.map(anime => (
              <li
                key={anime.mal_id}
                className={`flex items-center gap-2 p-2 hover:${isDark ? 'bg-gray-700' : 'bg-gray-200'} cursor-pointer transition-colors duration-500`}
                onClick={() => addAnimeFromAPI(anime)}
              >
                {/* Cover image */}
                <img
                  src={anime.images?.jpg?.image_url}
                  alt={anime.title}
                  className="w-12 h-16 object-cover rounded flex-shrink-0"
                />

                {/* Titles */}
                <div className="flex flex-col overflow-hidden">
                  <div className="font-medium truncate">{anime.title}</div>
                  {anime.title_english && anime.title_english !== anime.title && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{anime.title_english}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}


        <div className="flex flex-col sm:flex-row flex-wrap sm:flex-nowrap gap-2 mt-6 items-stretch">
          <input
            value={searchLocal}
            onChange={e => setSearchLocal(e.target.value)}
            placeholder="🔍 Search locally or by tag name"
            className={`w-full sm:flex-grow border p-2 sm:p-3 rounded text-sm sm:text-base ${inputBg} border ${baseBorder} transition-colors duration-500`}
          />

          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className={`w-full sm:w-auto border p-2 sm:p-3 rounded text-sm sm:text-base ${dropdownBg} border ${baseBorder} transition-colors duration-500`}
          >
            <option value="all">All</option>
            <option value="watched">Watched</option>
            <option value="unwatched">To watch</option>
            <option value="top">⭐ Top</option>
            <option value="favorites">❤️ Favorites</option>
          </select>

          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className={`w-full sm:w-auto border p-2 sm:p-3 rounded text-sm sm:text-base ${dropdownBg} border ${baseBorder} transition-colors duration-500`}
          >
            <option value="none">-- Sorting --</option>
            <option value="title">Title</option>
            <option value="rating">Stars</option>
            <option value="year">Year</option>
          </select>

          <div className="flex flex-wrap sm:flex-nowrap gap-2 mt-2 sm:mt-0 sm:ml-auto transition-colors duration-500">
            <button
              onClick={() => setView('grid')}
              className={`w-full sm:w-auto px-4 py-2 rounded flex items-center justify-center gap-2 ${view === 'grid' ? 'bg-blue-600 text-white' : `border ${baseBorder} ${baseText}`} transition-colors duration-500`}
            >
              <Squares2X2Icon className="w-5 h-5" />
              Gallery
            </button>
            <button
              onClick={() => setView('list')}
              className={`w-full sm:w-auto px-4 py-2 rounded flex items-center justify-center gap-2 ${view === 'list' ? 'bg-blue-600 text-white' : `border ${baseBorder} ${baseText}`} transition-colors duration-500`}
            >
              <Bars3Icon className="w-5 h-5" />
              List
            </button>
            <button
              onClick={exportJSON}
              className="w-full sm:w-auto px-4 py-2 rounded flex items-center justify-center gap-2 bg-green-500 text-white transition-colors duration-500"
            >
              <ArrowUpTrayIcon className="w-5 h-5" />
              Export
            </button>
            <label className="w-full sm:w-auto px-4 py-2 rounded flex items-center justify-center gap-2 bg-yellow-500 text-white cursor-pointer transition-colors duration-500">
              <ArrowDownTrayIcon className="w-5 h-5" />
              Import
              <input type="file" accept=".json" onChange={importJSON} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      <div className={`${view === 'grid' ? 'grid grid-cols-3 gap-4' : 'flex flex-col gap-3'} transition-colors duration-500`}>
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
