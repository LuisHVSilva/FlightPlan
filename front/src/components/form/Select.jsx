import React from 'react';

const Select = ({ text, name, options, handleChange }) => {
    return (
        <div className='select-form'>
            <label htmlFor={name}>{text}</label>
            <select id={name} name={name} onChange={handleChange}>
                <option value="" disabled defaultValue>----</option>
                {options.map((option, index) => (
                    <option key={option.value || index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Select;
