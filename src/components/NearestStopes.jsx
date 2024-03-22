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

 // Distance calculation using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

async function findNearbyStops(userLat, userLong) {
  const nearbyStops = [];
  for (const stop of stopsData) {
    if (stop.geometry && stop.geometry.coordinates) {
      const stopLat = stop.geometry.coordinates[1]; // Latitude
      const stopLong = stop.geometry.coordinates[0]; // Longitude
      const distanceThreshold = 1; // Set your desired distance threshold here
      const distance = calculateDistance(
        userLat,
        userLong,
        stopLat,
        stopLong
      );
      if (distance <= distanceThreshold) {
        nearbyStops.push(stop);
      }
    } else {
      console.log("Stop geometry or coordinates are undefined for stop:", stop);
    }
  }
  return nearbyStops;
}

async function findBusesNearbyStops(userLat, userLong) {
  const nearbyStops = await findNearbyStops(userLat, userLong);
  const nearbyStopsWithBuses = [];

  const apiEndpoint =
    "https://transbus.opendevlabs.com/agency/301/avlapi/public/latest.geojson";
  const encodedUrl = encodeURIComponent(apiEndpoint);
  const url = `https://ubsa.in/smartprogrammers/fire.php?url=${encodedUrl}`;

  // Fetch current bus positions
  const response = await fetch(url);
  const busPositions = await response.json();

  for (const stop of nearbyStops) {
    if (stop.geometry && stop.geometry.coordinates) {
      const stopLat = stop.geometry.coordinates[1]; // Latitude
      const stopLong = stop.geometry.coordinates[0]; // Longitude
      const distanceThreshold = 1; // Set your desired distance threshold here

      // Filter bus positions near this stop
      const nearbyBuses = busPositions.features.filter((bus) => {
        const busLat = bus.geometry.coordinates[1];
        const busLong = bus.geometry.coordinates[0];
        const distance = calculateDistance(
          busLat,
          busLong,
          stopLat,
          stopLong
        );
        return distance <= distanceThreshold;
      });
      // Append nearby buses to stop object
      stop.nearbyBuses = nearbyBuses;

      // Push stop to nearbyStopsWithBuses array
      nearbyStopsWithBuses.push(stop);
    } else {
      console.log("Stop geometry or coordinates are undefined for stop:", stop);
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
