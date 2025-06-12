import { useState } from 'react';
import { usePDFStore } from '../../store/store';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import style from './LeftPanel.module.css';

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
    const context = canvas.getContext('2d');
    const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    usePDFStore.setState((state) => {
      const newPages = [...state.pages];
      newPages[pageNumber - 1] = { canvas, imageData: imgData };
      return { pages: newPages };
    });
  };

  const startSelection = (event, pageNum) => {
    setIsSelecting(true);
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setSelectionStart({ x, y, pageNum });
    setSelectionEnd(null);
  };

  const drawSelection = (event) => {
    if (!isSelecting) return;
    const rect = event.target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
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
    const tempContext = tempCanvas.getContext('2d');

    tempCanvas.width = width;
    tempCanvas.height = height;

    const sourceCanvas = page.canvas;
    const pixelRatio = window.devicePixelRatio || 1;

    tempContext.drawImage(sourceCanvas, left * pixelRatio, top * pixelRatio, width * pixelRatio, height * pixelRatio, 0, 0, width, height);

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
    <div className={style.leftPanel}>
      <h2>Файл: {fileName}</h2>
      <Document
        file={fileName}
        onLoadSuccess={onDocumentLoadSuccess}
        loading="Загрузка PDF..."
        error="Ошибка загрузки файла"
        className={style.document}
      >
        {Array.from(new Array(numPages), (_, index) => (
          <div key={`page_container_${index + 1}`} className={style.pageContainer}>
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
              className={style.pdfPage}
            />

            {isSelecting && selectionStart?.pageNum === index + 1 && selectionEnd && (
              <div
                className={style.selectionOverlay}
                style={{
                  left: `${Math.min(selectionStart.x, selectionEnd.x)}px`,
                  top: `${Math.min(selectionStart.y, selectionEnd.y)}px`,
                  width: `${Math.abs(selectionStart.x - selectionEnd.x)}px`,
                  height: `${Math.abs(selectionStart.y - selectionEnd.y)}px`,
                }}
              />
            )}
          </div>
        ))}
      </Document>
    </div>
  );
}
