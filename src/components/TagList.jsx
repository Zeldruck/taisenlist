export default function TagList({ tags, onTagClick }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {tags?.map((tag, i) => (
        <span
          key={i}
          onClick={() => onTagClick(tag)}
          className="cursor-pointer text-xs bg-blue-200 px-2 rounded"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
