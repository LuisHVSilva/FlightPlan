import React, { useContext, useState } from 'react';

// Components
import Input from './form/Input'

// Context
import { DisplayOptionContext } from '../context/DisplayOptionContext';
import { RouteDetailsContext } from '../context/RouteDetailsCountext';

const SearchAirports = ({ data, inputChange }) => {

    const [result, setResult] = useState([])
    const [searchCity, setSearchCity] = useState("")

    // Context
    const { display, setDisplay } = useContext(DisplayOptionContext)
    const { setDepartureName, setArrivalName } = useContext(RouteDetailsContext)


    const handleOnChangeSearchCiy = (event) => {
        setSearchCity(event.target.value.toUpperCase())
    }

    const handleSubmit = () => {
        setResult([]);

        if (searchCity.length >= 3) {
            for (const state in data) {

                for (const icao in data[state]) {
                    const airportData = data[state][icao];

                    const city = airportData.city;
                    const cityWithoutAccents = city.normalize("NFD").replace(/[\u0300-\u036f]/g, '');

                    if (city.includes(searchCity) || cityWithoutAccents.includes(searchCity)) {
                        setResult((last) => [...last, { [icao]: airportData }]);
                    }
                }
            }
        }
    };

    const renderResults = () => {
        const rows = [];

        for (const airport of result) {
            const data = []
            const icao = Object.keys(airport)[0]
            const airportData = Object.values(airport)[0]

            if (airportData.city) {
                data.push(
                    <td key={`${icao}-airport-city`}>{airportData.city}</td>
                )
            }

            if (airportData.state) {
                data.push(
                    <td key={`${icao}-airport-state`}>{airportData.state}</td>
                )
            }


            if (icao) {
                data.push(
                    <td key={`${icao}-airport-icao`}>{icao}</td>
                )
            }

            if (airportData.airport_name) {
                data.push(
                    <td key={`${icao}-airport-name`}>{airportData.airport_name}</td>
                )
            }


            if (airportData.classification) {
                data.push(
                    <td key={`${icao}-airspace-class`}>{airportData.classification}</td>
                )
            } else {
                data.push(
                    <td key={`${icao}-airspace-class`}>------------</td>
                )
            }

            rows.push(
                <tr key={icao} className='item' id={icao} onClick={onClickSelect}>
                    {data}
                </tr>
            )
        }

        return rows
    }

    const onClickClose = () => {
        setDisplay({ display: "none" })
    }

    const onClickSelect = (event) => {
        const airportName = event.target.parentNode.id        

        if (inputChange == "arrival") {            
            setArrivalName(airportName)            
        }

        if (inputChange == "departure") {            
            setDepartureName(airportName)
        }

        setDisplay({ display: "none" })
    }

    return (
        <section className="search-airports" style={display}>
            <div className="close-button" onClick={onClickClose}>
                <i className="fa-solid fa-x"></i>
            </div>
            <div className="input-search-airports">
                <Input
                    type="text"
                    name="departure-city"
                    placeholder="Cidade"
                    handleOnChange={handleOnChangeSearchCiy}
                />
                <button type="submit" onClick={handleSubmit}>Procurar</button>
            </div>

            {result.length > 0 &&
                <div className='result'>
                    <table>
                        <thead>
                            <tr>
                                <th>Cidade</th>
                                <th>Estado</th>
                                <th>Código ICAO</th>
                                <th>Nome do Aeroporto Aeroporto</th>
                                <th>Classe</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderResults()}
                        </tbody>
                    </table>

                </div>
            }

        </section>
    );
};

export default SearchAirports;