import style from "./SelectedRect.module.css";

function SelectedRect({ coordinates, idx, scale }) {
  const { left, top, width, height } = coordinates;

  return (
    <div
      key={`saved-selection-${idx}`}
      className={style.rect}
      style={{
        left: `${left * scale}px`,
        top: `${top * scale}px`,
        width: `${width * scale}px`,
        height: `${height * scale}px`,
      }}
    />
  );
}

export default SelectedRect;
