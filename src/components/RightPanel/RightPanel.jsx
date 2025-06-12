import { usePDFStore } from '../../store/store';

import style from './RightPanel.module.css';

export default function RightPanel() {
  const { selectedRegions, addRegion, clearSelection, selectedRegion, setSelectedRegion } = usePDFStore();

  return (
    <div className={style.rightPanel}>
      <div className={style.buttons}>
        <button
          onClick={() => {
            if (Object.keys(selectedRegion).length != 0) {
              addRegion(selectedRegion);
            }
            setSelectedRegion({});
          }}
        >
          Применить
        </button>
        <button onClick={clearSelection}>Очистить</button>
      </div>
      <h2>Выбранные области</h2>
      {selectedRegions.length === 0 ? (
        <p>Пока нет выбранных областей</p>
      ) : (
        <ul className={style.regionsList}>
          {selectedRegions.map((region, index) => (
            <li key={index}>
              <img src={region.image} alt={`Область ${index + 1}`} className={style.img} />
              <p>Страница {region.page}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
