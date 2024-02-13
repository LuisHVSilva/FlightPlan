import Distance from "../Utils/Distance";
import TypeChecker from "../Utils/TypeChecker";

function unifyObjects(ojbOne, objTwo) {
    let obj = { ...ojbOne, ...objTwo }
    let newObj = {};
    for (const key in obj) {
        const aid = Object.keys(obj[key])[0]
        const aidValues = obj[key][aid]
        if (!newObj.hasOwnProperty(aid)) {
            newObj[aid] = aidValues
        }
    }

    return newObj
}

function sliceObject(obj, indexOne, indexTwo) {
    if (indexOne < indexTwo) {
        return Object.fromEntries(Object.entries(obj).slice(indexOne, indexTwo + 1));
    } else {
        return Object.fromEntries(Object.entries(obj).slice(indexTwo, indexOne + 1));
    }
}

function getAllKeys(array) {
    const keys = [];
    for (const obj of array) {
        for (const key in obj) {
            keys.push(key);
        }
    }
    return keys;
}

function contemElementoIgual(array1, array2) {
    for (let elemento of array1) {
        if (array2.includes(elemento)) {
            return elemento;
        }
    }
    return false;
}

function encontrarIndiceDoObjeto(chaveDesejada, array) {
    for (let i = 0; i < array.length; i++) {
        if (chaveDesejada in array[i]) {
            return i;
        }
    }
    return -1; // Retorna -1 se a chave não for encontrada
}

