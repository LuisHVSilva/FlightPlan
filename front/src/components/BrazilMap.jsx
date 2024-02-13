import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'

// Context

const mapStart = [-15.608166742346116, -48.26604105641147];

const BrazilMap = ({ departureCoordinates, arriveCoordinates, route, routeDisplay }) => {    
  
  const myIcon = L.icon({
    iconUrl: '/icons/aidMark.svg',
    iconSize: [15, 15],
    popupAnchor: [-3, -10],
  });

  const renderRoute = () => {
    const markers = [{ position: arriveCoordinates, text: "Arrive" }];

    for (const key in route) {
      markers.push({ position: [route[key].latitude, route[key].longitude], text: key })
    }

    markers.push({ position: departureCoordinates, text: "Departure" })

    return (
      <>
        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position} icon={myIcon}>
            <Popup>
              {marker.text}
            </Popup>
          </Marker>
        ))}
        <Polyline positions={markers.map(marker => marker.position)} />
      </>
    )
  }

  return (
    <section className="map">
      <div className="loader-div" style={routeDisplay}>
        <div class="loader">
          <div class="loader-wheel"></div>
          <div class="loader-text"></div>
        </div>
      </div>

      <MapContainer center={mapStart} zoom={4} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {departureCoordinates.length > 0 &&
          <Marker position={departureCoordinates}>
            <Popup>
              Saída
            </Popup>
          </Marker>
        }

        {Object.keys(route).length > 0 && renderRoute()}        

        {arriveCoordinates.length > 0 &&
          <Marker position={arriveCoordinates}>
            <Popup>
              Chegada
            </Popup>
          </Marker>
        }
      </MapContainer>
    </section >
  );
};

export default BrazilMap;