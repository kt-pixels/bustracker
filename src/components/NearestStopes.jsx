import React, { useState, useEffect } from "react";
import { stopsData } from "../AllData";

function NearestStopes() {
  // const [totalStops, setTotalStops] = useState(stopsData);
  const [lat, setLat] = useState("");
  const [long, setLong] = useState("");
  const [userNearByStops, setUserNearByStops] = useState([]);

  //   Bus Availibility
  const [busInfo, setBusInfo] = useState([]);
  //   const [message, setMessage] = useState("");

  // USERS CITY
  const [userCity, setUserCity] = useState("");

  useEffect(() => {
    const geo = navigator.geolocation;
    geo.getCurrentPosition(UserPosition);
  }, []);


  // GET THE USER LOCATION
  function UserPosition(position) {
    // let userLatitude = position.coords.latitude;
    // let userLongitude = position.coords.longitude;
    let userLatitude = 26.83098;
    let userLongitude = 45.1348;
    setLat(userLatitude);
    setLong(userLongitude);
    const nearbyStops = findNearbyStops(userLatitude, userLongitude);
    setUserNearByStops(nearbyStops);
    // Get city name based on coordinates
    fetchCityName(userLatitude, userLongitude);

    // get bus info
    // findBusesNearbyStops(userLatitude, userLongitude, nearbyStops);

    const intervalId = setInterval(() => {
        findBusesNearbyStops(userLatitude, userLongitude, nearbyStops);
      }, 2000);
  
      // Clean up function to clear interval when component unmounts
      return () => clearInterval(intervalId);
  }
  // USER CURRENT CITY FETCHING BY THE ACCESS OF THE USERS LOCATION
  async function fetchCityName(latitude, longitude) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      const city =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        "Unknown";
      setUserCity(city);
    } catch (error) {
      console.error("Error fetching city name:", error);
    }
  }

  // GET THE NEAREST STOPS ACCORDING TO THE USER LOCATION
  function findNearbyStops(userLat, userLong) {
    const nearbyStops = [];
    for (const stop of stopsData) {
      if (stop.geometry && stop.geometry.coordinates) {
        const stopLat = stop.geometry.coordinates[0]; // Latitude comes second
        const stopLong = stop.geometry.coordinates[1]; // Longitude comes first
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

  // Bus position getting function {{this is the async function }}

  async function findBusesNearbyStops(userLat, userLong) {
    const nearbyStops = findNearbyStops(userLat, userLong);
    const nearbyStopsWithBuses = [];

    // Fetch current bus positions
    const cors_api = "http://localhost:8080/";
    const response = await fetch(
      cors_api +
        "https://transbus.opendevlabs.com/agency/301/avlapi/public/latest.geojson"
    );
    const busPositions = await response.json();

    // console.log(busPositions);

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

  // console.log(busInfo);

  return (
    <div>
      {/* Latitude : {lat} , Longitude : {long} */}
      <p>Current City name {userCity}</p>
      {/* {userNearByStops.length === 0 ? (
        <p>No stops available in your location</p>
      ) : (
        <div>
          <p>Stops Nearby According To Your Location are:</p>
          {userNearByStops.map((nearStops, index) => (
            <p key={index}>{nearStops.properties.name}</p>
          ))}
        </div>
      )} */}
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

export default NearestStopes;
