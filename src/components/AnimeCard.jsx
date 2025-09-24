import { motion } from 'framer-motion';
import { useState } from 'react';
import FavoriteButton from './FavoriteButton';

export default function AnimeCard({ anime, getWatchType, onToggleWatched, onOpenDetails, onUpdate, onDelete }) {
  const [hovered, setHovered] = useState(false);

  const handleRating = (rating) => {
    onUpdate(anime.id, { rating });
  };

  const watchType = getWatchType(anime.watched);

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.03 }}
      className={`relative rounded-lg overflow-hidden cursor-pointer flex flex-col
                  bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100
                  shadow-md dark:shadow-lg hover:shadow-lg transition-all duration-500`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpenDetails(anime)}
    >
      <div className="relative">
        <img
          src={anime.image}
          alt={anime.title}
          className={`w-full sm:h-48 md:h-56 lg:h-64 object-cover
                      transition-all duration-500
                      dark:brightness-90 brightness-100`}
        />

        <div
          className={`absolute inset-0 transition-all duration-500
                      dark:bg-black/20 bg-black/0`}
        />

        <FavoriteButton 
          anime={anime}
          onUpdate={onUpdate}
        />
      </div>

      <div className="p-3 flex flex-col flex-grow transition-colors duration-500">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
          <div className="flex flex-col">
            <h3 className="font-semibold text-lg truncate">{anime.title}</h3>
            {anime.title_english && anime.title_english !== anime.title && (
              <p className="font-semibold text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {anime.title_english}
              </p>
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-0 transition-colors duration-500">
            {anime.year || '?'}
          </span>
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 line-clamp-3 transition-colors duration-500">
          {anime.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-2">
          {anime.tags?.slice(0, window.innerWidth < 768 ? 2 : 4).map((tag, i) => (
            <span
              key={i}
              className="text-[10px] md:text-xs px-1 py-0.5 rounded truncate
                        bg-blue-200 dark:bg-blue-700 text-gray-800 transition-colors duration-500"
              title={tag}
            >
              {tag}
            </span>
          ))}
          {anime.tags && anime.tags.length > (window.innerWidth < 768 ? 2 : 4) && (
            <span className="text-[10px] md:text-xs px-1 py-0.5 rounded
                            bg-blue-200 dark:bg-blue-700 text-gray-800 transition-colors duration-500">
              +{anime.tags.length - (window.innerWidth < 768 ? 2 : 4)}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto gap-2">
          <div className="flex gap-1 mb-2 sm:mb-0">
            {[1,2,3,4,5,6,7,8,9,10].map((star) => (
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
                watchType[1]
              }`}
            >
              {watchType[0]}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(anime.id); }}
              className="px-3 py-1 rounded text-white text-sm bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 transition-colors duration-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
