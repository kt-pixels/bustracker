import React, { useEffect, useState } from "react";
import './StopsData.css'

function StopsData() {
  const [stopData, setStopData] = useState([]);
  const [routesData, setRoutesData] = useState([]);
  const [busesData, setBusesData] = useState([]);
  const [busInfo, setBusInfo] = useState([]);


  // GET THE USER CURRENT LOCATION
  const [userLatitude, setUserLatitude] = useState(null);
  const [userLongitude, setUserLongitude] = useState(null);

  useEffect(() => {
    console.log("UseEffetc is working");
    GetStopsData();
    GetRoutesData();
    GetBusesData();
  }, [])

  useEffect(() => {
    const geo = navigator.geolocation;
    geo.getCurrentPosition(UserPosition);
  }, []);

  function UserPosition(position) {
    // let userLatitude = position.coords.latitude;
    // let userLongitude = position.coords.longitude;
    let userLatitude = 26.83098;
    let userLongitude = 45.1348;
    setUserLatitude(userLatitude);
    setUserLongitude(userLongitude);
    const nearbyStops = findNearbyStops(userLatitude, userLongitude);
    // setUserNearByStops(nearbyStops);
    // Get city name based on coordinates
    // fetchCityName(userLatitude, userLongitude);

    // get bus info
    // findBusesNearbyStops(userLatitude, userLongitude, nearbyStops);

    const intervalId = setInterval(() => {
        findBusesNearbyStops(userLatitude, userLongitude, nearbyStops);
      }, 2000);
  
      // Clean up function to clear interval when component unmounts
      return () => clearInterval(intervalId);
  }

  const GetStopsData = async () => {
    // Fetch stop data
    try {
      const apiEndpoint =
        "https://transbus.opendevlabs.com/agency/301/avlapi/stops.geojson";
      const encodedUrl = encodeURIComponent(apiEndpoint);
      const url = `https://ubsa.in/smartprogrammers/fire.php?url=${encodedUrl}`;
      const response = await fetch(url);
      const result = await response.json();
      setStopData(result);
    } catch (error) {
      console.error("Error fetching stops data:", error);
    }
  };

  const GetRoutesData = async () => {
    // Fetch routes data
    try {
      const apiEndpoint =
        "https://transbus.opendevlabs.com/agency/301/avlapi/routes/";
      const encodedUrl = encodeURIComponent(apiEndpoint);
      const url = `https://ubsa.in/smartprogrammers/fire.php?url=${encodedUrl}`;
      const response = await fetch(url);
      const result = await response.json();
      setRoutesData(result);
    } catch (error) {
      console.error("Error fetching routes data:", error);
    }
  };

  const GetBusesData = async () => {
    // Fetch buses data
    try {
      const apiEndpoint =
        "https://transbus.opendevlabs.com/agency/301/avlapi/public/latest.geojson";
      const encodedUrl = encodeURIComponent(apiEndpoint);
      const url = `https://ubsa.in/smartprogrammers/fire.php?url=${encodedUrl}`;
      const response = await fetch(url);
      const result = await response.json();
      setBusesData(result.features);
    } catch (error) {
      console.error("Error fetching buses data:", error);
    }
  };

  function findNearbyStops(userLat, userLong) {
    const nearbyStops = [];
    for (const stop of stopData) {
      if (stop.geometry && stop.geometry.coordinates) {
        const stopLat = stop.geometry.coordinates[0];
        const stopLong = stop.geometry.coordinates[1];
        const distanceThreshold = 0.01;
        const distance = Math.sqrt(
          Math.pow(stopLat - userLat, 2) + Math.pow(stopLong - userLong, 2)
        );
        if (distance <= distanceThreshold) {
          nearbyStops.push(stop);
        }
      } else {
        console.log(
          "Stop geometry or coordinates are undefined for stop:",
          stop
        );
      }
    }
    return nearbyStops;
  }

  async function findBusesNearbyStops(userLat, userLong) {
    const nearbyStops = findNearbyStops(userLat, userLong);
    const nearbyStopsWithBuses = [];

    // Fetch current bus positions
    const apiEndpoint =
        "https://transbus.opendevlabs.com/agency/301/avlapi/public/latest.geojson";
      const encodedUrl = encodeURIComponent(apiEndpoint);
      const url = `https://ubsa.in/smartprogrammers/fire.php?url=${encodedUrl}`;
      const response = await fetch(url);
    const busPositions = await response.json();

    console.log(busPositions);

    for (const stop of nearbyStops) {
      if (stop.geometry && stop.geometry.coordinates) {
        const stopLat = stop.geometry.coordinates[0]; // Latitude comes first
        const stopLong = stop.geometry.coordinates[1]; // Longitude comes second
        const distanceThreshold = 0.01;

        // Filter bus positions near this stop
        const nearbyBuses = busPositions.features.filter((bus) => {
          const busLat = bus.geometry.coordinates[0];
          const busLong = bus.geometry.coordinates[1];
          const distance = Math.sqrt(
            Math.pow(busLat - stopLat, 2) + Math.pow(busLong - stopLong, 2)
          );
          return distance <= distanceThreshold;
        });
        // Append nearby buses to stop object
        stop.nearbyBuses = nearbyBuses;

        // Push stop to nearbyStopsWithBuses array
        nearbyStopsWithBuses.push(stop);

        // console.log(nearbyStopsWithBuses)
        setBusInfo(nearbyStopsWithBuses);
      } else {
        console.log(
          "Stop geometry or coordinates are undefined for stop:",
          stop
        );
      }
    }

    return nearbyStopsWithBuses;
  }


  return (
    <div>
      {busInfo.map((stop) => (
        <div key={stop.properties.id}>
          <h3>Stop Name: {stop.properties.name}</h3>

          {/* Iterate over nearby buses and display license plates */}
          {stop.nearbyBuses.map((bus, index) => (
            <ul key={index}>
              <li>Bus License Plate: {bus.properties.license_plate}</li>
              <li>Route: {bus.properties.route}</li>
              <li>Bus Timming: {bus.properties.gps_timestamp}</li>
              <li>Bus Speed: {bus.properties.speed}</li>
            </ul>
          ))}
        </div>
      ))}
    </div>
  );
}

export default StopsData;