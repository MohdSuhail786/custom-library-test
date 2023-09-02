import React from 'react';
import { RecoilRoot } from "recoil";
import RecoilNexus from "recoil-nexus";
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { RecoilDebugObserver } from './debug/RecoilDebugObserver';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode>
    <RecoilRoot>
      <RecoilDebugObserver />
      <RecoilNexus />
      <App />
    </RecoilRoot>
  // </React.StrictMode>
);
