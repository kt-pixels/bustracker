import React, { useEffect, useState } from "react";

function StopsData() {
  const [stopData, setStopData] = useState([]);
  const [busesData, setBusesData] = useState([]);
  const [selectedStop, setSelectedStop] = useState(null);
  const [nearestBuses, setNearestBuses] = useState([]);

  const [userLatitude, setUserLatitude] = useState(null);
  const [userLongitude, setUserLongitude] = useState(null);

  useEffect(() => {
    // Fetch stop data
    console.log("UseEffect Working")
    const getStopData = async () => {
      try {
        const apiEndpoint =
          "https://transbus.opendevlabs.com/agency/301/avlapi/stops.geojson";
        const encodedUrl = encodeURIComponent(apiEndpoint);
        const url = `https://ubsa.in/smartprogrammers/fire.php?url=${encodedUrl}`;
        const response = await fetch(url);
        const data = await response.json();
        setStopData(data);
      } catch (error) {
        console.error("Error fetching stops data:", error);
      }
    };

    // Fetch buses data
    const getBusesData = async () => {
      try {
        const apiEndpoint =
          "https://transbus.opendevlabs.com/agency/301/avlapi/public/latest.geojson";
        const encodedUrl = encodeURIComponent(apiEndpoint);
        const url = `https://ubsa.in/smartprogrammers/fire.php?url=${encodedUrl}`;
        const response = await fetch(url);
        const data = await response.json();
        setBusesData(data.features);
      } catch (error) {
        console.error("Error fetching buses data:", error);
      }
    };

    getStopData();
    getBusesData();

    const geo = navigator.geolocation;
    if (geo) {
      geo.getCurrentPosition(getCurrentLocation);
    }

    const interval = setInterval(updateBusesData, 10000);

    return () => clearInterval(interval);
  }, []);

  const getCurrentLocation = (position) => {
    setUserLatitude(position.coords.latitude);
    setUserLongitude(position.coords.longitude);
  };

  const updateBusesData = () => {
    if (!selectedStop || !userLatitude || !userLongitude) return;

    const nearbyBuses = findNearestBuses(selectedStop);
    setNearestBuses(nearbyBuses);
  };

  const findNearestBuses = (stop) => {
    const buses = [];
    busesData.forEach((bus) => {
      const distance = calculateDistance(
        stop.geometry.coordinates[1],
        stop.geometry.coordinates[0],
        bus.geometry.coordinates[1],
        bus.geometry.coordinates[0]
      );

      if (distance <= 5) {
        // Considering only buses within 5 km radius
        buses.push({
          id: bus.properties.id,
          route: bus.properties.route,
          bearing: bus.properties.bearing,
          licensePlate: bus.properties.license_plate,
          distance: distance.toFixed(2),
          estimatedTime: estimateTimeToReachStop(
            distance,
            bus.properties.speed || 30
          ),
        });
      }
    });

    return buses.slice(0, 4); // Return at most 4 nearest buses
  };

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
    const distance = R * c;
    return distance;
  };

  const estimateTimeToReachStop = (distance, speed) => {
    const timeInHours = distance / speed; // Time in hours
    const timeInMinutes = Math.round(timeInHours * 60); // Convert time from hours to minutes and round it to nearest integer
    return timeInMinutes;
  };

  const handleStopClick = (stopId) => {
    const stop = stopData.find((stop) => stop.properties.id === stopId);
    if (stop) {
      setSelectedStop(stop);
      const nearbyBuses = findNearestBuses(stop);
      setNearestBuses(nearbyBuses);
    }
  };

  return (
    <div>
      <h2>All Stops</h2>
      <select onChange={(event) => handleStopClick(event.target.value)}>
        {stopData.map((stop) => (
          <option key={stop.properties.id} value={stop.properties.id}>
            {stop.properties.name}
          </option>
        ))}
      </select>

      <h1>Nearest Buses Details</h1>
      <ul>
        {nearestBuses.length > 0 ? (
          nearestBuses.map((bus) => (
            <li key={bus.id}>
              <p>Route: {bus.route}</p>
              <p>Direction: {bus.bearing === 0 ? "Up" : "Down"}</p>
              <p>License Plate: {bus.licensePlate}</p>
              <p>Distance to stop: {bus.distance} km</p>
              <p>Estimated time to reach stop: {bus.estimatedTime} minutes</p>
            </li>
          ))
        ) : (
          <li>No buses found nearby.</li>
        )}
      </ul>
    </div>
  );
}

export default StopsData;
