import React, { useEffect } from "react";
import style from "./Block.module.css";
import parse from "html-react-parser";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function Block({ block }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
  });

  const styles = {
    transform: CSS.Transform.toString(transform),
    width: "fit-content",
    height: "max-content",
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...styles }}
      {...listeners}
      {...attributes}
      className={`${style.block} ${style[block.type]}`}
    >
      <div className={`${style.type} ${style[block.type]}`}>{block.type}</div>

      {block.content && parse(block.content)}
    </div>
  );
}
