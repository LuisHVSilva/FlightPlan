const useJsonDataProvider = () => {
    async function getJsonData(URL) {
        try {
            const response = await fetch(URL);
            const data = await response.json();
            
            return data;
        } catch (error) {
            console.error('Error fetching JSON data:', error);
        }
    }

    return { getJsonData };
}

export default useJsonDataProvider