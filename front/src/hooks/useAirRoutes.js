import { useEffect, useState } from "react";
import AeroMath from "../Utils/AeroMath";
import FlightNavigator from "../Utils/FlightNavigator";
import TypeChecker from "../Utils/TypeChecker";

// Hooks
import useDataManipulation from "./useDataManipulation";
import useJsonDataProvider from "./useJsonDataProvider";

// Constants
const URL_RNAV = '/data/rnav-Brasil.json';
const URL_ATC = '/data/atc-Brasil.json';
const URL_WAYPOINT_RESUME = '/data/some_waypoints_coordinates.json';

const useAirRoutes = () => {
    const [rnavData, setRnavData] = useState({})
    const [atcData, setAtcData] = useState({})
    const [waypointResumeData, setWaypointResumeData] = useState({})
    const { getJsonData } = useJsonDataProvider();
    const { flightLevelChange, containsSameElement, findIndexOfObject, sliceObject, sortByDistance } = useDataManipulation();

    // 4. useEffect
    useEffect(() => {
        const fetchData = async () => {
            const rnav = await getJsonData(URL_RNAV);
            const atc = await getJsonData(URL_ATC)
            const waypoitResume = await getJsonData(URL_WAYPOINT_RESUME);

            setRnavData(rnav);
            setWaypointResumeData(waypoitResume);
            setAtcData(atc);
        };

        fetchData();
    }, []);


    // Internal functions
    function commonWaypoint(departureWaypointCoordinates, arrivalWaypointCoordinates, departureWaypoints, arrivalWaypoints, departureVia, arrivalVia, firstWaypoint, firstWaypointValues, lastWaypoint, lastWaypointValues) {
        const cwf = containsSameElement(Object.keys(departureWaypoints), Object.keys(arrivalWaypoints));



        if (cwf) {
            const cwfRoute = {};
            const { latitude: cwfLatitude, longitude: cwfLongitude } = departureWaypoints[cwf];

            // Calcular a distancia entre o primeiro e o ultimo ponto
            const departureToArrivalDistance = new AeroMath(departureWaypointCoordinates, arrivalWaypointCoordinates).haversineDistance()

            // Distancia entre o ponto em comum e o aeroporto de saida
            const cwfDepartureDistance = new AeroMath(departureWaypointCoordinates, [cwfLatitude, cwfLongitude]).haversineDistance();

            if (cwfDepartureDistance > departureToArrivalDistance) {
                return false
            }

            // Departure
            // const cwfDepartureDistance = new AeroMath(departureWaypointCoordinates, [cwfLatitude, cwfLongitude]).haversineDistance();
            for (const waypointName in departureWaypoints) {
                const waypointValue = departureWaypoints[waypointName];
                const { latitude, longitude } = waypointValue
                const waypointDistance = new AeroMath(departureWaypointCoordinates, [latitude, longitude]).haversineDistance();

                if (waypointDistance <= cwfDepartureDistance) {
                    cwfRoute[departureVia] = { ...cwfRoute[departureVia], [waypointName]: waypointValue }
                }
            }

            // Arrival
            // Distancia entre o ponto em comum e o aeroporto de chegada
            const cwfArrivalDistance = new AeroMath(arrivalWaypointCoordinates, [cwfLatitude, cwfLongitude]).haversineDistance();
            for (const waypointName in arrivalWaypoints) {
                const waypointValue = arrivalWaypoints[waypointName];
                const { latitude, longitude } = waypointValue
                const waypointDistance = new AeroMath(arrivalWaypointCoordinates, [latitude, longitude]).haversineDistance();

                if (waypointDistance <= cwfArrivalDistance) {
                    cwfRoute[arrivalVia] = { ...cwfRoute[arrivalVia], [waypointName]: waypointValue }
                }
            }


            // Adicionando ponto de partida e ponto chegada nas aerovias
            if (departureVia != arrivalVia) {
                cwfRoute[departureVia] = { ...cwfRoute[departureVia], [firstWaypoint]: firstWaypointValues[firstWaypoint] }
                cwfRoute[departureVia] = sortByDistance(firstWaypointValues[firstWaypoint], cwfRoute[departureVia])
                cwfRoute[arrivalVia] = { ...cwfRoute[arrivalVia], [lastWaypoint]: lastWaypointValues[lastWaypoint] }
                cwfRoute[arrivalVia] = sortByDistance(cwfRoute[arrivalVia][cwf], cwfRoute[arrivalVia])
            }

            if (departureVia === arrivalVia) {
                cwfRoute[departureVia] = { ...cwfRoute[departureVia], [firstWaypoint]: firstWaypointValues[firstWaypoint] }
                cwfRoute[arrivalVia] = { ...cwfRoute[arrivalVia], [lastWaypoint]: lastWaypointValues[lastWaypoint] }
                cwfRoute[departureVia] = sortByDistance(firstWaypointValues[firstWaypoint], cwfRoute[departureVia])
            }

            return cwfRoute;
        }

        return false
    }

    function groupRoutesByDirections(viaOptions, viasNames, aid, originCoordinates) {
        const viaOptionsUp = [];
        const viaOptionsDown = [];

        for (const via of viasNames) {
            const targetKey = Object.values(viaOptions[via].find(obj => Object.keys(obj).includes(aid)))[0];
            const targetKeyIndex = findIndexOfObject(viaOptions[via], aid);
            const targetKeyLength = viaOptions[via].length
            const targetKeyTrackMag = parseFloat(targetKey.track_mag)
            const targetKeyReverseTrackMag = parseInt(targetKey.rev_track_mag)

            if ("direction_of_cruising_levels_odd" in targetKey) {
                const nextWaypointIndex = targetKeyIndex + 1;
                const previousWaypointIndex = targetKeyIndex - 1;
                const nextWaypoint = new FlightNavigator(viaOptions[via][nextWaypointIndex])

                // Verificar se a via pode ir na direção do track Mag                
                if (targetKey.direction_of_cruising_levels_odd.includes("↓")) {
                    // A função serve para calcular o cenario de a aeronave estar voltando para o ponto de partida. Deve ser o mesmo que a aeronave saindo e indo para o segundo waypoint.
                    let internalVia = null

                    if (nextWaypoint.isMagneticVariationAcceptable(originCoordinates, targetKeyTrackMag)) {
                        internalVia = sliceObject(viaOptions[via], targetKeyIndex, targetKeyLength);
                    } else {
                        internalVia = sliceObject(viaOptions[via], previousWaypointIndex, targetKeyLength);
                    }

                    if (Object.keys(internalVia).length) {
                        viaOptionsDown.push({ via: via, waypoints: internalVia })
                    }
                }

                // // Verificar se a via pode ir na direção do Reverse Track Mag
                if (targetKey.direction_of_cruising_levels_odd.includes("↑")) {
                    let internalVia = null
                    if (nextWaypoint.isMagneticVariationAcceptable(originCoordinates, targetKeyReverseTrackMag)) {
                        internalVia = sliceObject(viaOptions[via], -1, nextWaypointIndex);
                    } else {
                        internalVia = sliceObject(viaOptions[via], -1, targetKeyIndex);

                    }

                    if (Object.keys(internalVia).length > 0) {
                        viaOptionsUp.push({ via: via, waypoints: internalVia })
                    }
                }
            }
        }

        return {
            viaOptionsUp: viaOptionsUp,
            viaOptionsDown: viaOptionsDown
        };
    }

    function updateRouteData(obj, waypointName, viaName, value) {
        if (!obj.hasOwnProperty(waypointName)) {
            obj[[waypointName]] = { [viaName]: value };
        } else {
            obj[[waypointName]][[viaName]] = value;
        }

        return
    }

    function processWaypoint(departureCoordinates, arrivalCoordinates, flightLevel, data) {
        let departureDistance = Infinity;
        let departureWaypointName = null;
        let departureWaypointCoordinates = null;

        let arrivalDistance = Infinity;
        let arrivalWaypointName = null;
        let arrivalWaypointCoordinates = null;

        const departureRoutes = {};
        const arrivalRoutes = {}

        Object.keys(data).forEach(viaName => {
            Object.values(data[viaName]).forEach(value => {
                let waypoint = Object.keys(value);

                const latitude = value[waypoint].latitude;
                const isFloatLatitude = new TypeChecker().isFloat(latitude);

                const longitude = value[waypoint].longitude;
                const isFloatLongitude = new TypeChecker().isFloat(longitude);

                const upperLimite = flightLevelChange(value[waypoint].upper_limit);
                const lowerLimite = flightLevelChange(value[waypoint].lower_limit);

                if (isFloatLatitude && isFloatLongitude) {
                    const newDepartureDistance = new AeroMath(departureCoordinates, [latitude, longitude]).haversineDistance();
                    const newArrivalDistance = new AeroMath(arrivalCoordinates, [latitude, longitude]).haversineDistance();

                    if (flightLevel != Infinity) {
                        if (newDepartureDistance <= departureDistance && flightLevel > lowerLimite && flightLevel < upperLimite) {
                            departureDistance = newDepartureDistance
                            departureWaypointName = waypoint[0]

                            const { latitude, longitude } = value[departureWaypointName]
                            departureWaypointCoordinates = [latitude, longitude]

                            updateRouteData(departureRoutes, departureWaypointName, viaName, Object.values(data[viaName]))
                        }

                        if (newArrivalDistance <= arrivalDistance && flightLevel > lowerLimite && flightLevel < upperLimite) {
                            arrivalDistance = newArrivalDistance
                            arrivalWaypointName = waypoint[0]

                            const { latitude, longitude } = value[arrivalWaypointName]
                            arrivalWaypointCoordinates = [latitude, longitude]

                            updateRouteData(arrivalRoutes, arrivalWaypointName, viaName, Object.values(data[viaName]))
                        }
                    } else {
                        if (newDepartureDistance <= departureDistance) {
                            departureDistance = newDepartureDistance
                            departureWaypointName = waypoint[0]

                            const { latitude, longitude } = value[departureWaypointName]
                            departureWaypointCoordinates = [latitude, longitude]

                            updateRouteData(departureRoutes, departureWaypointName, viaName, Object.values(data[viaName]))
                        }

                        if (newArrivalDistance <= arrivalDistance) {
                            arrivalDistance = newArrivalDistance
                            arrivalWaypointName = waypoint[0]

                            const { latitude, longitude } = value[arrivalWaypointName]
                            arrivalWaypointCoordinates = [latitude, longitude]

                            updateRouteData(arrivalRoutes, arrivalWaypointName, viaName, Object.values(data[viaName]))
                        }
                    }
                }
            })
        })

        return {
            departureRoutes: departureRoutes[departureWaypointName],
            departureWaypointName: departureWaypointName,
            departureWaypointCoordinates: departureWaypointCoordinates,

            arrivalRoutes: arrivalRoutes[arrivalWaypointName],
            arrivalWaypointName: arrivalWaypointName,
            arrivalWaypointCoordinates: arrivalWaypointCoordinates
        }
    }

    // External Functions
    const getRouteUpRight = (departureCoordinates, arrivalCoordinates, flightLevel) => {
        // console.clear()
        flightLevel = flightLevelChange(flightLevel);

        const { departureRoutes: departureViaOptions,
            departureWaypointName: firstWaypoint,
            departureWaypointCoordinates,
            arrivalRoutes: arrivalViaOptions,
            arrivalWaypointName: lastWaypoint,
            arrivalWaypointCoordinates } = processWaypoint(departureCoordinates, arrivalCoordinates, flightLevel, rnavData);

        console.log(firstWaypoint)
        // Pegar todas as vias de cada que passam nos fixos de saida e de chegada
        const departureViasNames = Object.keys(departureViaOptions);
        const arrivalViasNames = Object.keys(arrivalViaOptions);

        // Separar as vias de acordo com suas direções.
        // // Aeroporto de saida
        const { viaOptionsUp: departureViaOptionsUp, viaOptionsDown: departureViaOptionsDown } = groupRoutesByDirections(departureViaOptions, departureViasNames, firstWaypoint, departureCoordinates);
        const departureOptions = {
            up: departureViaOptionsUp,
            down: departureViaOptionsDown
        }

        // Aeroporto de chegada
        const { viaOptionsUp: arrivalViaOptionsUp, viaOptionsDown: arrivalViaOptionsDown } = groupRoutesByDirections(arrivalViaOptions, arrivalViasNames, lastWaypoint, arrivalCoordinates);
        const arrivalOptions = {
            up: arrivalViaOptionsUp,
            down: arrivalViaOptionsDown
        }

        const routes = []        
        for (const departureObject of departureOptions.up) {
            const departureVia = departureObject.via;
            const departureWaypoints = departureObject.waypoints;
            const firstWaypointValues = Object.values(departureViaOptions[departureVia]).find(option => { return Object.keys(option).includes(firstWaypoint) });
            for (const arrivalObject of arrivalOptions.up) {
                const arrivalVia = arrivalObject.via;
                const arrivalWaypoints = arrivalObject.waypoints;
                const lastWaypointValues = Object.values(arrivalViaOptions[arrivalVia]).find(option => { return Object.keys(option).includes(lastWaypoint) });

                // Pegar ponto em comum entre a via do departure e a do arrival
                const cwp = commonWaypoint(departureWaypointCoordinates, arrivalWaypointCoordinates, departureWaypoints, arrivalWaypoints, departureVia, arrivalVia, firstWaypoint, firstWaypointValues, lastWaypoint, lastWaypointValues)

                if (cwp) {                    
                    routes.push(cwp)
                }
            }

            for (const arrivalObject of arrivalOptions.down) {
                const arrivalVia = arrivalObject.via;
                const arrivalWaypoints = arrivalObject.waypoints;
                const lastWaypointValues = Object.values(arrivalViaOptions[arrivalVia]).find(option => { return Object.keys(option).includes(lastWaypoint) });

                // Pegar ponto em comum entre a via do departure e a do arrival
                const cwp = commonWaypoint(departureWaypointCoordinates, arrivalWaypointCoordinates, departureWaypoints, arrivalWaypoints, departureVia, arrivalVia, firstWaypoint, firstWaypointValues, lastWaypoint, lastWaypointValues)

                if (cwp) {                    
                    routes.push(cwp)
                }
            }
        }

        for (const departureObject of departureOptions.down) {
            // Operações para opções de partida para baixo
            const departureVia = departureObject.via;
            const departureWaypoints = departureObject.waypoints;
            const firstWaypointValues = Object.values(departureViaOptions[departureVia]).find(option => { return Object.keys(option).includes(firstWaypoint) });

            for (const arrivalObject of arrivalOptions.up) {
                // Operações para opções de chegada para cima                
                const arrivalVia = arrivalObject.via;
                const arrivalWaypoints = arrivalObject.waypoints;
                const lastWaypointValues = Object.values(arrivalViaOptions[arrivalVia]).find(option => { return Object.keys(option).includes(lastWaypoint) });

                // Pegar ponto em comum entre a via do departure e a do arrival
                const cwp = commonWaypoint(departureWaypointCoordinates, arrivalWaypointCoordinates, departureWaypoints, arrivalWaypoints, departureVia, arrivalVia, firstWaypoint, firstWaypointValues, lastWaypoint, lastWaypointValues)

                if (cwp) {                    
                    routes.push(cwp)
                }
            }

            for (const arrivalObject of arrivalOptions.down) {
                // Operações para opções de chegada para baixo                
                const arrivalVia = arrivalObject.via;
                const arrivalWaypoints = arrivalObject.waypoints;
                const lastWaypointValues = Object.values(arrivalViaOptions[arrivalVia]).find(option => { return Object.keys(option).includes(lastWaypoint) });

                // Pegar ponto em comum entre a via do departure e a do arrival
                const cwp = commonWaypoint(departureWaypointCoordinates, arrivalWaypointCoordinates, departureWaypoints, arrivalWaypoints, departureVia, arrivalVia, firstWaypoint, firstWaypointValues, lastWaypoint, lastWaypointValues)

                if (cwp) {                    
                    routes.push(cwp)
                }
            }
        }        

        return routes;
    }


    return { getRouteUpRight }
}

export default useAirRoutes