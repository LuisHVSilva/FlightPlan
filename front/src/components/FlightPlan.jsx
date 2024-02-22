import React, { useContext, useEffect, useState } from 'react';

// Components
import Input from './form/Input'
import Select from './form/Select';
import SearchAirports from './SearchAirports';
import BrazilMap from './BrazilMap';
import RoutesPlan from './RoutesPlan';

// Context
import { DisplayOptionContext } from '../context/DisplayOptionContext';
import { ChosenRouteContext } from '../context/ChosenRouteContext';

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
    const [departure, setDeparture] = useState("SBSP")
    const [arrive, setArrive] = useState("SBGL")

    const [flightLevel, setFlightLevel] = useState("")
    const [flightType, setFlightType] = useState("ATC")
    const [inputChange, setInputChange] = useState("")
    const [departureCoordinatesMap, setDepartureCoordinatesMap] = useState([])
    const [arriveCoordinatesMap, setArriveCoordinatesMap] = useState([])

    const [routes, setRoutes] = useState({})
    const [routesDisplay, setRoutesDisplay] = useState({ display: "none" })

    // 2. Context
    const { setDisplay } = useContext(DisplayOptionContext)
    const { setChosenRoute } = useContext(ChosenRouteContext);

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

    const getCoordinates = () => {
        let departureLatitude, departureLongitude, arriveLatitude, arriveLongitude;

        for (const state in rotaerData) {
            for (let i = 0; i < rotaerData[state].length; i++) {
                if (departure === Object.keys(rotaerData[state][i])[0]) {
                    const departureData = rotaerData[state][i][departure];
                    departureLatitude = departureData.latitude;
                    departureLongitude = departureData.longitude;
                }

                if (arrive === Object.keys(rotaerData[state][i])[0]) {
                    const arriveData = rotaerData[state][i][arrive];
                    arriveLatitude = arriveData.latitude;
                    arriveLongitude = arriveData.longitude;
                }
            }
        }

        return {
            departureCoordinates: [departureLatitude, departureLongitude],
            arriveCoordinates: [arriveLatitude, arriveLongitude]
        }
    }

    const getRoute = (departureCoordinates, arriveCoordinates) => {
        const departureLatitude = departureCoordinates[0];
        const departureLongitude = departureCoordinates[1];
        const arriveLatitude = arriveCoordinates[0];
        const arriveLongitude = arriveCoordinates[1];

        const route = getRouteUpRight(departureCoordinates, arriveCoordinates, flightLevel);        
        return route;

        // Subindo | Direita        
        // if (departureLatitude < arriveLatitude && departureLongitude < arriveLongitude)

        // Subindo | Esquerda
        // if (departureLatitude < arriveLatitude && departureLongitude > arriveLongitude)

        // Descendo | Direita
        // if (departureLatitude > arriveLatitude && departureLongitude < arriveLongitude)
        // Descendo | Esquerda
        // if (departureLatitude < arriveLatitude && departureLongitude > arriveLongitude)

        // Subindo | Mesma linha horizontal
        // if (departureLatitude < arriveLatitude && departureLongitude == arriveLongitude)
        // Descendo | Mesma linha horizontal
        // if (departureLatitude > arriveLatitude && departureLongitude == arriveLongitude)

        // Mesma linha vertical | Direita
        // if (departureLatitude == arriveLatitude && departureLongitude < arriveLongitude)
        // Mesma linha vertical | Esquerda
        // if (departureLatitude == arriveLatitude && departureLongitude > arriveLongitude)

        // Mesma linha vertical | mesma linha vertical -> Erro (Mesmo ponto não da pra voar)
        // if (departureLatitude == arriveLatitude && departureLongitude == arriveLongitude)        

    }

    const handleClickSearchButton = (event) => {
        setDisplay({ display: "block" })
        setInputChange(event.target.parentNode.id)
    }

    const handleClickFlightPlan = () => {
        setRoutesDisplay({ display: "flex" })



        if (!departure) {
            setRoutesDisplay({ display: "none" })
            console.log("Falta a saída");
            return;
        }

        if (!arrive) {
            setRoutesDisplay({ display: "none" })
            console.log("Falta a chegada");
            return;
        }

        const { departureCoordinates, arriveCoordinates } = getCoordinates();

        if (departureCoordinates, arriveCoordinates) {
            const route = getRoute(departureCoordinates, arriveCoordinates);
            setRoutes(route);
            setChosenRoute(route[0])
            setDepartureCoordinatesMap(departureCoordinates);
            setArriveCoordinatesMap(arriveCoordinates);

        } else {
            console.log("Não foi possível encontrar as coordenadas de partida e chegada.");
        }

        setRoutesDisplay({ display: "none" })
    }

    const handleOnChangeDeparture = (event) => {
        setDeparture(event.target.value)
    }

    const handleOnChangeArrive = (event) => {
        setArrive(event.target.value)
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
                    value={departure}
                    search={true}
                    handleOnChange={handleOnChangeDeparture}
                    searchButton={handleClickSearchButton}
                />

                <Input
                    text="Chegada:"
                    name="arrive"
                    type="text"
                    minLength="4"
                    maxLength="4"
                    value={arrive}
                    search={true}
                    handleOnChange={handleOnChangeArrive}
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
                setDeparture={setDeparture}
                setArrive={setArrive}
                inputChange={inputChange}
            />
            <section className="map-plan">
                <BrazilMap
                    departureCoordinates={departureCoordinatesMap}
                    arriveCoordinates={arriveCoordinatesMap}                    
                    routesDisplay={routesDisplay}
                />

                {routes && Object.keys(routes).length > 0 &&
                    <RoutesPlan
                        routes={routes}
                    />
                }
            </section>
        </main>
    );
};


export default FlightPlan;