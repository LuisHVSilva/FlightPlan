import React, { useState } from 'react';
import ReactFlagsSelect from "react-flags-select";
import InputMask from 'react-input-mask';

//Constants
import { countryInfoList } from '../../constants/phoneConstants';

const InputPhone = () => {
    const [selected, setSelected] = useState("");
    const [inputMask, setInputMask] = useState("(99) 99999-9999")

    const customLabels = countryInfoList
    const countryOptions = Object.keys(countryInfoList)    

    const onFlagChange = (code) => {
        setSelected(code)
        setInputMask(customLabels[code].mask)
    }
    
    return (
        <div className='input-phone'>
            <label htmlFor="phone">Telefone:</label>

            <div className="country-select">
                <ReactFlagsSelect                    
                    id="flags-select"
                    className="menu-flags"
                    selectButtonClassName="menu-flags-button"

                    placeholder="DDI"
                    customLabels={customLabels}

                    countries={countryOptions}

                    selected={selected}
                    onSelect={(code) => onFlagChange(code)}

                    selectedSize={10} // Tamanho do texto dentro da caixinha       
                    optionsSize={10}
                    showSelectedLabel={false}
                />
                <InputMask
                    mask={inputMask}
                    maskChar="_"
                    alwaysShowMask={true}
                    id="phone"
                    type="text"
                />
            </div>
        </div>
    )
}

export default InputPhone;
