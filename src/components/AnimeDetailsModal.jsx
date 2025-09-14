import { useState, useEffect } from 'react';

export default function AnimeDetailsModal({ anime, onClose, onUpdate, onDelete }) {
  const [rating, setRating] = useState(anime.rating || 0);
  const [comment, setComment] = useState(anime.comment || '');

  useEffect(() => {
    setRating(anime.rating || 0);
    setComment(anime.comment || '');
  }, [anime]);

  const handleRating = (value) => {
    setRating(value);
    onUpdate(anime.id, { rating: value });
  };

  const handleCommentChange = (e) => setComment(e.target.value);
  const handleCommentSave = () => onUpdate(anime.id, { comment });
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${anime.title}"?`)) {
      onDelete(anime.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 overflow-auto">
      <div className="bg-white rounded-lg p-4 w-full sm:max-w-md md:max-w-lg relative flex flex-col gap-2">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-700 text-xl font-bold"
        >
          ✖
        </button>

        <h2 className="text-xl font-bold">{anime.title}</h2>

        <img
          src={anime.image}
          alt={anime.title}
          className="w-full h-64 sm:h-56 md:h-64 object-cover rounded mb-2"
        />

        <p className="text-sm mb-2">{anime.description}</p>

        <div className="flex flex-wrap gap-1 mb-2">
          {anime.tags?.map((t, i) => (
            <span
              key={i}
              className="text-[10px] md:text-xs bg-blue-200 px-1 py-0.5 rounded truncate"
              title={t}
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              className={`text-lg ${rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
              onClick={() => handleRating(star)}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={handleCommentChange}
          placeholder="Add a comment"
          className="w-full border p-2 rounded mb-2 resize-none"
        />

        <div className="flex justify-between gap-2">
          <button
            onClick={handleCommentSave}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Save
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete Anime
          </button>
        </div>
      </div>
    </div>
  );
}
