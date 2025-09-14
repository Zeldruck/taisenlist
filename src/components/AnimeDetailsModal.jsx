import { useState, useEffect } from 'react';

export default function AnimeDetailsModal({ anime, onClose, onUpdate, onDelete }) {
  const [rating, setRating] = useState(anime.rating || 0);
  const [comment, setComment] = useState(anime.comment || '');
  const [tags, setTags] = useState(anime.tags || []);
  const [editingTag, setEditingTag] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    setRating(anime.rating || 0);
    setComment(anime.comment || '');
    setTags(anime.tags || []);
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

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const updatedTags = [...tags, newTag.trim()];
    setTags(updatedTags);
    onUpdate(anime.id, { tags: updatedTags });
    setNewTag('');
    setEditingTag(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = tags.filter(t => t !== tagToRemove);
    setTags(updatedTags);
    onUpdate(anime.id, { tags: updatedTags });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2 overflow-auto">
      <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-4 w-full sm:max-w-md md:max-w-lg relative flex flex-col gap-2">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-700 dark:text-gray-300 text-xl font-bold"
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

        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((t, i) => (
            <div
              key={i}
              className="flex items-center gap-1 bg-blue-200 dark:bg-blue-700 text-gray-800 dark:text-gray-700 px-2 py-0.5 rounded text-xs"
            >
              <span>{t}</span>
              <button
                onClick={() => handleRemoveTag(t)}
                className="text-red-500 dark:text-red-600 hover:text-red-700 dark:hover:text-red-200 transition-colors duration-200"
              >
                ✕
              </button>
            </div>
          ))}

          {editingTag ? (
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onBlur={handleAddTag}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              autoFocus
              className="px-2 py-0.5 rounded border border-gray-400 dark:border-gray-600 text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-700 text-xs"
              placeholder="New tag"
            />
          ) : (
            <div
              onClick={() => setEditingTag(true)}
              className="cursor-pointer px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-800 text-gray-700 dark:text-gray-200 text-xs hover:bg-blue-200 dark:hover:bg-blue-600 transition-colors duration-200"
            >
              + Add tag
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              className={`text-lg ${rating >= star ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-500'}`}
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
          className="w-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 p-2 rounded mb-2 resize-none"
        />

        <div className="flex justify-between gap-2">
          <button
            onClick={handleCommentSave}
            className="px-3 py-1 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            Save
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-1 bg-red-500 dark:bg-red-600 text-white rounded hover:bg-red-600 dark:hover:bg-red-500"
          >
            Delete Anime
          </button>
        </div>
      </div>
    </div>
  );
}
