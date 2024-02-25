import React, { useContext, useEffect, useState } from 'react';

// Components
import Input from './form/Input'
import Select from './form/Select';
import SearchAirports from './SearchAirports';
import BrazilMap from './BrazilMap';
import RoutesPlan from './RoutesPlan';

// Context
import { DisplayOptionContext } from '../context/DisplayOptionContext';
import { RouteDetailsContext } from '../context/RouteDetailsCountext';

// Hooks
import useJsonDataProvider from '../hooks/useJsonDataProvider';
import useAirRoutes from '../hooks/useAirRoutes';

// Constants
const URL_ROTAER = '/data/rotaer_completo.json';

const FlightPlan = () => {
    // 1. useState
    // 1.1 Datas    
    const [rotaerData, setRotaerData] = useState({});

    // 1.2 Variables    
    const [departureCoordinates, setDepartureCoordinates] = useState([])
    const [arrivalCoordinates, setArrivalCoordinates] = useState([])

    const [flightLevel, setFlightLevel] = useState("")
    const [flightType, setFlightType] = useState("RNAV")
    const [inputChange, setInputChange] = useState("")
    const [routesDisplay, setRoutesDisplay] = useState({ display: "none" })

    // 2. Context
    const { setDisplay } = useContext(DisplayOptionContext)
    const { departureName, setDepartureName, arrivalName, setArrivalName, setRoute, setChousenRoute } = useContext(RouteDetailsContext)    


    // 3. Hook
    const { getJsonData } = useJsonDataProvider();
    const { getRouteUpRight } = useAirRoutes();

    // 4. useEffect
    useEffect(() => {
        const fetchData = async () => {
            const rotaer = await getJsonData(URL_ROTAER);

            setRotaerData(rotaer);
        };

        fetchData();
    }, []);

    // 5. Internal Functions

    const getRoute = (departureCoordinates, arrivalCoordinates) => {

        const route = getRouteUpRight(departureCoordinates, arrivalCoordinates, flightLevel);
        return route;

        // Subindo | Direita        
        // if (departureLatitude < arrivalLatitude && departureLongitude < arrivalLongitude)

        // Subindo | Esquerda
        // if (departureLatitude < arrivalLatitude && departureLongitude > arrivalLongitude)

        // Descendo | Direita
        // if (departureLatitude > arrivalLatitude && departureLongitude < arrivalLongitude)
        // Descendo | Esquerda
        // if (departureLatitude < arrivalLatitude && departureLongitude > arrivalLongitude)

        // Subindo | Mesma linha horizontal
        // if (departureLatitude < arrivalLatitude && departureLongitude == arrivalLongitude)
        // Descendo | Mesma linha horizontal
        // if (departureLatitude > arrivalLatitude && departureLongitude == arrivalLongitude)

        // Mesma linha vertical | Direita
        // if (departureLatitude == arrivalLatitude && departureLongitude < arrivalLongitude)
        // Mesma linha vertical | Esquerda
        // if (departureLatitude == arrivalLatitude && departureLongitude > arrivalLongitude)

        // Mesma linha vertical | mesma linha vertical -> Erro (Mesmo ponto não da pra voar)
        // if (departureLatitude == arrivalLatitude && departureLongitude == arrivalLongitude)        

    }

    const handleClickSearchButton = (event) => {
        setDisplay({ display: "block" })
        setInputChange(event.target.parentNode.id)
    }

    const handleClickFlightPlan = () => {
        setRoutesDisplay({ display: "flex" })
        console.clear()

        if (!departureName || !arrivalName) {
            console.error("Completar campo de saida e de chegada")
        }

        // Procurando os dados do aeroporto de saida e de chegada
        let departureData = null
        let arrivalData = null

        for (const state in rotaerData) {
            for (const icao in rotaerData[state]) {
                if (icao === departureName) {
                    departureData = rotaerData[state][icao];
                }

                if (icao === arrivalName) {
                    arrivalData = rotaerData[state][icao];
                }
            }
        }

        if (!departureData) {
            console.error("Aeroporto de saida não encontrado")
        }

        if (!arrivalData) {
            console.error("Aeroporto de chegada não encontrado")
        }

        const { latitude: departureLatitude, longitude: departureLongitude } = departureData
        const { latitude: arrivalLatitude, longitude: arrivalLongitude } = arrivalData

        setDepartureCoordinates([departureLatitude, departureLongitude]);
        setArrivalCoordinates([arrivalLatitude, arrivalLongitude]);
        const allRoutes = getRoute([departureLatitude, departureLongitude], [arrivalLatitude, arrivalLongitude])

        setRoute(allRoutes)
        setChousenRoute(allRoutes[0])
        setRoutesDisplay({ display: "none" })
    }

    const handleOnChangeDeparture = (event) => {
        setDepartureName(event.target.value)
    }

    const handleOnChangeArrival = (event) => {
        setArrivalName(event.target.value)
    }

    const handleOnChangeFlightLevel = (event) => {
        setFlightLevel(event.target.value)
    }

    const handleOnChangeFlightType = (event) => {
        setFlightType(event.target.value)
    }

    return (
        <main id="flight-plan">
            <div className="flight-options">
                <Input
                    text="Partida:"
                    name="departure"
                    type="text"
                    minLength="4"
                    maxLength="4"
                    value={departureName}
                    search={true}
                    handleOnChange={handleOnChangeDeparture}
                    searchButton={handleClickSearchButton}
                />

                <Input
                    text="Chegada:"
                    name="arrival"
                    type="text"
                    minLength="4"
                    maxLength="4"
                    value={arrivalName}
                    search={true}
                    handleOnChange={handleOnChangeArrival}
                    searchButton={handleClickSearchButton}
                />

                <Input
                    text="Altura de cruzeiro:"
                    name="flight-level"
                    type="text"
                    value={flightLevel}
                    handleOnChange={handleOnChangeFlightLevel}
                />

                <Select
                    text="Tipo de voo"
                    name="flight-type"
                    options={[{ value: "rnav", label: "Voo RNAV" }, { value: "atc", label: "Voo ATC" }]}
                    handleChange={handleOnChangeFlightType}
                />

                <button onClick={handleClickFlightPlan}>Gerar</button>
            </div>

            <SearchAirports
                data={rotaerData}
                inputChange={inputChange}
            />
            <section className="map-plan">
                <BrazilMap
                    departureCoordinates={departureCoordinates}
                    arrivalCoordinates={arrivalCoordinates}
                    routesDisplay={routesDisplay}
                />

                <RoutesPlan />
            </section>
        </main>
    );
};


export default FlightPlan;