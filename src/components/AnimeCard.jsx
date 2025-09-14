import { motion } from 'framer-motion';
import { useState } from 'react';

export default function AnimeCard({ anime, onToggleWatched, onOpenDetails, onUpdate, onDelete }) {
  const [hovered, setHovered] = useState(false);

  const handleRating = (rating) => {
    onUpdate(anime.id, { rating });
  };

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.03 }}
      className="bg-white rounded-lg shadow overflow-hidden cursor-pointer flex flex-col sm:flex-col md:flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpenDetails(anime)}
    >
      <img
        src={anime.image}
        alt={anime.title}
        className="w-full sm:h-48 md:h-56 lg:h-64 object-cover"
      />
      <div className="p-3 flex flex-col flex-grow">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
          <h3 className="font-semibold text-lg truncate">{anime.title}</h3>
          <span className="text-xs text-gray-500 mt-1 sm:mt-0">{anime.year || '?'}</span>
        </div>

        <p className="text-sm text-gray-700 mb-2 line-clamp-3">{anime.description}</p>

        <div className="flex flex-wrap gap-1 mb-2">
          {anime.tags?.slice(0, window.innerWidth < 768 ? 2 : 4).map((tag, i) => (
            <span 
              key={i} 
              className="text-[10px] md:text-xs bg-blue-200 px-1 py-0.5 rounded truncate"
              title={tag}
            >
              {tag}
            </span>
          ))}
          {anime.tags && anime.tags.length > (window.innerWidth < 768 ? 2 : 4) && (
            <span className="text-[10px] md:text-xs bg-blue-200 px-1 py-0.5 rounded">
              +{anime.tags.length - (window.innerWidth < 768 ? 2 : 4)}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto gap-2">
          <div className="flex gap-1 mb-2 sm:mb-0">
            {[1,2,3,4,5].map((star) => (
              <button
                key={star}
                className={`text-lg ${anime.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                onClick={(e) => { e.stopPropagation(); handleRating(star); }}
              >
                ★
              </button>
            ))}
          </div>

          <div className="flex gap-1 flex-wrap">
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
