import React, { useContext, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'

// Context
import { ChosenRouteContext } from '../context/ChosenRouteContext';

const mapStart = [-15.608166742346116, -48.26604105641147];

const BrazilMap = ({ departureCoordinates, arriveCoordinates, routesDisplay }) => {
  const [zoomMap, setZoomMap] = useState(5)
  const { chosenRoute } = useContext(ChosenRouteContext);
  

  const myIcon = L.icon({
    iconUrl: '/icons/aidMark.svg',
    iconSize: [15, 15],
    popupAnchor: [-3, -10],
  });

  const renderRoute = () => {
    const markers = [{ position: departureCoordinates, text: "Departure" }];

    const waypointArray = []
    for (const via in chosenRoute) {
      for (const waypoint of chosenRoute[via]) {
        const { distance, ...waypointInfo } = waypoint;
        const waypointName = Object.keys(waypointInfo)[0]
        if (!waypointArray.includes(waypointName)) {
          waypointArray.push(waypointName)
          const { latitude, longitude, lower_limit, upper_limit, length, airspace_class } = waypointInfo[waypointName]          
          markers.push({
            position: [latitude, longitude],
            text: {
              name: waypointName,
              lower_limit: lower_limit,
              upper_limit: upper_limit,
              length: length,
              airspace_class: airspace_class
            }
          })
        }
      }
    }

    markers.push({ position: arriveCoordinates, text: "Arrive" })

    return (
      <>
        {markers.map((marker, index) => (
          <Marker key={index} position={marker.position} icon={myIcon}>
            <Popup>
              {marker.text.name && <>Fixo: {marker.text.name} <br /></>}
              {marker.text.lower_limit && <>Altura Mínima: {marker.text.lower_limit} <br /></>}
              {marker.text.upper_limit && <>Altura Máxima: {marker.text.upper_limit} <br /></>}
              {marker.text.length && <>Distância: {marker.text.length} <br /></>}
              {marker.text.airspace_class && <>Classe do espaço aéreo: {marker.text.airspace_class} <br /></>}                            
            </Popup>
          </Marker>
        ))}
        <Polyline positions={markers.map(marker => marker.position)} />
      </>
    )
  }

  return (
    <section className="map">
      <div className="loader-div" style={routesDisplay}>
        <div className="loader">
          <div className="loader-wheel"></div>
          <div className="loader-text"></div>
        </div>
      </div>

      <MapContainer center={mapStart} zoom={zoomMap} scrollWheelZoom={true}>
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

        {/* {Object.keys(chosenRoute).length > 0 && renderRoute()} */}

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