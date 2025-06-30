import { useState, useEffect } from "react";
import { usePDFStore } from "../../store/store";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import style from "./LeftPanel.module.css";
import SelectedRect from "../SelectedRect/SelectedRect";
import Rect from "../Rect/Rect";
import { sendRect } from "../../api/api";

export default function LeftPanel() {
  const { fileName, pages, selectedRegions, addRegion } = usePDFStore();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    usePDFStore.setState({ pages: new Array(numPages).fill(null) });
  };

  const handlePageLoadSuccess = (pageNumber, canvas) => {
    const context = canvas.getContext("2d");
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
    const x = (event.clientX - rect.left) / scale; // <-- делим на scale
    const y = (event.clientY - rect.top) / scale; // <-- делим на scale
    setSelectionStart({ x, y, pageNum });
    setSelectionEnd(null);
  };

  const drawSelection = (event) => {
    if (!isSelecting || !selectionStart) return;

    const { pageNum } = selectionStart;

    const pageDiv = document.querySelector(`[data-page-number="${pageNum}"]`);
    if (!pageDiv) return;

    const rect = pageDiv.getBoundingClientRect();

    const isInPage =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!isInPage) return;

    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;

    setSelectionEnd({ x, y });
  };

  const endSelection = () => {
    if (!selectionStart || !selectionEnd) {
      setIsSelecting(false);
      return;
    }

    const { x: startX, y: startY, pageNum } = selectionStart;
    const { x: endX, y: endY } = selectionEnd;

    const page = pages[pageNum - 1];
    if (!page || !page.canvas) {
      setIsSelecting(false);
      return;
    }

    let left = Math.min(startX, endX);
    let top = Math.min(startY, endY);
    let width = Math.abs(startX - endX);
    let height = Math.abs(startY - endY);

    const pageWidth = page.canvas.width;
    const pageHeight = page.canvas.height;

    const clampedLeft = Math.max(0, left);
    const clampedTop = Math.max(0, top);
    const clampedRight = Math.min(pageWidth, left + width);
    const clampedBottom = Math.min(pageHeight, top + height);

    const clampedWidth = clampedRight - clampedLeft;
    const clampedHeight = clampedBottom - clampedTop;

    if (clampedWidth <= 0 || clampedHeight <= 0) {
      setIsSelecting(false);
      return;
    }

    const tempCanvas = document.createElement("canvas");
    const tempContext = tempCanvas.getContext("2d");

    tempCanvas.width = clampedWidth;
    tempCanvas.height = clampedHeight;

    const sourceCanvas = page.canvas;
    const pixelRatio = window.devicePixelRatio || 1;

    tempContext.drawImage(
      sourceCanvas,
      clampedLeft * pixelRatio,
      clampedTop * pixelRatio,
      clampedWidth * pixelRatio,
      clampedHeight * pixelRatio,
      0,
      0,
      clampedWidth,
      clampedHeight
    );

    // const selected = {
    //   id: Date.now().toString(),

    //   page: pageNum,
    //   coordinates: {
    //     left: clampedLeft,
    //     top: clampedTop,
    //     width: clampedWidth,
    //     height: clampedHeight,
    //   },
    // };

    const selected = {
      ml_id: Date.now().toString(),
      id: Date.now().toString(),
      page_num: pageNum,
      wh: pageWidth / pageHeight,
      coordinates: {
        left: clampedLeft,
        top: clampedTop,
        width: clampedWidth,
        height: clampedHeight,
      },
      rect: {
        x1: clampedLeft,
        y1: clampedTop,
        x2: clampedLeft + clampedWidth,
        y2: clampedTop + clampedHeight,
      },
      type: "text",
    };

    sendRect(selected)
      .then((res) => {
        const data = res.data;
        const newRect = { content: data.content, ...selected };
        addRegion(newRect);
      })
      .catch((err) => {
        console.log(err);
      });

    setIsSelecting(false);
  };

  const handleWheel = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();

      const zoomStep = 0.5;
      const newScale = parseFloat(
        (scale + (e.deltaY < 0 ? zoomStep : -zoomStep)).toFixed(2)
      );

      setScale(newScale);
    }
  };

  useEffect(() => {
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [scale]);

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
          <div className={style.pageWrapper} key={index}>
            <div
              key={`page_container_${index + 1}`}
              className={style.pageContainer}
            >
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
                scale={scale}
              />

              {selectedRegions
                .filter((region) => region.page_num === index + 1)
                .map((region, idx) => {
                  return (
                    <SelectedRect
                      coordinates={region.coordinates}
                      idx={idx}
                      scale={scale}
                    />
                  );
                })}

              {isSelecting &&
                selectionStart?.pageNum === index + 1 &&
                selectionEnd && (
                  <Rect
                    selectionStart={selectionStart}
                    selectionEnd={selectionEnd}
                    scale={scale}
                  />
                )}
            </div>
          </div>
        ))}
      </Document>
    </div>
  );
}
