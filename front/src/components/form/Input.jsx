// React modules
import React from 'react';

const Input = ({ text, type, name, placeholder, value, defaultValue, handleOnChange, maxLength, minLength }) => {

    return (
        <>
            <div className='label-input'>
                <label htmlFor={name}>{text}</label>
                <input
                    name={name}
                    id={name}
                    type={type}
                    placeholder={placeholder}
                    defaultValue={defaultValue}
                    value={value}
                    maxLength={maxLength}
                    minLength={minLength}
                    onChange={handleOnChange}                                        
                />
            </div>
        </>
    );
};

export default Input;