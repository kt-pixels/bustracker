import React, { useEffect, useState } from "react";
import axios from "axios";

function StopsData() {
  // STOPS API
  const [stopData, setStopData] = useState([]);

  useEffect(() => {
    GetStopsData();
    GetRoutesData();
    GetBusesData();
  }, []);

  const GetStopsData = async () => {
    const apiEndpoint =
      "https://transbus.opendevlabs.com/agency/301/avlapi/stops.geojson";
    const encodedUrl = encodeURIComponent(apiEndpoint);
    const url = `https://ubsa.in/smartprogrammers/fire.php?url=${encodedUrl}`;
    const stopsList = await fetch(url);

    const result = await stopsList.json();

    // console.log(result)
    setStopData(result);
  };

  // ROUTES API
  const [routesData, setRoutesData] = useState([]);

  const GetRoutesData = async () => {
    const apiEndpoint =
      "https://transbus.opendevlabs.com/agency/301/avlapi/routes/";
    const encodedUrl = encodeURIComponent(apiEndpoint);
    const url = `https://ubsa.in/smartprogrammers/fire.php?url=${encodedUrl}`;
    const routesList = await fetch(url);

    const result = await routesList.json();

    // console.log(result)
    setRoutesData(result);
  };

  // BUSES API
  const [busesData, setBusesData] = useState([]);

  const GetBusesData = async () => {
    const apiEndpoint =
      "https://transbus.opendevlabs.com/agency/301/avlapi/public/latest.geojson";
    const encodedUrl = encodeURIComponent(apiEndpoint);
    const url = `https://ubsa.in/smartprogrammers/fire.php?url=${encodedUrl}`;
    const busesList = await fetch(url);

    const result = await busesList.json();

    //  console.log(result)
    setBusesData(result.features);
  };

  // GET CLICKED STOP ROUTES
  const [selectedStopRoutes, setSelectedStopRoutes] = useState([]);

  const handleStopClick = (stopId) => {
    const selectedStop = stopData.find((stop) => stop.properties.id === stopId);
    if (selectedStop) {
      const stopName = selectedStop.properties.name;
      const stopRoutes = routesData.filter((route) => {
        return (
          route.extra_data &&
          route.extra_data.headline &&
          route.extra_data.headline[1].includes(stopName)
        );
      });
      setSelectedStopRoutes(stopRoutes);
    }
  };

  // find selected Routes Buses
  const [busPosition, setBusPosition] = useState([])

  const findSelectedRouteBuses = (shortName) => {
    const routeNameObj = selectedStopRoutes.find((s_name) => s_name.short_name === shortName);
  
  if(routeNameObj) {
    const routeName = routeNameObj.short_name; // Assuming short_name is the property you need

    const filterBusesData = busesData.filter((buses) => {
      return (
        buses.properties &&
        // buses.properties.route.includes(routeName)
        buses.properties.route === routeName
      );
    });

    console.log(filterBusesData)


    if (filterBusesData.length > 0) {
      setBusPosition(filterBusesData);
    } else {
      // If no buses are found for the given route, you can set the state to indicate that.
      setBusPosition([]);
    }
  } else {
    // If no route is found, you might want to handle this case accordingly.
    console.log('Route not found for short name: ', shortName);
  }
  }

  // Show buses According bearings

  // const [bear0, setBear0] = useState[0]
  // const [bear1, setBear1] = useState[1]

  return (
    <div>
      <h2>Stops</h2>
      <ul>
        {stopData.map((stop) => (
          <li
            key={stop.properties.id}
            onClick={() => handleStopClick(stop.properties.id)}
          >
            {stop.properties.name}
          </li>
        ))}
      </ul>

      <h2>Routes for Selected Stop</h2>
      <ul>
        {selectedStopRoutes.map((route) => (
          <li key={route.object_id} onClick={() => findSelectedRouteBuses(route.short_name)}>
            {route.short_name} - {route.name}
          </li>
        ))}
      </ul>

      <h2>Buses On This Route</h2>
      <ul>
        {
          busPosition.map((buses, index) => (
            <li key={index}>
              {buses.properties.route} 
              { " " }
              {buses.properties.bearing === 0 ? "Up" : "Down"}
              {/* {buses.properties.bearing} */}
            </li>
          ))
        }
      </ul>
    </div>
  );
}

export default StopsData;
