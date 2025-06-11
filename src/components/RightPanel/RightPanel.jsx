import { useEffect } from 'react';
import { usePDFStore } from '../../store/store';

import s from './RightPanel.module.css';

export default function RightPanel() {
  const { selectedRegions, addRegion, clearSelection, selectedRegion } = usePDFStore();

  useEffect(() => {
    console.log(selectedRegions);
  }, [selectedRegions]);

  return (
    <div className={s.rightPanel}>
      <h2>Выбранные области</h2>
      {selectedRegions.length === 0 ? (
        <p>Пока нет выбранных областей</p>
      ) : (
        selectedRegions.map((region, index) => (
          <div key={index} style={{ marginBottom: 15 }}>
            <img src={region.image} alt={`Область ${index + 1}`} className={s.img} />
            <p>Страница {region.page}</p>
          </div>
        ))
      )}
      <button onClick={() => addRegion(selectedRegion)}>Применить</button>
      <button onClick={clearSelection} style={{ marginLeft: 10 }}>
        Очистить
      </button>
    </div>
  );
}
