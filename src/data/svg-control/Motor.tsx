import React, {useEffect, useState} from "react";
import {DeviceType} from "../../shared";
import {onValue, ref} from "firebase/database";
import {database} from "../../database";

export const Motor = () => {
    const [active, setActive] = useState();
    useEffect(() =>{
        onValue(ref(database, 'actValues/devices/motor'),(snapshot) =>{
            setActive(snapshot.val());
        });
    },[]);
    return <>
        <svg
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="-51.2 -51.2 614.40 614.40"
            xmlSpace="preserve"
            width="84px"
            height="84px"
            fill="#000000"
        >
            <g id="SVGRepo_bgCarrier" strokeWidth={0}/>
            <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
                stroke="#CCCCCC"
                strokeWidth={10.24}
            />
            <g id="SVGRepo_iconCarrier">
                <rect
                    x={16.696}
                    y={253.797}
                    style={{
                        fill: active ? "#B0B0B0": "#95a5a6" ,
                    }}
                    width={55.786}
                    height={33.391}
                />
                <rect
                    y={211.178}
                    style={{
                        fill: active ? "#8B8B8B" : "#95a5a6",
                    }}
                    width={33.391}
                    height={118.628}
                />
                <path
                    style={{
                        fill: active ? "#67B5F8" : "#95a5a6",
                    }}
                    d="M494.32,196.801l-4.858-8.131h-85.516v39.564h-8.557v-57.371h-44.32l-28.138-24.95h-46.53v-22.695 h14.966V89.828H172.742v33.391h14.966v22.695h-48.443l-28.138,24.95H55.791v199.255h83.474l58.709,52.054h197.414v-58.444h8.557 v39.565h85.516l4.858-8.132c1.81-3.027,17.68-31.537,17.68-99.181S496.13,199.83,494.32,196.801z"
                />
                <path
                    style={{
                        fill: active ? "#3D6DFA" : "#95a5a6",
                    }}
                    d="M494.32,196.801l-4.858-8.131h-85.516v39.564h-8.557v-57.371h-44.32l-28.138-24.95h-46.53v-22.695 h14.966V89.828h-59.312v332.345h163.334v-58.444h8.557v39.565h85.516l4.858-8.132c1.81-3.027,17.68-31.537,17.68-99.181 S496.13,199.83,494.32,196.801z"
                />
                <path
                    style={{
                        fill: "#F1F1F1",
                    }}
                    d="M468.927,369.903h-31.59v-39.565h-75.34v58.444H210.646l-58.709-52.054H89.183V204.255h34.617 l28.138-24.95h35.772H221.1v-33.391v-22.695h21.909v22.695v33.391h33.391h33.858l28.138,24.95h23.601v57.371h75.34v-39.564h31.59 c3.873,11.386,9.681,34.956,9.681,73.921C478.609,334.948,472.801,358.516,468.927,369.903z"
                />
                <path
                    style={{
                        fill: "#D7D7D7",
                    }}
                    d="M468.927,369.903h-31.59v-39.565h-75.34v58.444H232.054V123.22h10.955v22.695v33.391H276.4h33.858 l28.138,24.95h23.601v57.371h75.34v-39.564h31.59c3.873,11.386,9.681,34.956,9.681,73.921 C478.609,334.948,472.801,358.516,468.927,369.903z"
                />
                <polygon
                    style={{
                        fill: "#F4DA49",
                    }}
                    points="247.542,370.834 216.566,358.365 239.4,301.643 175.272,301.643 216.566,199.061 247.542,211.53 224.709,268.252 288.837,268.252 "
                />
                <g>
                    <polygon
                        style={{
                            fill: "#E69824",
                        }}
                        points="247.542,211.53 231.962,205.258 231.962,250.235 "
                    />
                    <polygon
                        style={{
                            fill: "#E69824",
                        }}
                        points="288.837,268.252 231.962,268.252 231.962,301.643 239.4,301.643 231.962,320.122 231.962,364.562 247.542,370.834 "
                    />
                </g>
            </g>
        </svg>
    </>
}
