import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableItem({ id, children, isEditing }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    cursor: isEditing ? "grab" : "default",
    scale: isDragging ? 1.05 : 1,
    boxShadow: isDragging
      ? "0 10px 25px rgba(0,0,0,0.3)"
      : "none",
  };

  const activeListeners = isEditing ? listeners : {};

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...activeListeners}>
      {children}
    </div>
  );
}