const useAirRoutes = () => {

    const getRouteUpRight = (departureLatitude, departureLongitude, arriveLatitude, arriveLongitude, rnav) => {
        const departureCoordinates = [departureLatitude, departureLongitude]
        const arriveCoordinates = [arriveLatitude, arriveLongitude]

        let departureDistance = Infinity
        let departureAidName;
        let departureVia; // Variável para armazenar os dados das departureVia
        let keysArray1;

        let arriveDistance = Infinity
        let arriveAidName;
        let arriveVia;
        let aidIntersection

        Object.keys(rnav).forEach(rnavKeys => {
            Object.values(rnav[rnavKeys]).forEach(value => {
                let waypoint = Object.keys(value)

                // Obter a longitudeDeparture e a latitudeDeparture do waypoint
                const longitudeDeparture = value[waypoint].longitude
                const latitudeDeparture = value[waypoint].latitude
                const longitudeDepartureFloat = new TypeChecker().isFloat(longitudeDeparture)
                const latitudeDepartureFloat = new TypeChecker().isFloat(latitudeDeparture)

                // Verifica se tanto a longitudeDeparture quanto a latitudeDeparture são valores numéricos (flutuantes)
                if (longitudeDepartureFloat && latitudeDepartureFloat) {
                    // Calcula a distância entre o result de partida e o waypoint atual usando a função haversineDistance
                    const newDistance = new Distance(departureCoordinates, [latitudeDeparture, longitudeDeparture]).haversineDistance()
                    // Verifica se a distância calculada é menor que a variável 'distance'

                    // Aqui pensar que quando for igual, pode adicionar como uma via alternativa
                    if (newDistance < departureDistance) {
                        // Se sim, atualize o valor de 'distance' para a nova distância
                        departureDistance = newDistance
                        // Atualiza o waypoint mais próximo
                        departureAidName = waypoint[0]
                        departureVia = Object.values(rnav[rnavKeys]);
                        keysArray1 = getAllKeys(departureVia);

                    }
                }

                const longitudeArrive = value[waypoint].longitude
                const latitudeArrive = value[waypoint].latitude
                const longitudeArrriveFloat = new TypeChecker().isFloat(longitudeArrive)
                const latitudeArrriveFloat = new TypeChecker().isFloat(latitudeArrive)

                if (longitudeArrriveFloat && latitudeArrriveFloat) {
                    // Calcula a distância entre o result de partida e o waypoint atual usando a função haversineDistance
                    const newDistanceArrive = new Distance(arriveCoordinates, [latitudeArrive, longitudeArrive]).haversineDistance()
                    // Verifica se a distância calculada é menor que a variável 'distance'
                    if (newDistanceArrive <= arriveDistance) {
                        // Se sim, atualize o valor de 'distance' para a nova distância
                        arriveDistance = newDistanceArrive
                        // Atualiza o waypoint mais próximo
                        arriveAidName = waypoint[0]

                        // Aqui tem que procurar um fixo que tem em comum com a via de cima e que tambem tenha o arriveAidName                                                
                        const keysArray2 = getAllKeys(rnav[rnavKeys]);

                        if (contemElementoIgual(keysArray1, keysArray2) && latitudeArrive < arriveCoordinates[0] && longitudeArrive < arriveCoordinates[0]) {
                            arriveVia = rnav[rnavKeys]
                            aidIntersection = contemElementoIgual(keysArray1, keysArray2)
                        }
                    }
                }
            })
        })

        // Separar os objetos de departureVia e arriveVia para pegar só os fixos que correspondem à rota
        const departureAidIndex = encontrarIndiceDoObjeto(departureAidName, departureVia);
        const departureIntersectionIndex = encontrarIndiceDoObjeto(aidIntersection, departureVia);
        const departureToArrive = sliceObject(departureVia, departureAidIndex, departureIntersectionIndex);

        const arriveAidIndex = encontrarIndiceDoObjeto(arriveAidName, arriveVia)
        const arriveIntersectionIndex = encontrarIndiceDoObjeto(aidIntersection, arriveVia)
        const arriveToDeparture = sliceObject(arriveVia, arriveAidIndex, arriveIntersectionIndex);


        // Juntar os dois objetos (departureToArrive | arriveToDeparture) de acordo com a 
        const route = unifyObjects(departureToArrive, arriveToDeparture)

        return route;
    }

    const teste = (departureLatitude, departureLongitude, arriveLatitude, arriveLongitude, rnav) => {
        const departureCoordinates = [departureLatitude, departureLongitude]

        let departureDistance = Infinity
        let departureAidName;
        let departureVia; // Variável para armazenar os dados das departureVia        
        const departureViaObject = {};

        Object.keys(rnav).forEach(rnavKeys => {
            Object.values(rnav[rnavKeys]).forEach(value => {
                let waypoint = Object.keys(value)

                // Obter a longitudeDeparture e a latitudeDeparture do waypoint
                const longitudeDeparture = value[waypoint].longitude
                const latitudeDeparture = value[waypoint].latitude
                const longitudeDepartureFloat = new TypeChecker().isFloat(longitudeDeparture)
                const latitudeDepartureFloat = new TypeChecker().isFloat(latitudeDeparture)

                // Verifica se tanto a longitudeDeparture quanto a latitudeDeparture são valores numéricos (flutuantes)
                if (longitudeDepartureFloat && latitudeDepartureFloat) {
                    // Calcula a distância entre o result de partida e o waypoint atual usando a função haversineDistance
                    const newDistance = new Distance(departureCoordinates, [latitudeDeparture, longitudeDeparture]).haversineDistance()
                    // Verifica se a distância calculada é menor que a variável 'distance'

                    // Aqui pensar que quando for igual, pode adicionar como uma via alternativa
                    if (newDistance <= departureDistance) {
                        // Se sim, atualize o valor de 'distance' para a nova distância
                        departureDistance = newDistance
                        // Atualiza o waypoint mais próximo
                        departureAidName = waypoint[0]
                        departureVia = Object.values(rnav[rnavKeys]);
                        departureViaObject[rnavKeys] = departureAidName
                    }
                }
            })
        })

        // Pegar as vias que passam mais perto do fixo do aeroporto. 
        const chavesFiltradas = Object.keys(departureViaObject).filter(chave => departureViaObject[chave] === departureAidName);         
    }

    return { getRouteUpRight, teste }
}

export default useAirRoutes

