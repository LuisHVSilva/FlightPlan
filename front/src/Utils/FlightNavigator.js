import AeroMath from "./AeroMath";

class FlightNavigator {

    constructor(waypoint) {
        this.waypoint = waypoint;
        this.MAXIMUMUM_MAGNETIC_VARIATION = 24;
    }

    #oppositeDirection(direction) {
        return (direction + 180) % 360;
    }

    calculateTrackMag(originCoordinates) {
        if (this.waypoint) {
            const [{ latitude: nextLatitude, longitude: nextLongitude }] = Object.values(this.waypoint);
            const trackMag = new AeroMath(originCoordinates, [nextLatitude, nextLongitude]);
            return trackMag.greatCircleAzimuth();
        }

        return null;
    }

    calculateReverseTrackMag(originCoordinates) {
        if (this.waypoint) {
            const [{ latitude: nextLatitude, longitude: nextLongitude }] = Object.values(this.waypoint);
            const reverseTrackMag = new AeroMath(originCoordinates, [nextLatitude, nextLongitude]);
            return reverseTrackMag.reverseGreatCircleAzimuth();
        }

        return null;
    }

    isMagneticVariationAcceptable(originCoordinates, originTrackMag) {
        const reverseTrackMag = this.calculateReverseTrackMag(originCoordinates)
        
        return Math.abs(this.#oppositeDirection(reverseTrackMag) - originTrackMag) < this.MAXIMUMUM_MAGNETIC_VARIATION
    }
}

export default FlightNavigator;