import React from 'react';

const Select = ({ text, name, options, defaultValue, handleClick }) => {

    return (
        <>
            <div className='select-form'>
                <label htmlFor={name}>{text}</label>
                <select id={name} name={name} onClick={handleClick}>
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
