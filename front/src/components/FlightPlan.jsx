import React, { useContext, useEffect, useState } from 'react';

// Components
import Input from './form/Input'
import Select from './form/Select';
import SearchAirports from './SearchAirports';
import BrazilMap from './BrazilMap';

// Context
import { DisplayOptionContext } from '../context/DisplayOptionContext';

// Hooks
import useJsonDataProvider from '../hooks/useJsonDataProvider';
import useAirRoutes from '../hooks/useAirRoutes';

// Constants
const URL_ROTAER = '/data/rotaer_completo.json';
const URL_RNAV = '/data/rnav-Brasil.json';
const URL_ATC = '/data/atc-Brasil.json';
const URL_WAYPOINT_RESUME = '/data/some_waypoints_coordinates.json';

const FlightPlan = () => {
    // 1. useState
    // 1.1 Datas    
    const [rotaerData, setRotaerData] = useState({});
    const [rnavData, setRnavData] = useState({})
    const [waypointResumeData, setWaypointResumeData] = useState({})
    const [atcData, setAtcData] = useState({})

    // 1.2 Variables
    const [departure, setDeparture] = useState("SBMG")
    const [arrive, setArrive] = useState("SBLO")
    const [flightLevel, setFlightLevel] = useState()
    const [inputChange, setInputChange] = useState("")
    const [departureCoordinates, setDepartureCoordinates] = useState([])
    const [arriveCoordinates, setArriveCoordinates] = useState([])
    const [route, setRoute] = useState({})
    const [routeDisplay, setRouteDisplay] = useState({ display: "none" })

    // 2. Context
    const { setDisplay } = useContext(DisplayOptionContext)

    // 3. Hook
    const { getJsonData } = useJsonDataProvider();
    const { getRouteUpRight, teste } = useAirRoutes();

    // Initial Functions    
    const constructFlightLevel = (data) => {
        const flightLevel = new Set();

        Object.values(data).forEach(obj => {
            Object.values(obj).forEach(value => {
                Object.values(value).forEach(v => {
                    if (v.upper_limit) {
                        if (!v.upper_limit.includes("°") && !v.upper_limit.includes(" ") && !v.upper_limit.includes("UNL")) {
                            flightLevel.add(v.upper_limit)
                        }
                    }
                })
            })
        });

        let sortedAltitudes = Array.from(flightLevel)
            .map(altitude => parseInt(altitude.replace("FL", "")))
            .sort((a, b) => a - b)
            .map(altitude => "FL" + altitude.toString().padStart(3, "0"));

        sortedAltitudes.push("Sem limite")
        const result = []
        for (let level of sortedAltitudes) {
            const obj = {}
            obj["value"] = level
            obj["label"] = level
            result.push(obj)
        }

        return result
    }


    // 4. useEffect
    useEffect(() => {
        const fetchData = async () => {
            const rotaer = await getJsonData(URL_ROTAER);
            const rnav = await getJsonData(URL_RNAV);
            const atc = await getJsonData(URL_ATC)
            const waypoitResume = await getJsonData(URL_WAYPOINT_RESUME);

            setRotaerData(rotaer);
            setRnavData(rnav);
            setWaypointResumeData(waypoitResume);
            setAtcData(atc);

            const flightLevel = constructFlightLevel({ ...rnav, ...atc })
            setFlightLevel(flightLevel)
        };

        fetchData();
    }, []);

    // 5. Internal Functions

    const getRoute = (departureLatitude, departureLongitude, arriveLatitude, arriveLongitude) => {
        const a = teste(departureLatitude, departureLongitude, arriveLatitude, arriveLongitude, rnavData);

        // Subindo | Direita
        // if (departureLatitude < arriveLatitude && departureLongitude < arriveLongitude) {            
        //     // const a = getRouteUpRight(departureLatitude, departureLongitude, arriveLatitude, arriveLongitude, rnav);            
        //     const a = teste(departureLatitude, departureLongitude, arriveLatitude, arriveLongitude, rnav);
        //     return a;
        // }

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
        // setRouteDisplay({ display: "flex" })

        let departureLatitude, departureLongitude, arriveLatitude, arriveLongitude, departureCity;

        if (!departure) {
            setRouteDisplay({ display: "none" })
            console.log("Falta a saída");
            return;
        }
        if (!arrive) {
            setRouteDisplay({ display: "none" })
            console.log("Falta a chegada");
            return;
        }

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

        if (departureLatitude && arriveLatitude) {
            console.log(departure)

            const route = getRoute(departureLatitude, departureLongitude, arriveLatitude, arriveLongitude)

            // setDepartureCoordinates([departureLatitude, departureLongitude])
            // setArriveCoordinates([arriveLatitude, arriveLongitude])
            // setRoute(route)
        } else {
            console.log("Não foi possível encontrar as coordenadas de partida e chegada.");
        }

        setRouteDisplay({ display: "none" })
    }

    const handleOnChangeDeparture = (event) => {
        setDeparture(event.target.value)
    }

    const handleOnChangeArrive = (event) => {
        setArrive(event.target.value)
    }

    const handleOnChangeFlightLevel = (event) => {
        console.log(event.target.value)
    }

    // Preciso definir a altitude do voo de cruzeiro, com isso da para decidir quais serão os pontos que aceitam essa altura.
    // A logica pra descobrir um traçado de voo pode ser feita pelas vias.
    // Monta um dicionario reduzido com as vias do some_waypoints_coordinates e ai, pegando o fixo de saida 
    // e pegando o fixo de chegada, da para montar um logica em que os pontos unem as vias em comum.
    // Pegando a via em comum, gera um outro dicionario dessa via de ligação com os pontos que serão usados

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

                <Select
                    text="Tipo de voo"
                    name="flight-level"
                    options={flightLevel}
                    handleChange={handleOnChangeFlightLevel}
                />

                <button onClick={handleClickFlightPlan}>Gerar</button>
            </div>

            {/* <SearchAirports
                data={rotaerData}
                setDeparture={setDeparture}
                setArrive={setArrive}
                inputChange={inputChange}
            />

            <BrazilMap
                departureCoordinates={departureCoordinates}
                arriveCoordinates={arriveCoordinates}
                route={route}
                routeDisplay={routeDisplay}
            />

            <h1>SBMG</h1>
            <h1>SBLO</h1> */}
        </main>
    );
};


export default FlightPlan;
