import React, { useContext, useState } from 'react';

// Components
import Input from './form/Input'

// Context
import { DisplayOptionContext } from '../context/DisplayOptionContext';

const SearchAirports = ({ data, setDeparture, setArrive, inputChange }) => {

    const [result, setResult] = useState([])
    const [searchCity, setSearchCity] = useState("")
    const { display, setDisplay } = useContext(DisplayOptionContext)


    const handleOnChangeSearchCiy = (event) => {
        setSearchCity(event.target.value.toUpperCase())
    }

    const handleSubmit = () => {
        setResult([]);
        
        if (searchCity.length >= 3) {
            for (const state in data) {

                for (let i = 0; i < data[state].length; i++) {
                    let icao = Object.keys(data[state][i]);                 
                    let city = data[state][i][icao].city;
                    let cityWithoutAccents = city.normalize("NFD").replace(/[\u0300-\u036f]/g, '');
                    if (city.includes(searchCity) || cityWithoutAccents.includes(searchCity)) {                                                
                        let aeroportoData = Object.entries(data[state][i]);
                        aeroportoData[0][1]["state"] = state                                                
                        setResult((last) => [...last, aeroportoData]);
                    }
                }
            }
        }
    };

    const renderResults = () => {
        const rows = [];

        for (let i = 0; i < result.length; i++) {
            const codigo = result[i][0][0];
            const dadosAeroporto = result[i][0][1];
            const data = []            

            if (dadosAeroporto.city) {
                data.push(
                    <td key={`${codigo}-airport-city`}>{dadosAeroporto.city}</td>
                )
            }

            if(dadosAeroporto.state) {
                data.push(
                    <td key={`${codigo}-airport-state`}>{dadosAeroporto.state}</td>
                )
            }


            if (codigo) {
                data.push(
                    <td key={`${codigo}-airport-icao`}>{codigo}</td>
                )
            }

            if (dadosAeroporto.airport_name) {
                data.push(
                    <td key={`${codigo}-airport-name`}>{dadosAeroporto.airport_name}</td>
                )
            }


            if (dadosAeroporto.airspace_class) {
                data.push(
                    <td key={`${codigo}-airspace-class`}>{dadosAeroporto.airspace_class}</td>
                )
            } else {
                data.push(
                    <td key={`${codigo}-airspace-class`}>------------</td>
                )
            }

            rows.push(
                <tr key={codigo} className='item' id={codigo} onClick={onClickSelect}>
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
        if (inputChange == "arrive") {
            setArrive(event.target.parentNode.id)
        }

        if (inputChange == "departure") {
            setDeparture(event.target.parentNode.id);
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