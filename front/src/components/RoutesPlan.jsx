import React, { useContext, useState } from 'react';

// Context
import { RouteDetailsContext } from '../context/RouteDetailsCountext';

const RoutesPlan = () => {
  const { route, setChousenRoute } = useContext(RouteDetailsContext);

  const handleOnClick = (event) => {
    const targetRouteId = event.target.id
    setChousenRoute(route[targetRouteId])
  }

  const generateUniqueString = (route) => {
    const routeWaypoints = [];
    const temporaryArray = [];

    for (const via in route) {
      for (const obj of route[via]) {
        const { distance, ...waypointInfo } = obj;
        const waypointKey = Object.keys(waypointInfo)[0];

        if (!routeWaypoints.includes(waypointKey)) {
          temporaryArray.push(`${via} -> ${waypointKey}`);
          routeWaypoints.push(waypointKey);
        }
      }
    }

    return temporaryArray.join("->").replace(/\s/g, '');
  };

  const renderRoutes = (routes) => {
    const uniqueArray = [];    

    for (const route of routes) {
      const uniqueString = generateUniqueString(route);

      if (!uniqueArray.includes(uniqueString)) {
        uniqueArray.push(uniqueString);
      }
    }

    return uniqueArray.map((texto, index) => (
      <div className="route-option" key={`route-option-${index}`}>
        <p id={index} className='route-item' onClick={handleOnClick}>{texto}</p>
      </div>
    ));
  };


  return (
    <section className="routes">
      {route.length > 0 && renderRoutes(route)}
    </section>
  );
};

export default RoutesPlan;
