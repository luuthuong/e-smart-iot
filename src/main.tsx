import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
// eslint-disable-next-line no-undef
const container = document.getElementById('root');
// @ts-ignore
const root = createRoot(container);
root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);
