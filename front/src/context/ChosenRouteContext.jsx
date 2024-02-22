import { createContext, useState } from "react";

const ChosenRouteContext = createContext();

function ChosenRouteProvider({ children }) {
    const [chosenRoute, setChosenRoute] = useState({})

    return (
        <ChosenRouteContext.Provider value={{ chosenRoute, setChosenRoute }}>
            {children}
        </ChosenRouteContext.Provider>
    );
};

export { ChosenRouteContext, ChosenRouteProvider };
