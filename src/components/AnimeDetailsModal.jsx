import { useState, useEffect } from 'react';

export default function AnimeDetailsModal({ anime, onClose, onUpdate }) {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-700 text-xl font-bold">✖</button>
        <h2 className="text-xl font-bold mb-2">{anime.title}</h2>
        <img src={anime.image} alt={anime.title} className="w-full h-64 object-cover rounded mb-2"/>
        <p className="mb-2">{anime.description}</p>
        <div className="flex flex-wrap gap-1 mb-2">
          {anime.tags?.map((t,i)=><span key={i} className="text-xs bg-blue-200 px-1 rounded">{t}</span>)}
        </div>
        <div className="flex items-center gap-1 mb-2">
          {[1,2,3,4,5].map(star=>(
            <button key={star} className={`text-lg ${rating>=star ? 'text-yellow-500' : 'text-gray-300'}`} onClick={()=>handleRating(star)}>★</button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={handleCommentChange}
          placeholder="Add a comment"
          className="w-full border p-2 rounded mb-2"
        />
        <div className="flex gap-2">
          <button onClick={handleCommentSave} className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
}
