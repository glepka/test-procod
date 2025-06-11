import { useState } from 'react';
import { usePDFStore } from '../../store/store';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import s from './LeftPanel.module.css';

export default function LeftPanel() {
  const { fileName, pages, setSelectedRegion } = usePDFStore();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    usePDFStore.setState({ pages: new Array(numPages).fill(null) });
  };

  const handlePageLoadSuccess = (pageNumber, canvas) => {
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    usePDFStore.setState((state) => {
      const newPages = [...state.pages];
      newPages[pageNumber - 1] = { canvas, imageData: imgData };
      return { pages: newPages };
    });
  };

  const startSelection = (e, pageNum) => {
    setIsSelecting(true);
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
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

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    tempCanvas.width = width;
    tempCanvas.height = height;

    const sourceCanvas = page.canvas;
    const pixelRatio = window.devicePixelRatio || 1;

    tempCtx.drawImage(sourceCanvas, left * pixelRatio, top * pixelRatio, width * pixelRatio, height * pixelRatio, 0, 0, width, height);

    const base64Image = tempCanvas.toDataURL('image/png');

    setSelectedRegion({
      image: base64Image,
      page: pageNum,
      coordinates: { left, top, width, height },
    });

    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };
  return (
    <div className={s.leftPanel}>
      <h2>Файл: {fileName}</h2>
      <Document file={fileName} onLoadSuccess={onDocumentLoadSuccess} loading="Загрузка PDF..." error="Ошибка загрузки файла" className={s.document}>
        {Array.from(new Array(numPages), (_, index) => (
          <div key={`page_container_${index + 1}`} className={s.pageContainer}>
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              canvasRef={(canvas) => {
                if (canvas && !pages[index]) {
                  handlePageLoadSuccess(index + 1, canvas);
                }
              }}
              onMouseDown={(e) => startSelection(e, index + 1)}
              onMouseMove={drawSelection}
              onMouseUp={endSelection}
              className={s.pdfPage}
              style={{ border: '1px solid #ccc', marginBottom: '10px' }}
            />

            {isSelecting && selectionStart?.pageNum === index + 1 && selectionEnd && (
              <div
                className={s.selectionOverlay}
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
  );
}
