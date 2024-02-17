import { useEffect, useState } from "react";
import Distance from "../Utils/Distance";
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
    const processWaypoint = (departureCoordinates, arriveCoordinates, flightLevel, data) => {
        let departureDistance = Infinity;
        let arriveDistance = Infinity;
        let closestAid = { "departure": [], "arrive": [] }
        let departureAidName = null;
        let arriveAidName = null

        Object.keys(data).forEach(dataKeys => {
            Object.values(data[dataKeys]).forEach(value => {
                let waypoint = Object.keys(value);

                const latitude = value[waypoint].latitude;
                const isFloatLatitude = new TypeChecker().isFloat(latitude);

                const longitude = value[waypoint].longitude;
                const isFloatLongitude = new TypeChecker().isFloat(longitude);

                const upperLimite = flightLevelChange(value[waypoint].upper_limit);
                const lowerLimite = flightLevelChange(value[waypoint].lower_limit);

                if (isFloatLatitude && isFloatLongitude) {
                    const newDepartureDistance = new Distance(departureCoordinates, [latitude, longitude]).haversineDistance();
                    const newArriveDistance = new Distance(arriveCoordinates, [latitude, longitude]).haversineDistance();
                    if (flightLevel != Infinity) {

                        if (newDepartureDistance <= departureDistance && flightLevel > lowerLimite && flightLevel < upperLimite) {
                            departureDistance = newDepartureDistance
                            departureAidName = waypoint[0]

                            if (!closestAid["departure"].hasOwnProperty(departureAidName)) {
                                closestAid["departure"][[departureAidName]] = { [dataKeys]: Object.values(data[dataKeys]) }
                            } else {
                                closestAid["departure"][[departureAidName]][[dataKeys]] = Object.values(data[dataKeys])
                            }
                        }

                        if (newArriveDistance <= arriveDistance && flightLevel > lowerLimite && flightLevel < upperLimite) {
                            arriveDistance = newArriveDistance
                            arriveAidName = waypoint[0]

                            if (!closestAid["arrive"].hasOwnProperty(arriveAidName)) {
                                closestAid["arrive"][[arriveAidName]] = { [dataKeys]: Object.values(data[dataKeys]) }
                            } else {
                                closestAid["arrive"][[arriveAidName]][[dataKeys]] = Object.values(data[dataKeys])
                            }
                        }

                    } else {
                        if (newDepartureDistance <= departureDistance) {
                            departureDistance = newDepartureDistance
                            departureAidName = waypoint[0]

                            if (!closestAid["departure"].hasOwnProperty(departureAidName)) {
                                closestAid["departure"][[departureAidName]] = { [dataKeys]: Object.values(data[dataKeys]) }
                            } else {
                                closestAid["departure"][[departureAidName]][[dataKeys]] = Object.values(data[dataKeys])
                            }
                        }

                        if (newArriveDistance <= arriveDistance) {
                            arriveDistance = newArriveDistance
                            arriveAidName = waypoint[0]

                            if (!closestAid["arrive"].hasOwnProperty(arriveAidName)) {
                                closestAid["arrive"][[arriveAidName]] = { [dataKeys]: Object.values(data[dataKeys]) }
                            } else {
                                closestAid["arrive"][[arriveAidName]][[dataKeys]] = Object.values(data[dataKeys])
                            }
                        }
                    }
                }
            })
        })

        let via = {};
        via["departure"] = Object.entries(closestAid.departure)
            .filter(([chave, valor]) => chave === departureAidName)
            .map(([chave, valor]) => ({ [chave]: valor }));

        via["arrive"] = Object.entries(closestAid.arrive)
            .filter(([chave, valor]) => chave === arriveAidName)
            .map(([chave, valor]) => ({ [chave]: valor }));

        return via;
    }

    // External Functions
    const getRouteUpRight = (departureCoordinates, arriveCoordinates, flightLevel) => {
        const route = {};
        let routeIndex = 0;

        console.clear()
        flightLevel = flightLevelChange(flightLevel);

        const closestAid = processWaypoint(departureCoordinates, arriveCoordinates, flightLevel, rnavData)

        const firstAid = Object.keys(closestAid.departure[0])[0];
        const lastAid = Object.keys(closestAid.arrive[0])[0];

        const departureViaOptions = closestAid.departure[0][firstAid]
        const arriveViaOptions = closestAid.arrive[0][lastAid]

        // const firstAidData = Object.keys(departureViaOptions).map(key => departureViaOptions[key].find(obj => firstAid in obj))[0][firstAid];
        // const lastAidData = Object.keys(arriveViaOptions).map(key => arriveViaOptions[key].find(obj => lastAid in obj))[0][lastAid];

        for (const arriveVia in arriveViaOptions) {
            const arriveKeys = []

            for (const arriveAid in arriveViaOptions[arriveVia]) {
                const keys = Object.keys(arriveViaOptions[arriveVia][arriveAid])[0]
                arriveKeys.push(keys)
            }

            for (const departureVia in departureViaOptions) {
                const departureKeys = []

                for (const departureAid in departureViaOptions[departureVia]) {
                    const keys = Object.keys(departureViaOptions[departureVia][departureAid])[0]
                    departureKeys.push(keys)
                }

                const cwf = containsSameElement(arriveKeys, departureKeys)

                if (cwf) {
                    // Colocar a via do lado de cada ponto                        
                    const firstAidIndex = findIndexOfObject(departureViaOptions[departureVia], firstAid);
                    const departureCommonWaypointIndex = findIndexOfObject(departureViaOptions[departureVia], cwf)
                    const departureToArrive = sliceObject(departureViaOptions[departureVia], firstAidIndex, departureCommonWaypointIndex);
                    // Object.assign(departureToArrive, firstAidData)

                    const lastAidIndex = findIndexOfObject(arriveViaOptions[arriveVia], lastAid);
                    const arriveCommonWaypointIndex = findIndexOfObject(arriveViaOptions[arriveVia], cwf)
                    const arriveToDeparture = sliceObject(arriveViaOptions[arriveVia], lastAidIndex, arriveCommonWaypointIndex);
                    const lastAidData = Object.values(arriveViaOptions[arriveVia]).find(object => lastAid in object)
                    Object.assign(arriveToDeparture, lastAidData)

                    const cwfValues = Object.values(departureViaOptions[departureVia]).find(object => cwf in object)
                    const { [cwf]: waypointValue } = cwfValues;

                    route[[routeIndex]] = {
                        "departure": { via: departureVia, route: departureToArrive },
                        "arrive": { via: arriveVia, route: arriveToDeparture },
                        "cwf": { waypoint: cwf, latitude: waypointValue.latitude, longitude: waypointValue.longitude }
                    }
                    routeIndex++
                }
            }
        }

        for (const index in route) {
            const cwf = route[index].cwf;
            route[index].departure.route = sortByDistance(route[index].departure.route, departureCoordinates);            
            
            delete route[index].arrive.route[cwf.waypoint]                    
            route[index].arrive.route = sortByDistance(route[index].arrive.route, [cwf.latitude, cwf.longitude]);
            
            delete route[index].cwf
            route[index] = Object.values(route[index])            
        }        
                
        return route
    }

    return { getRouteUpRight }
}

export default useAirRoutes

// Partindo do primeiro ponto de departure
// const initialLatitude = getValueFromObject(departureViaOptions[departureVia], firstAid, "latitude");
// const initialLongitude = getValueFromObject(departureViaOptions[departureVia], firstAid, "longitude");
// const initialTrackmag = getValueFromObject(departureViaOptions[departureVia], firstAid, "track_mag");
// const initialReverseTrackMag = getValueFromObject(departureViaOptions[departureVia], firstAid, "rev_track_mag");

// const distances = Object.entries(departureToArrive).map(([key, value]) => {
//     const { latitude, longitude } = value;
//     const distance = new Distance([initialLatitude, initialLongitude], [latitude, longitude]).haversineDistance();
//     return { key, distance };
// });

// const sortedDistances = distances.sort((a, b) => a.distance - b.distance);
// const sortedObjects = sortedDistances.map(({ key }) => ({ [key]: departureToArrive[key] }));