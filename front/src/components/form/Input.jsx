// React modules
import React from 'react';

const Input = ({ text, type, name, placeholder, handleOnChange, search, searchButton, ...props }) => {

    return (
        <>
            <div className='label-input'>
                <label htmlFor={name}>{text}</label>
                <input
                    name={name}
                    id={name}
                    type={type}
                    placeholder={placeholder}
                    onChange={handleOnChange}
                    {...props}
                />
                
                {search &&
                    <div className="search-button" onClick={searchButton} id={name}>
                        <i className="fa-solid fa-magnifying-glass"></i>
                    </div>
                }
            </div>
        </>
    );
};

export default Input;