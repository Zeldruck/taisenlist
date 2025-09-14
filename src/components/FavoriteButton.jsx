import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function FavoriteButton({ anime, onUpdate }) {
  const [favClicked, setFavClicked] = useState(false);

  const handleFavorite = (e) => {
    e.stopPropagation();
    onUpdate(anime.id, { favorite: !anime.favorite });
    setFavClicked(true);
    setTimeout(() => setFavClicked(false), 500);
  };

  const confetti = Array.from({ length: 8 });

  return (
    <div className="absolute top-2 right-2 w-10 h-10">
      <motion.button
        onClick={handleFavorite}
        className="w-10 h-10 rounded-full text-xl flex items-center justify-center"
        initial={false}
        animate={{
          scale: favClicked ? [1, 1.6, 1.3, 1.5, 1] : 1,
          rotate: favClicked ? [0, 20, -10, 10, 0] : 0
        }}
        transition={{ duration: 0.5, times: [0, 0.2, 0.4, 0.6, 1], type: 'tween', ease: 'easeOut' }}
      >
        {anime.favorite ? '❤️' : '🤍'}
      </motion.button>

      <AnimatePresence>
        {favClicked &&
          confetti.map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-red-600 rounded-full"
              style={{ top: '65%', left: '40%' }}
              initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              animate={{
                x: [-10, 10, -15, 15, 0][i % 5],
                y: [-20, -25, -30, -35, -40][i % 5],
                scale: [1, 1.5, 1, 1.3, 0],
                opacity: [1, 1, 1, 0.8, 0]
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          ))}
      </AnimatePresence>
    </div>
  );
}
