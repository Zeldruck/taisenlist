import { useState, useEffect } from 'react';

export default function AnimeDetailsModal({ anime, onClose, onUpdate, onDelete }) {
  const [rating, setRating] = useState(anime.rating || 0);
  const [comment, setComment] = useState(anime.comment || '');
  const [tags, setTags] = useState(anime.tags || []);
  const [editingTag, setEditingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [vh, setVh] = useState(window.innerHeight);

  useEffect(() => {
    setRating(anime.rating || 0);
    setComment(anime.comment || '');
    setTags(anime.tags || []);

    document.body.style.overflow = 'hidden';
    const handleResize = () => setVh(window.innerHeight);
    window.addEventListener('resize', handleResize);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('resize', handleResize);
    };
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
    <div
      className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50"
      style={{ height: `${vh}px` }}
    >
      <div
        className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg
                   w-full sm:w-[90%] md:w-[600px] max-h-[90vh] overflow-auto p-4
                   flex flex-col gap-4 shadow-lg relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-700 dark:text-gray-300 text-xl font-bold z-10"
        >
          ✖
        </button>

        <h2 className="text-xl font-bold">{anime.title}</h2>

        <img
          src={anime.image}
          alt={anime.title}
          className="w-full h-64 object-cover rounded"
        />

        <p className="text-sm">{anime.description}</p>

        <div className="flex flex-wrap gap-2">
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

        <div className="flex items-center gap-1">
          {[1,2,3,4,5,6,7,8,9,10].map(star => (
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
