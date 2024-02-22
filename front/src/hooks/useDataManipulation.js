import AeroMath from "../Utils/AeroMath";

const useDataManipulation = () => {

    // Function to unify properties from two objects into a new object
    const unifyObjects = (objOne, objTwo) => {
        // Merge the properties of both objects
        let mergedObj = { ...objOne, ...objTwo };

        // Initialize an empty object to store the unified properties
        let unifiedObj = {};

        // Iterate through the merged object
        for (const key in mergedObj) {
            // Extract the first key of each property
            const firstKey = Object.keys(mergedObj[key])[0];

            // Extract the value associated with the first key
            const firstKeyValues = mergedObj[key][firstKey];

            // Check if the unified object does not already have the first key
            if (!unifiedObj.hasOwnProperty(firstKey)) {
                // If not, add the first key and its associated values to the unified object
                unifiedObj[firstKey] = firstKeyValues;
            }
        }

        // Return the unified object
        return unifiedObj;
    }


    // Function to slice an object based on given indices
    const sliceObject = (obj, indexOne, indexTwo) => {

        const newObject = {};
        let array = [];

        // Check if indexOne is less than indexTwo
        if (indexOne < indexTwo) {
            // If true, slice the object from indexOne to indexTwo (inclusive)            
            array = Object.entries(obj).slice(indexOne + 1, indexTwo + 1);
        } else {
            // If false, slice the object from indexTwo to indexOne (inclusive)
            array = Object.entries(obj).slice(indexTwo, indexOne);
        }

        array.forEach(([key, value]) => {
            newObject[Object.keys(value)] = Object.values(value)[0];
        });

        return newObject
        // return array
    }

    // Function to extract all keys from an array of objects
    const getAllKeys = (array) => {
        // Initialize an empty array to store keys
        const keys = [];

        // Iterate through each object in the array
        for (const obj of array) {
            // Iterate through each key in the current object
            for (const key in obj) {
                // Push the key into the keys array
                keys.push(key);
            }
        }

        // Return the array containing all keys
        return keys;
    }


    // Function to check if two arrays have a common element
    const containsSameElement = (array1, array2) => {
        // Iterate through each element in array1
        for (let element of array1) {
            // Check if the current element exists in array2
            if (array2.includes(element)) {
                // If found, return the element
                return element;
            }
        }
        // If no common element is found, return false
        return false;
    }


    // Function to find the index of the first object containing a desired key
    const findIndexOfObject = (array, desiredKey) => {
        const index = array.findIndex(objeto => Object.keys(objeto).includes(desiredKey));

        return index;
    }


    const flightLevelChange = (flightLevel) => {
        if (!flightLevel) {
            return Infinity
        }

        if (flightLevel === "UNL") {
            return Infinity
        }

        if (flightLevel.includes("FL")) {
            flightLevel = flightLevel.replace("FL", "");
        };

        flightLevel = parseFloat(flightLevel) * 100;

        return flightLevel;

    }


    const getValueFromObject = (obj, key, property) => {
        return Object.values(obj).map(keys => {
            const internalKey = Object.keys(keys).find(internalKey => internalKey === key);
            return internalKey ? keys[internalKey][property] : null;
        }).find(value => value !== null);
    }

    const sortByDistance = (originObject, viaObject) => {
        const { latitude: originLatitude, longitude: originLongitude } = originObject;
        
        const waypoints = viaObject;

        const newObject = Object.entries(waypoints).map(([waypoint, { latitude, longitude }]) => {
            const distance = new AeroMath([originLatitude, originLongitude], [latitude, longitude]).haversineDistance()
            return {  distance: distance, [waypoint]: waypoints[waypoint] };
        });

        newObject.sort((a, b) => a.distance - b.distance);
        
        return newObject;
    }

    return { unifyObjects, sliceObject, getAllKeys, containsSameElement, findIndexOfObject, flightLevelChange, getValueFromObject, sortByDistance }
}

export default useDataManipulation