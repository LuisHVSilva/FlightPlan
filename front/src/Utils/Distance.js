class Distance {
    constructor(coord1, coord2) {
        this.coord1 = coord1;
        this.coord2 = coord2;
        this.earthRadioKm = 6371.0;
    }

    // Métodos privados

    // Transfomrar graus em radianos
    degreesToRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    // Métodos Públicos

    // Função para calcular a distância entre dois pontos geográficos usando a fórmula do haversine
    haversineDistance() {
        // Converter graus para radianos
        const lat1 = this.degreesToRadians(this.coord1[0]);
        const lon1 = this.degreesToRadians(this.coord1[1]);
        const lat2 = this.degreesToRadians(this.coord2[0]);
        const lon2 = this.degreesToRadians(this.coord2[1]);

        // Diferença de latitude e longitude
        const dlat = lat2 - lat1;
        const dlon = lon2 - lon1;

        // Aplicar a fórmula do haversine
        const a = Math.sin(dlat / 2) * Math.sin(dlat / 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const haversineDistance = this.earthRadioKm * c;

        return haversineDistance;
    }

    great_Circle_Azimuth() {
        const lat1 = this.coord1[0];
        const lon1 = this.coord1[1];
        const lat2 = this.coord2[0];
        const lon2 = this.coord2[1];

        const dLon = lon2 - lon1;

        const x = Math.cos(this.degreesToRadians(lat2)) * Math.sin(this.degreesToRadians(dLon));
        const y = Math.cos(this.degreesToRadians(lat1)) * Math.sin(this.degreesToRadians(lat2)) - Math.sin(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) * Math.cos(this.degreesToRadians(dLon));

        let theta = Math.atan2(x, y);

        theta = this.radiansToDegrees(theta);
        
        return (theta + 360) % 360;

    }

}

export default Distance;