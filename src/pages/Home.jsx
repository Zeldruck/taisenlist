import { useState, useEffect, useRef } from "react";
import { motion } from 'framer-motion';
import { List, Grid, AutoSizer } from "react-virtualized";
import { Squares2X2Icon, Bars3Icon, ArrowUpTrayIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, rectSortingStrategy, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";

import SortableItem from "../components/SortableItem";
import AnimeCard from '../components/AnimeCard';
import AnimeListItem from '../components/AnimeListItem';
import AnimeDetailsModal from '../components/AnimeDetailsModal';

import "./Home.css";

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
  const [isEditing, setIsEditing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  const handleUpdateAnime = (id, patch) => {
    const updated = animes.map(a => a.id === id ? { ...a, ...patch } : a);
    setAnimes(updated);
    localStorage.setItem('animes', JSON.stringify(updated));
  };

  const watchTypes = [ 'TW', 'IP', 'W' ];
  const watchTypeNames = [ 'To watch', 'In progress', 'Watched' ];

  function getWatchType(ind) {

    let n = watchTypes[ind];

    switch (n) {
      case 'W':
        return [watchTypeNames[ind], 'bg-green-500 hover:bg-green-600'];
      case 'TW':
        return [watchTypeNames[ind], 'bg-gray-500 dark:bg-gray-700'];
      case 'IP':
        return [watchTypeNames[ind], 'bg-blue-500 hover:bg-blue-600'];
      default:
        return ["", 'bg-gray-500 dark:bg-gray-700'];
    }
  }

  const handleToggleWatched = (id) => {
    const anime = animes.find(a => a.id === id);
    if (!anime) return;
    let w = (anime.watched + 1 >= watchTypes.length) ? 0 : anime.watched + 1;
    handleUpdateAnime(id, { watched: w });
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
      try {
        const importedData = JSON.parse(ev.target.result);

        if (!Array.isArray(importedData)) {
          console.error("Invalid format");
          return;
        }

        setAnimes((prevAnimes) => {
          const existingIds = new Set(prevAnimes.map((a) => a.id));
          const newAnimes = importedData.filter((a) => !existingIds.has(a.id));
          const merged = [...prevAnimes, ...newAnimes];
          localStorage.setItem('animes', JSON.stringify(merged));

          return merged;
        });
      } catch (err) {
        console.error("Error while importing JSON :", err);
      }
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

    if (animes.some(x => x.id === anime.id))
    {
      setQuery('');
      setSuggestions([]);
      return;
    }

    const newAnime = {
      id: anime.mal_id,
      title: anime.title,
      title_english: anime.title_english,
      image: anime.images.webp.large_image_url,
      description: anime.synopsis,
      year: anime.aired?.from ? new Date(anime.aired.from).getFullYear() : undefined,
      tags: [
        ...(anime.genres?.map(g => g.name) || []),
        ...(anime.themes?.map(t => t.name) || [])
      ],
      watched: 0,
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  let displayedAnimes = [...animes];
  if (searchLocal) {
    const queryLower = searchLocal.toLowerCase().trim();
    const tokens = queryLower.split(/\s+/);

    const matchesAnime = (anime, term) => {
      const fields = [
        anime.title.toLowerCase(),
        (anime.title_english || '').toLowerCase(),
        ...(anime.tags || []).map(t => t.toLowerCase())
      ];

      return fields.some(f => f.includes(term));
    };

    const evaluateToken = (anime, token) => {
      // Handle OR operator
      if (token.includes("|")) {
        return token.split("|").some(part => evaluateToken(anime, part.trim()));
      }

      // Handle + and -
      if (token.startsWith("+")) return matchesAnime(anime, token.slice(1));
      if (token.startsWith("-")) return !matchesAnime(anime, token.slice(1));

      // Default: just match term
      return matchesAnime(anime, token);
    };

    displayedAnimes = displayedAnimes.filter(anime =>
      tokens.every(token => evaluateToken(anime, token))
    );
  }


  if (filter !== 'all') {
    displayedAnimes = displayedAnimes.filter(a => {
      if (filter === 'watched') return a.watched == watchTypes.indexOf("W");
      if (filter === 'inprogress') return a.watched == watchTypes.indexOf("IP");
      if (filter === 'unwatched') return a.watched == watchTypes.indexOf("TW");
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

  const CARD_WIDTH = 500;
  const CARD_HEIGHT = 480;
  const LIST_ITEM_HEIGHT = 215;

  return (
    <motion.div
      animate={{
        scale: isEditing ? 1.01 : 1,
        boxShadow: isEditing
          ? '0 0 20px rgba(34,197,94,0.6)'
          : '0 0 10px rgba(0,0,0,0.1)',
        transition: { duration: 0.3 }
      }}
      className={`p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen rounded relative transition-colors duration-500`}
    >
      <div
        className={`p-4 rounded shadow mb-6 relative border transition-colors duration-500
          ${isEditing ? 'border-4 border-green-600 bg-green-50 dark:bg-green-900' : 'border-gray-300 dark:border-gray-700' }`}
      >
        <div className="flex gap-2 mb-3">
          {!isEditing && (
            <input 
              value={query} 
              onChange={handleQueryChange} 
              placeholder="Add an anime (API Jikan)" 
              className={`flex-grow border p-2 rounded bg-gray-100 text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-700 transition-colors duration-500`} 
            />
          )}
        </div>

        {!isEditing && suggestions.length > 0 && (
          <ul
            className={`absolute border rounded mt-1 w-full z-50 max-h-60 overflow-y-auto overflow-x-hidden bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 transition-colors duration-500
                        scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent`}
          >
            {suggestions.map(anime => {
              const itemVariants = {
                rest: { backgroundColor: isDark ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)', boxShadow: '0px 0px 0px rgba(0,0,0,0)' },
                hover: {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  boxShadow: isDark ? '0 0 10px rgba(255,255,255,0.3)' : '0 0 10px rgba(0,0,0,0.2)',
                  transition: { type: 'spring', stiffness: 300, damping: 25 }
                }
              };

              const imgVariants = {
                rest: { scale: 1 },
                hover: { scale: 1.1 }
              };

              const textVariants = {
                rest: { opacity: 0.8, x: -5 },
                hover: { opacity: 1, x: 0 }
              };

              return (
                <motion.li
                  key={anime.mal_id}
                  className="flex items-center gap-2 p-2 rounded cursor-pointer overflow-hidden"
                  variants={itemVariants}
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                  onClick={() => addAnimeFromAPI(anime)}
                >
                  <motion.img
                    src={anime.images?.jpg?.image_url}
                    alt={anime.title}
                    className="w-12 h-16 object-cover rounded flex-shrink-0"
                    variants={imgVariants}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  />

                  <motion.div
                    className="flex flex-col overflow-hidden"
                    variants={textVariants}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div className="font-medium truncate">{anime.title}</div>
                    {anime.title_english && anime.title_english !== anime.title && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {anime.title_english}
                      </div>
                    )}
                  </motion.div>
                </motion.li>
              );
            })}
          </ul>
        )}

        <div className={`flex ${isEditing ? 'justify-center items-center h-24 sm:h-20' : 'flex-col sm:flex-row flex-wrap sm:flex-nowrap gap-2 mt-6 items-stretch'}`}>
          <motion.button
            onClick={() => {
              setIsEditing(!isEditing);
              if (!isEditing) {
                setSearchLocal('');
                setFilter('all');
                setSort('none');
              } else {
                localStorage.setItem('animes', JSON.stringify(animes));
              }
            }}
            initial={{
              scale: isEditing ? 1.2 : 1,
              padding: isEditing ? '1rem 5rem' : '0.5rem 1rem'
            }}
            animate={{
              scale: isEditing ? 1.2 : 1,
              padding: isEditing ? '1rem 5rem' : '0.5rem 1rem'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`rounded flex items-center justify-center gap-2 transition-colors duration-300
              ${isEditing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {isEditing ? 'Done' : 'Edit'}
          </motion.button>

          {!isEditing && (
            <div className="block sm:hidden mt-2">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="w-full px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600 transition-colors duration-300"
              >
                {showOptions ? "Hide Options" : "Show Options"}
              </button>
            </div>
          )}


          {!isEditing && (
            <div className="flex-col sm:flex-row flex-wrap sm:flex-nowrap gap-2 items-stretch w-full">
              {/* PC */}
              <div className="hidden sm:flex gap-2 flex-wrap sm:flex-nowrap w-full">
                <input
                  value={searchLocal}
                  onChange={e => setSearchLocal(e.target.value)}
                  placeholder="🔍 Search locally or by tag name"
                  className={`w-full sm:flex-grow border p-2 sm:p-3 rounded text-sm sm:text-base bg-gray-100 text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-700 transition-colors duration-500`}
                />

                <select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className={`w-full sm:w-auto border p-2 sm:p-3 rounded text-sm sm:text-base bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 transition-colors duration-500`}
                >
                  <option value="all">All</option>
                  <option value="watched">Watched</option>
                  <option value="inprogress">In progress</option>
                  <option value="unwatched">To watch</option>
                  <option value="top">⭐ Top</option>
                  <option value="favorites">❤️ Favorites</option>
                </select>

                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className={`w-full sm:w-auto border p-2 sm:p-3 rounded text-sm sm:text-base bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 transition-colors duration-500`}
                >
                  <option value="none">-- Sorting --</option>
                  <option value="title">Title</option>
                  <option value="rating">Stars</option>
                  <option value="year">Year</option>
                </select>

                <div className="flex flex-wrap sm:flex-nowrap gap-2 mt-2 sm:mt-0 sm:ml-auto transition-colors duration-500">
                  <button
                    onClick={() => setView('grid')}
                    className={`w-full sm:w-auto px-4 py-2 rounded flex items-center justify-center gap-2 ${view === 'grid' ? 'bg-blue-600 text-white' : `border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100`} transition-colors duration-500`}
                  >
                    <Squares2X2Icon className="w-5 h-5" />
                    Gallery
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`w-full sm:w-auto px-4 py-2 rounded flex items-center justify-center gap-2 ${view === 'list' ? 'bg-blue-600 text-white' : `border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100`} transition-colors duration-500`}
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

              {/* Mobile*/}
              {showOptions && (
                <div className="flex flex-col gap-2 sm:hidden ">
                  <input
                    value={searchLocal}
                    onChange={e => setSearchLocal(e.target.value)}
                    placeholder="🔍 Search locally or by tag name"
                    className={`w-full sm:flex-grow border p-2 sm:p-3 rounded text-sm sm:text-base bg-gray-100 text-gray-900 placeholder-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-700 transition-colors duration-500`}
                  />

                  <select
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className={`w-full sm:w-auto border p-2 sm:p-3 rounded text-sm sm:text-base bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 transition-colors duration-500`}
                  >
                    <option value="all">All</option>
                    <option value="watched">Watched</option>
                    <option value="inprogress">In progress</option>
                    <option value="unwatched">To watch</option>
                    <option value="top">⭐ Top</option>
                    <option value="favorites">❤️ Favorites</option>
                  </select>

                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className={`w-full sm:w-auto border p-2 sm:p-3 rounded text-sm sm:text-base bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700 transition-colors duration-500`}
                  >
                    <option value="none">-- Sorting --</option>
                    <option value="title">Title</option>
                    <option value="rating">Stars</option>
                    <option value="year">Year</option>
                  </select>

                  <div className="flex flex-wrap sm:flex-nowrap gap-2 mt-2 sm:mt-0 sm:ml-auto transition-colors duration-500">
                    <div className="flex gap-2" style={{flexGrow: 1}}>
                      <button
                        onClick={() => setView('grid')}
                        className={`w-full sm:w-auto px-4 py-2 rounded flex items-center justify-center gap-2 ${view === 'grid' ? 'bg-blue-600 text-white' : `border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100`} transition-colors duration-500`}
                      >
                        <Squares2X2Icon className="w-5 h-5" />
                        Gallery
                      </button>
                      <button
                        onClick={() => setView('list')}
                        className={`w-full sm:w-auto px-4 py-2 rounded flex items-center justify-center gap-2 ${view === 'list' ? 'bg-blue-600 text-white' : `border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100`} transition-colors duration-500`}
                      >
                        <Bars3Icon className="w-5 h-5" />
                        List
                      </button>
                    </div>
                    <div className="flex gap-2" style={{flexGrow: 1}}>
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
              )}
            </div>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToFirstScrollableAncestor]}
        onDragEnd={(event) => {
          const { active, over } = event;
          if (!over || !isEditing) return;
          if (active.id !== over.id) {
            setAnimes((items) => {
              const oldIndex = items.findIndex((i) => i.id === active.id);
              const newIndex = items.findIndex((i) => i.id === over.id);
              return arrayMove(items, oldIndex, newIndex);
            });
          }
        }}
      >
        <SortableContext
          className="flex-1 overflow-auto"
          items={displayedAnimes.map((a) => a.id)}
          strategy={view === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
        >
          <AutoSizer>
            {({ width, height }) => {
              const isMobile = width < 615;
              const columns = view === "grid" ? (isMobile ? 2 : Math.floor(width / CARD_WIDTH)) : 1;
              const cardWidth = width / columns;
              const cardHeight = view === "grid"
                ? (isMobile ? cardWidth * 3.5 : CARD_HEIGHT)
                : (isMobile ? LIST_ITEM_HEIGHT * 2.2 : LIST_ITEM_HEIGHT);

              const rowCount = view === "grid"
                ? Math.ceil(displayedAnimes.length / columns)
                : displayedAnimes.length;

              return view === "grid" ? (
                <Grid
                  columnCount={columns}
                  columnWidth={cardWidth}
                  rowCount={rowCount + (isMobile ? 1 : 0)}
                  rowHeight={cardHeight}
                  width={width}
                  height={height}
                  className="scrollbar-hidden"
                  style={{
                    touchAction: isEditing ? "none" : "auto"
                  }}
                  cellRenderer={({ columnIndex, rowIndex, key, style }) => {
                    const index = rowIndex * columns + columnIndex;
                    if (index >= displayedAnimes.length) return null;
                    const anime = displayedAnimes[index];
                    return (
                      <div key={key} style={{ ...style, padding: 8 }}>
                        <SortableItem id={anime.id} isEditing={isEditing}>
                          <AnimeCard
                            anime={anime}
                            getWatchType={getWatchType}
                            onToggleWatched={isEditing ? () => {} : handleToggleWatched}
                            onOpenDetails={isEditing ? () => {} : handleOpenDetails}
                            onUpdate={handleUpdateAnime}
                            onDelete={handleDeleteAnime}
                          />
                        </SortableItem>
                      </div>
                    );
                  }}
                />
              ) : (
                <List
                  rowCount={rowCount}
                  rowHeight={cardHeight}
                  width={width}
                  height={height}
                  className="scrollbar-hidden"
                  style={{
                    touchAction: isEditing ? "none" : "auto"
                  }}
                  rowRenderer={({ index, key, style }) => {
                    const anime = displayedAnimes[index];
                    return (
                      <div key={key} style={{ ...style, padding: 8 }}>
                        <SortableItem id={anime.id} isEditing={isEditing}>
                          <AnimeListItem
                            anime={anime}
                            getWatchType={getWatchType}
                            onToggleWatched={isEditing ? () => {} : handleToggleWatched}
                            onOpenDetails={isEditing ? () => {} : handleOpenDetails}
                            onUpdate={handleUpdateAnime}
                            onDelete={handleDeleteAnime}
                          />
                        </SortableItem>
                      </div>
                    );
                  }}
                />
              );
            }}
          </AutoSizer>


        </SortableContext>
      </DndContext>


      {selectedAnime && (
        <AnimeDetailsModal
          anime={selectedAnime}
          onClose={handleCloseDetails}
          onUpdate={handleUpdateAnime}
        />
      )}
    </motion.div>

  );
}
