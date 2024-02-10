class TypeChecker {
    isFloat(str) {
        if (isNaN(str)) {
            return false;
        }

        // Use a função parseFloat() para tentar converter a string em um número float
        const floatValue = parseFloat(str);

        // Verifique se o resultado da conversão é um número finito e não é um NaN
        return Number.isFinite(floatValue);
    }    
}

export default TypeChecker