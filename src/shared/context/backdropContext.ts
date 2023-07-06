import {createContext, Dispatch, SetStateAction} from "react";

export const BackDropContext = createContext<Dispatch<SetStateAction<boolean>> | null>(null);
