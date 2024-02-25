// React Components
import { createContext, useState } from "react";

const RouteDetailsContext = createContext();

function RouteDetailsProvider({ children }) {    
    const [route, setRoute] = useState([])
    const [chouseRoute, setChousenRoute] = useState({})
    const [departureData, setDepartureData] = useState({})
    const [arrivalData, setArrivalData] = useState({})
    const [departureName, setDepartureName] = useState("SBMG")
    const [arrivalName, setArrivalName] = useState("SBLO")

    return <RouteDetailsContext.Provider value={{
        route, setRoute,
        chouseRoute, setChousenRoute,
        departureData, setDepartureData,
        arrivalData, setArrivalData,        
        departureName, setDepartureName,
        arrivalName, setArrivalName
    }}> {children} </RouteDetailsContext.Provider>
};

export { RouteDetailsContext, RouteDetailsProvider };