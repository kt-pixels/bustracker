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
  const [busPosition, setBusPosition] = useState([]);

  const findSelectedRouteBuses = (shortName) => {
    const routeNameObj = selectedStopRoutes.find(
      (s_name) => s_name.short_name === shortName
    );

    if (routeNameObj) {
      const routeName = routeNameObj.short_name; // Assuming short_name is the property you need

      const filterBusesData = busesData.filter((buses) => {
        return buses.properties && buses.properties.route.includes(routeName);
      });

      console.log(filterBusesData);

      if (filterBusesData.length > 0) {
        setBusPosition(filterBusesData);
      } else {
        // If no buses are found for the given route, you can set the state to indicate that.
        setBusPosition([]);
      }
    } else {
      // If no route is found, you might want to handle this case accordingly.
      console.log("Route not found for short name: ", shortName);
    }
  };

  // Function to calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  // Function to estimate time based on distance and bus speed
  const estimateTimeToReachStop = (distance, speed) => {
    const timeInHours = distance / speed; // Time in hours
    // Convert time from hours to minutes and round it to nearest integer
    const timeInMinutes = Math.round(timeInHours * 60);
    return timeInMinutes;
  };

  // Use these functions to calculate distance and estimate time
  const busCoordinates = [26.9230289459, 45.0888900757];
  const stopCoordinates = [26.81406, 45.14787];

  const distance = calculateDistance(
    busCoordinates[0],
    busCoordinates[1],
    stopCoordinates[0],
    stopCoordinates[1]
  );

  // Assuming bus speed is in kilometers per hour
  const busSpeed = 30; // Example speed

  const estimatedTime = estimateTimeToReachStop(distance, busSpeed);

  console.log("Distance to stop:", distance.toFixed(2), "km");
  console.log("Estimated time to reach stop:", estimatedTime, "minutes");

  // FIND NEAREST BUSES

  const [nearestBus, setNearestBus] = useState(null);

  // Function to find the nearest bus to a stop
  const findNearestBus = (stopCoordinates) => {
    let nearestDistance = Infinity;
    let nearestBus = null;

    busesData.forEach((bus) => {
      const busCoordinates = bus.geometry.coordinates;
      const distance = Math.sqrt(
        Math.pow(stopCoordinates[0] - busCoordinates[0], 2) +
          Math.pow(stopCoordinates[1] - busCoordinates[1], 2)
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestBus = bus;
      }
    });

    return nearestBus;
  };

  // Function to handle stop click event
  const handleStopClickBuses = (stopCoordinates) => {
    const nearestBus = findNearestBus(stopCoordinates);
    setNearestBus(nearestBus);
  };

  return (
    <div>
      <h2>Stops</h2>
      <select onChange={(event) => handleStopClick(event.target.value)}>
        {stopData ? (
          stopData.map((stop) => (
            <>
              <option key={stop.properties.id} value={stop.properties.id} onClick={() => handleStopClickBuses(stop.geometry.coordinates)}>
                {stop.properties.name}
              </option>
            </>
          ))
        ) : (
          <option disabled>Please wait...</option>
        )}
      </select>

      <h1>Nearest Bus</h1>
      {/* {stopData.map((stop) => (
        <div key={stop.properties.id}>
          <p>{stop.properties.name}</p>
          <button onClick={() => handleStopClickBuses(stop.geometry.coordinates)}>
            Show Nearest Bus
          </button>
        </div>
      ))} */}
      {nearestBus && (
        <div>
          <h2>Nearest Bus Details</h2>
          <p>Route: {nearestBus.properties.route}</p>
          <p>License Plate: {nearestBus.properties.license_plate}</p>
          {/* Add more details here if needed */}
        </div>
      )}

      <h2>Routes for Selected Stop</h2>
      <ul>
        {selectedStopRoutes.map((route) => (
          <li
            key={route.object_id}
            onClick={() => findSelectedRouteBuses(route.short_name)}
          >
            {route.short_name} - {route.name}
          </li>
        ))}
      </ul>

      {/* <select onChange={(event) => findSelectedRouteBuses(event.target.value)}>
        {selectedStopRoutes.map((route) => (
          <option key={route.object_id} value={route.short_name}>
            {route.short_name} - {route.name}
          </option>
        ))}
      </select> */}

      <h2>Buses On This Route</h2>
      <ul>
        {busPosition.map((buses, index) => (
          <li key={index}>
            {buses.properties.route}{" "}
            {buses.properties.bearing === 0 ? "Up" : "Down"}
            {/* {buses.properties.bearing} */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StopsData;
