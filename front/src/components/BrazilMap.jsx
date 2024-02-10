import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'

const mapStart = [-15.608166742346116, -48.26604105641147];


const BrazilMap = ({ departureCoordinates, arriveCoordinates, route }) => {

  const myIcon = L.icon({
    iconUrl: '/icons/aidMark.svg',
    iconSize: [15, 15],
    popupAnchor: [-3, -10],
  });
  

  const markers = [{position: arriveCoordinates, text:"Arrive"}];
  
  for (const key in route) {
    markers.push({ position: [route[key].latitude, route[key].longitude], text: key })
  }

  markers.push({position:departureCoordinates, texte:"Departure"})

  console.log(markers)
  return (
    <section className="map">
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

        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position} icon={myIcon}>
            <Popup>
              {marker.text}
            </Popup>
          </Marker>
        ))}
        <Polyline positions={markers.map(marker => marker.position)} />

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