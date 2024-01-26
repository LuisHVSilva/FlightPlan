import React, { useEffect, useState } from 'react';

// Components
import Select from '../components/form/Select'

// Hooks
import useJsonDataProvider from '../hooks/useJsonDataProvider';

const Start = () => {

    const jsonURL = "./data/world-airports.json";
    const { getData } = useJsonDataProvider();
    const [data, setData] = useState([]);
    const [icao, setIcao] = useState("");
    const [result, setResult] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getData(jsonURL);                
                setData(data);
            } catch (error) {
                console.error('Erro ao obter dados:', error);
            }
        };

        fetchData();
    }, []);
        

    return (
        <><h1>Entrou</h1></>
    );
};

export default Start;
