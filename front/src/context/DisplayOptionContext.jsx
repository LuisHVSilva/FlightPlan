// React Components
import { createContext, useState } from "react";

const DisplayOptionContext = createContext();

function DisplayOptionProvider({ children }) {
    const [display, setDisplay] = useState({display: 'none'})

    return <DisplayOptionContext.Provider value={{ display, setDisplay }}> {children} </DisplayOptionContext.Provider>
};

export { DisplayOptionContext, DisplayOptionProvider };