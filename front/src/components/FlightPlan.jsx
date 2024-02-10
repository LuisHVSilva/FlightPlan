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
const URL_WAYPOINT_RESUME = '/data/some_waypoints_coordinates.json';

const FlightPlan = () => {
    // 1. useState
    // 1.1 Datas    
    const [jsonData, setJsonData] = useState({});
    const [rnav, setRnav] = useState({})
    const [waypointResume, setWaypointResume] = useState({})

    // 1.2 Variables
    const [departure, setDeparture] = useState("SBMG")
    const [arrive, setArrive] = useState("SBLO")
    const [flightLevel, setFlightLevel] = useState()
    const [inputChange, setInputChange] = useState("")
    const [departureCoordinates, setDepartureCoordinates] = useState([])
    const [arriveCoordinates, setArriveCoordinates] = useState([])
    const [route, setRoute] = useState({})

    // 2. Context
    const { setDisplay } = useContext(DisplayOptionContext)

    // 3. Hook
    const { getJsonData } = useJsonDataProvider();
    const { getRouteUpRight } = useAirRoutes();

    // 4. useEffect
    useEffect(() => {
        const fetchData = async () => {
            const data = await getJsonData(URL_ROTAER);
            const rnavData = await getJsonData(URL_RNAV);
            const waypoitResumeData = await getJsonData(URL_WAYPOINT_RESUME);
            setJsonData(data);
            setRnav(rnavData);
            setWaypointResume(waypoitResumeData);
        };

        fetchData();
    }, []);

    // 5. Internal Functions
    const getRoute = () => {
        
        // Saida - chegada:
        const departureLatitude = departureCoordinates[0]
        const departureLongitude = departureCoordinates[1]
        const arriveLatitude = arriveCoordinates[0]
        const arriveLongitude = arriveCoordinates[1]

        // Subindo | Direita
        if (departureLatitude < arriveLatitude && departureLongitude < arriveLongitude) {
            // const departureVia = getDepartureViaUpRight(departureLatitude, departureLongitude, arriveLatitude, arriveLongitude)            
            const a = getRouteUpRight(departure, departureCoordinates, arrive, arriveCoordinates, rnav);            
            setRoute(a);
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
        const findCoordinates = (icao) => {
            for (const state in jsonData) {
                for (let i = 0; i < jsonData[state].length; i++) {
                    if (icao === Object.keys(jsonData[state][i])[0]) {
                        const { latitude, longitude } = jsonData[state][i][icao];                        
                        return [latitude, longitude];
                    }
                }
            }
            return null; // Retorna null se não encontrar as coordenadas
        };

        if (departure.length >= 3) {
            const departureCoordinates = findCoordinates(departure);
            if (departureCoordinates) {
                setDepartureCoordinates(departureCoordinates);
            } else {
                // Tratar o caso em que o icao de partida não foi encontrado
                console.log('Partida não encontrada');
            }
        }

        if (departure.length == 0) {
            setDepartureCoordinates([])
        }

        if (arrive.length >= 3) {
            const arriveCoordinates = findCoordinates(arrive);
            if (arriveCoordinates) {
                setArriveCoordinates(arriveCoordinates);
            } else {
                // Tratar o caso em que o icao de chegada não foi encontrado
                console.log('Chegada não encontrada');
            }
        }

        if (arrive.length == 0) {
            setArriveCoordinates([])
        }        

        if (departureCoordinates.length > 0 && arriveCoordinates.length > 0) {
            getRoute()
        }
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
                    options={[{ value: "fl-high", label: "Voo de alta altitude" }, { value: "fl-low", label: "Voo de baixa altitude" }]}
                    handleChange={handleOnChangeFlightLevel}
                />

                <button onClick={handleClickFlightPlan}>Gerar</button>
            </div>

            <SearchAirports
                data={jsonData}
                setDeparture={setDeparture}
                setArrive={setArrive}
                inputChange={inputChange}
            />

            <BrazilMap departureCoordinates={departureCoordinates} arriveCoordinates={arriveCoordinates} route={route} />
        </main>
    );
};


export default FlightPlan;
