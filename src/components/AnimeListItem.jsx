import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

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
      className="bg-white rounded-lg shadow p-3 flex flex-col md:flex-row gap-3 cursor-pointer"
      onClick={() => onOpenDetails(anime)}
    >
      <img
        src={anime.image}
        alt={anime.title}
        className="w-full md:w-24 h-48 md:h-32 object-cover rounded"
      />
      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold text-lg">{anime.title}</h3>
          <span className="text-xs text-gray-500">{anime.year || '?'}</span>
        </div>
        <p className="text-sm text-gray-700 mb-2 line-clamp-3">{anime.description}</p>

        <div className="flex flex-wrap gap-1 mb-2">
          {anime.tags?.slice(0, maxTags).map((tag, i) => (
            <span
              key={i}
              className="text-[10px] md:text-xs bg-blue-200 px-1 py-0.5 rounded truncate"
              title={tag}
            >
              {tag}
            </span>
          ))}
          {anime.tags && anime.tags.length > maxTags && (
            <span className="text-[10px] md:text-xs bg-blue-200 px-1 py-0.5 rounded">
              +{anime.tags.length - maxTags}
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mt-auto gap-2">
          <div className="flex gap-1 mb-1 md:mb-0">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                className={`text-lg ${anime.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                onClick={(e) => { e.stopPropagation(); handleRating(star); }}
              >
                ★
              </button>
            ))}
          </div>

          <div className="flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleWatched(anime.id); }}
              className={`px-3 py-1 rounded text-white text-sm ${anime.watched ? 'bg-green-500' : 'bg-gray-500'}`}
            >
              {anime.watched ? 'Watched' : 'To watch'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(anime.id); }}
              className="px-3 py-1 rounded text-white text-sm bg-red-500 hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
