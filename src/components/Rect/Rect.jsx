import React from "react";
import style from "./Rect.module.css";

export default function Rect({ selectionStart, selectionEnd, scale }) {
  return (
    <div
      className={style.rect}
      style={{
        left: `${Math.min(selectionStart.x, selectionEnd.x) * scale}px`,
        top: `${Math.min(selectionStart.y, selectionEnd.y) * scale}px`,
        width: `${Math.abs(selectionStart.x - selectionEnd.x) * scale}px`,
        height: `${Math.abs(selectionStart.y - selectionEnd.y) * scale}px`,
      }}
    />
  );
}
