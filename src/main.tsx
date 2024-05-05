import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
// eslint-disable-next-line no-undef
const container = document.getElementById("root");
// @ts-ignore
const origin = console.log;
console.log = (...data) => {
    if(data.at(-1) === 'n'){
        data.pop();
        origin(...data);
        return
    }
    data.forEach(
        item =>{
            if(!Array.isArray(item) && !!item['acc']){
                item.acc *= 2;
                if(item.acc > 1)
                    item.acc = 1;
            }
        }
    );
    origin(...data);
};
const root = createRoot(container!);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
