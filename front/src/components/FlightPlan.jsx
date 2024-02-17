import React, { useContext, useEffect, useState } from 'react';

// Components
import Input from './form/Input'
import Select from './form/Select';
import SearchAirports from './SearchAirports';
import BrazilMap from './BrazilMap';
import Routes from './Routes';

// Context
import { DisplayOptionContext } from '../context/DisplayOptionContext';

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
    const [departure, setDeparture] = useState("SBMG")
    const [arrive, setArrive] = useState("SBLO")

    const [flightLevel, setFlightLevel] = useState("")
    const [flightType, setFlightType] = useState("ATC")
    const [inputChange, setInputChange] = useState("")
    const [departureCoordinates, setDepartureCoordinates] = useState([])

    const [arriveCoordinates, setArriveCoordinates] = useState([])

    const [routes, setRoutes] = useState({})
    const [routesDisplay, setRoutesDisplay] = useState({ display: "none" })

    // 2. Context
    const { setDisplay } = useContext(DisplayOptionContext)

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

    const getRoute = (departureCoordinates, arriveCoordinates) => {
        const departureLatitude = departureCoordinates[0];
        const departureLongitude = departureCoordinates[1];
        const arriveLatitude = arriveCoordinates[0];
        const arriveLongitude = arriveCoordinates[1];

        // Subindo | Direita
        if (departureLatitude < arriveLatitude && departureLongitude < arriveLongitude) {
            return getRouteUpRight(departureCoordinates, arriveCoordinates, flightLevel);
        }

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
        // setRoutesDisplay({ display: "flex" })

        let departureLatitude, departureLongitude, arriveLatitude, arriveLongitude;

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

        if (departureCoordinates && arriveCoordinates) {
            setDepartureCoordinates([departureLatitude, departureLongitude])
            setArriveCoordinates([arriveLatitude, arriveLongitude])

            setRoutes(getRoute(departureCoordinates, arriveCoordinates))

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

            <BrazilMap
                departureCoordinates={departureCoordinates}
                arriveCoordinates={arriveCoordinates}
                routes={routes}
                routesDisplay={routesDisplay}
            />

            <h1>SBMG</h1>
            <h1>SBLO</h1>
        </main>
    );
};


export default FlightPlan;


// // Initial Functions
// const constructFlightLevel = (data) => {
//     const flightLevel = new Set();

//     Object.values(data).forEach(obj => {
//         Object.values(obj).forEach(value => {
//             Object.values(value).forEach(v => {
//                 if (v.upper_limit) {
//                     if (!v.upper_limit.includes("°") && !v.upper_limit.includes(" ") && !v.upper_limit.includes("UNL")) {
//                         flightLevel.add(v.upper_limit)
//                     }
//                 }
//             })
//         })
//     });

//     let sortedAltitudes = Array.from(flightLevel)
//         .map(altitude => parseInt(altitude.replace("FL", "")))
//         .sort((a, b) => a - b)
//         .map(altitude => "FL" + altitude.toString().padStart(3, "0"));

//     sortedAltitudes.push("Sem limite")
//     const result = []
//     for (let level of sortedAltitudes) {
//         const obj = {}
//         obj["value"] = level
//         obj["label"] = level
//         result.push(obj)
//     }

//     return result
// }