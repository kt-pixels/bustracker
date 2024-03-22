import React, { useEffect, useState } from "react";

function StopsData() {
  const [stopData, setStopData] = useState([]);
  const [routesData, setRoutesData] = useState([]);
  const [busesData, setBusesData] = useState([]);
  const [selectedStopRoutes, setSelectedStopRoutes] = useState([]);
  const [nearestBus, setNearestBus] = useState(null);
  const [distance, setDistance] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [selectedStop, setSelectedStop] = useState(selectedStopRoutes);

  // useEffect(() => {
  //   console.log("useEffect triggered");
  //   GetStopsData();
  //   GetRoutesData();
  //   GetBusesData();
  
  //   const interval = setInterval(() => {
  //     console.log("Interval triggered");
  //     console.log("Nearest bus:", nearestBus);
  //     console.log("Selected stop:", selectedStop);
  //     if (nearestBus && selectedStop.geometry && selectedStop.geometry.coordinates) {
  //       handleStopClickBuses(selectedStop.geometry.coordinates);
  //     }
  //   }, 10000);

  // const [intervalId, setIntervalId] = useState(null);

// ...

// useEffect(() => {
//   console.log("useEffect triggered");
//   GetStopsData();
//   GetRoutesData();
//   GetBusesData();

//   const runInterval = () => {
//     if (nearestBus && selectedStop.geometry && selectedStop.geometry.coordinates) {
//       handleStopClickBuses(selectedStop.geometry.coordinates);
//     }
//   };

//   const interval = setInterval(runInterval, 10000);
//   setIntervalId(interval);

//   return () => {
//     clearInterval(intervalId);
//   };
// }, [nearestBus, selectedStop]);
  
 // Add a state variable to hold the intervalId
 const [intervalId, setIntervalId] = useState(null);

 // Wrap the setInterval function in a separate function to be called in the useEffect
 const updateInterval = async () => {
   if (nearestBus && selectedStop?.geometry?.coordinates) {
     console.log("nearestBus:", nearestBus);
     console.log("selectedStop:", selectedStop);

     await handleStopClickBuses(selectedStop.geometry.coordinates);
   }
 };

 useEffect(() => {
  console.log("useEffect triggered");
    GetStopsData();
    GetRoutesData();
    GetBusesData();
  // Clear any previous interval on component unmount or dependency update
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}, [intervalId, selectedStop, nearestBus]);

// Create the interval when the component mounts or dependencies update
useEffect(() => {
  if (nearestBus && selectedStop?.geometry?.coordinates) {
    // Set the interval only if both nearestBus and selectedStop have valid data
    const interval = setInterval(updateInterval, 10000);
    setIntervalId(interval);
  }
}, [nearestBus, selectedStop]);

// useEffect(() => {
//   console.log("useEffect triggered");
//   GetStopsData();
//   GetRoutesData();
//   GetBusesData();

//   const runInterval = () => {
//     if (nearestBus && selectedStop?.geometry?.coordinates) {
//       console.log("nearestBus:", nearestBus);
//       console.log("selectedStop:", selectedStop);

//       handleStopClickBuses(selectedStop.geometry.coordinates);
//     }
//   };

//   const intervalId = setInterval(runInterval, 10000);

//   return () => {
//     clearInterval(intervalId);
//   };
// }, [nearestBus, selectedStop]);


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

  const handleStopClick = (stopId) => {
    const selectedStop = stopData.find((stop) => stop.properties.id === stopId);
    if (selectedStop) {
      setSelectedStop(selectedStop); // Set selectedStop here
      const stopName = selectedStop.properties.name;
      const stopRoutes = routesData.filter((route) => {
        return (
          route.extra_data &&
          route.extra_data.headline &&
          route.extra_data.headline[1].includes(stopName)
        );
      });
      setSelectedStopRoutes(stopRoutes);
      
      // Check if geometry exists and has coordinates
      if(selectedStop.geometry && selectedStop.geometry.coordinates && selectedStop.geometry.coordinates.length === 2) { 
        handleStopClickBuses(selectedStop.geometry.coordinates);
      } else {
        console.error("No valid coordinates found for selected stop");
      }
    } else {
      console.error("Selected stop not found");
    }
  };
  

  const handleStopClickBuses = (stopCoordinates) => {
    const nearestBus = findNearestBus(stopCoordinates);
    setNearestBus(nearestBus);

    if (
      nearestBus &&
      nearestBus.geometry &&
      nearestBus.geometry.coordinates &&
      nearestBus.geometry.coordinates.length >= 2
    ) {
      const distance = calculateDistance(
        stopCoordinates[1],
        stopCoordinates[0],
        nearestBus.geometry.coordinates[1],
        nearestBus.geometry.coordinates[0]
      );
      setDistance(distance);

      const busSpeed = nearestBus.properties.speed || 30; // Assuming bus speed is in kilometers per hour
      const estimatedTime = estimateTimeToReachStop(distance, busSpeed);
      setEstimatedTime(estimatedTime);
    } else {
      console.error(
        "Cannot calculate distance and estimated time. Nearest bus data is incomplete."
      );
    }
  };

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

  return (
    <div>
      <h2>Stops</h2>
      <select onChange={(event) => handleStopClick(event.target.value)}>
        {stopData ? (
          stopData.map((stop) => (
            <option key={stop.properties.id} value={stop.properties.id}>
              {stop.properties.name}
            </option>
          ))
        ) : (
          <option disabled>Please wait...</option>
        )}
      </select>

      <h1>Nearest Bus</h1>
      {nearestBus && (
        <div>
          <h2>Nearest Bus Details</h2>
          <p>Route: {nearestBus.properties.route}</p>
          <p>Direction: {nearestBus.properties.bearing === 0 ? "Up" : "Down"}</p>
          <p>License Plate: {nearestBus.properties.license_plate}</p>
          <p>Distance to stop: {distance.toFixed(2)} km</p>
          <p>Estimated time to reach stop: {estimatedTime} minutes</p>
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

      {/* <h2>Buses On This Route</h2>
      <ul>
        {busesData.length > 0 ? (
          busesData.map((bus, index) => (
            <li key={index}>
              {bus.properties.route}{" "}
              {bus.properties.bearing === 0 ? "Up" : "Down"}
            </li>
          ))
        ) : (
          <li>No buses available</li>
        )}
      </ul> */}
    </div>
  );
}

export default StopsData;
