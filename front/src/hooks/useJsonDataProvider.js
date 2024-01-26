import axios from 'axios';

const useJsonDataProvider = () => {
    async function getData(URL) {
        try {            
            const response = await axios.get(URL);
            const data = response.data;
            
            return data;

        } catch (error) {
            console.error('Erro ao ler o arquivo:', error);
        }
    }

    return {getData};
}

export default useJsonDataProvider