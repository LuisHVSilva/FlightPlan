import React, { useEffect, useState } from 'react';

// Components
import Select from './form/Select'
import Input from './form/Input'

// Hooks
import useJsonDataProvider from '../hooks/useJsonDataProvider';

const Start = () => {

    const jsonURL = "./data/world-airports.json";

    const { getData } = useJsonDataProvider();
    const [data, setData] = useState([]);
    const [airportCity, setAirportCity] = useState("");
    const [result, setResult] = useState("");

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

    const handleOnChange = (e) => {
        setAirportCity(e.target.value)
    }

    const handleOnClick = () => {
        const airportDetails = data.filter(airportData => airportData.municipality === airportCity)[0];
        setResult(airportDetails)
    }


    return (
        <section id="start">

            <div className="forms">
                <Input
                    text="Nome da cidade: "
                    name="icao"
                    type="text"
                    value="EGLL"
                    handleOnChange={handleOnChange}
                />
            </div>
            <button onClick={handleOnClick}>Procurar</button>
        </section>
    );
};



// "id": 2434,
// "ident": "EGLL",
// "type": "large_airport",
// "name": "London Heathrow Airport",
// "latitude_deg": 514706,
// "longitude_deg": -461941,
// "elevation_ft": 83.0,
// "continent": "EU",
// "country_name": "United Kingdom",
// "iso_country": "GB",
// "region_name": "England",
// "iso_region": "GB-ENG",
// "local_region": "ENG",
// "municipality": "London",
// "scheduled_service": 1,
// "gps_code": "EGLL",
// "iata_code": "LHR",
// "local_code": null,
// "home_link": "http://www.heathrowairport.com/",
// "keywords": "LON, Londres",
// "score": 1251675

export default Start;
