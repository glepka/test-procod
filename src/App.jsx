import React, { useState } from 'react';
import { usePDFStore } from './store/store';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import LeftPanel from './components/LeftPanel/LeftPanel';
import RightPanel from './components/RightPanel/RightPanel';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const App = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <LeftPanel />
      <RightPanel />
    </div>
  );
};

export default App;
