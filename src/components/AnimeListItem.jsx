import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import FavoriteButton from './FavoriteButton';

export default function AnimeListItem({ anime, onToggleWatched, onOpenDetails, onUpdate, onDelete }) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRating = (rating) => {
    onUpdate(anime.id, { rating });
  };

  const maxTags = windowWidth < 768 ? 3 : 4;

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      className="rounded-lg shadow p-3 flex flex-col md:flex-row gap-3 cursor-pointer
                 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors duration-500"
      onClick={() => onOpenDetails(anime)}
    >
      <div className="relative w-full md:w-24 h-48 md:h-32 flex-shrink-0">
        <img
          src={anime.image}
          alt={anime.title}
          className="w-full h-full object-cover rounded transition-all duration-500"
        />

        <FavoriteButton 
          anime={anime}
          onUpdate={onUpdate}
        />
      </div>

      <div className="flex flex-col flex-grow">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-1">
          <div className="flex flex-col max-w-full">
            <h3 className="font-semibold text-lg truncate overflow-hidden">{anime.title}</h3>
            {anime.title_english && anime.title_english !== anime.title && (
              <p className="font-semibold text-xs text-gray-500 dark:text-gray-400 truncate overflow-hidden mt-0.5">
                {anime.title_english}
              </p>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
            {anime.year || '?'}
          </span>
        </div>


        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-3 transition-colors duration-500">
          {anime.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-2">
          {anime.tags?.slice(0, maxTags).map((tag, i) => (
            <span
              key={i}
              className="text-[10px] md:text-xs px-1 py-0.5 rounded truncate
                         bg-blue-200 dark:bg-blue-700 text-gray-800 dark:text-gray-700 transition-colors duration-500"
              title={tag}
            >
              {tag}
            </span>
          ))}
          {anime.tags && anime.tags.length > maxTags && (
            <span className="text-[10px] md:text-xs px-1 py-0.5 rounded
                             bg-blue-200 dark:bg-blue-700 text-gray-800 dark:text-gray-700 transition-colors duration-500">
              +{anime.tags.length - maxTags}
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mt-auto gap-2">
          <div className="flex gap-1 mb-1 md:mb-0">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                className={`text-lg transition-colors duration-500 ${
                  anime.rating >= star ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-500'
                }`}
                onClick={(e) => { e.stopPropagation(); handleRating(star); }}
              >
                ★
              </button>
            ))}
          </div>

          <div className="flex gap-1 flex-wrap">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleWatched(anime.id); }}
              className={`px-3 py-1 rounded text-white text-sm transition-colors duration-500 ${
                anime.watched ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-500 dark:bg-gray-600'
              }`}
            >
              {anime.watched ? 'Watched' : 'To watch'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(anime.id); }}
              className="px-3 py-1 rounded text-white text-sm bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-500 transition-colors duration-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
