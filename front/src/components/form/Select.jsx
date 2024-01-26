import React, { useState } from 'react';

const Select = ({ text, name, options, defaultValue, handleOnChange }) => {

    const [style, setStyle] = useState({});

    const handleClick = (e) => {
        const value = e.target.value
        if (value) {
            setStyle({color: "black"})
        }
    }

    return (
        <>
            <div className='select-form'>
                <label htmlFor={name}>{text}</label>
                <select id={name} name={name} style={style} onClick={handleClick}>
                    <option value="" disabled selected hidden>----</option>
                    {options.map((option, index) => (
                        < option key={option.value || index} value={option.value} >
                            {option.label}
                        </option>
                    ))}
                </select>
            </div >
        </>
    );
};

export default Select;
