export default function RatingStars({ rating, setRating }) {
  return (
    <div className="flex">
      {[1,2,3,4,5].map(star => (
        <button
          key={star}
          onClick={() => setRating(star)}
          className={star <= rating ? "text-yellow-500" : "text-gray-400"}
        >
          ★
        </button>
      ))}
    </div>
  );
}
