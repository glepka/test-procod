import React, { useState } from 'react';
import { usePDFStore } from './store/store';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function App() {
  const [numPages, setNumPages] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPages(new Array(numPages).fill(null));
  }

  const handleCanvasLoad = (canvas, pageNumber) => {
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newPages = [...pages];
    newPages[pageNumber - 1] = { canvas, imageData: imgData };
    setPages(newPages);
  };

  const startSelection = (e, pageNum) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsSelecting(true);
    setSelectionStart({ x, y, pageNum });
    setSelectionEnd(null);
  };

  const drawSelection = (e) => {
    if (!isSelecting) return;
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSelectionEnd({ x, y });
  };

  const endSelection = () => {
    if (!selectionStart || !selectionEnd) {
      setIsSelecting(false);
      return;
    }

    const { x: startX, y: startY, pageNum } = selectionStart;
    const { x: endX, y: endY } = selectionEnd;

    const left = Math.min(startX, endX);
    const top = Math.min(startY, endY);
    const width = Math.abs(startX - endX);
    const height = Math.abs(startY - endY);

    const page = pages[pageNum - 1];

    if (!page || !page.canvas || width === 0 || height === 0) {
      setIsSelecting(false);
      return;
    }

    // Создаем изображение выделенной области
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    tempCanvas.width = width;
    tempCanvas.height = height;

    const sourceCanvas = page.canvas;
    const pixelRatio = window.devicePixelRatio || 1;

    tempCtx.drawImage(sourceCanvas, left * pixelRatio, top * pixelRatio, width * pixelRatio, height * pixelRatio, 0, 0, width, height);

    const base64Image = tempCanvas.toDataURL('image/png');

    setSelectedRegions([
      ...selectedRegions,
      {
        image: base64Image,
        page: pageNum,
        coordinates: { left, top, width, height },
      },
    ]);

    // Рисуем красный прямоугольник на исходной странице
    const ctx = sourceCanvas.getContext('2d');
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(left, top, width, height);

    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Левая колонка — PDF */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', position: 'relative' }}>
        <h2>PDF Документ</h2>
        <Document file="test.pdf" onLoadSuccess={onDocumentLoadSuccess} loading="Загрузка PDF..." error="Ошибка загрузки файла">
          {Array.from(new Array(numPages), (el, index) => (
            <div key={`page_container_${index + 1}`} style={{ position: 'relative', marginBottom: '20px' }}>
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onRenderSuccess={({ canvas }) => handleCanvasLoad(canvas, index + 1)}
                onMouseDown={(e) => startSelection(e, index + 1)}
                onMouseMove={drawSelection}
                onMouseUp={endSelection}
              />

              {/* Визуализация выделения */}
              {isSelecting && selectionStart?.pageNum === index + 1 && selectionEnd && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${Math.min(selectionStart.x, selectionEnd.x)}px`,
                    top: `${Math.min(selectionStart.y, selectionEnd.y)}px`,
                    width: `${Math.abs(selectionStart.x - selectionEnd.x)}px`,
                    height: `${Math.abs(selectionStart.y - selectionEnd.y)}px`,
                    border: '2px dashed red',
                    pointerEvents: 'none',
                    backgroundColor: 'rgba(255, 0, 0, 0.2)',
                    zIndex: 10,
                  }}
                />
              )}
            </div>
          ))}
        </Document>
      </div>

      {/* Правая колонка — Выбранные фрагменты */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', borderLeft: '1px solid #ccc' }}>
        <h2>Выбранные фрагменты</h2>
        {selectedRegions.length === 0 ? (
          <p>Пока нет выбранных областей</p>
        ) : (
          selectedRegions.map((region, i) => (
            <div key={i} style={{ marginBottom: '15px' }}>
              <img src={region.image} alt={`Фрагмент ${i + 1}`} style={{ maxWidth: '100%' }} />
              <p>Страница {region.page}</p>
            </div>
          ))
        )}
        <button onClick={() => alert(JSON.stringify(selectedRegions))}>Применить</button>
        <button onClick={() => setSelectedRegions([])} style={{ marginLeft: '10px' }}>
          Очистить
        </button>
      </div>
    </div>
  );
}

export default App;
