import React, { useEffect, useState } from "react";
import './StopsData.css'

function StopsData() {
  const [stopData, setStopData] = useState([]);
  const [routesData, setRoutesData] = useState([]);
  const [busesData, setBusesData] = useState([]);
  const [selectedStopRoutes, setSelectedStopRoutes] = useState([]);
  const [nearestBus, setNearestBus] = useState(null);
  const [distance, setDistance] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [selectedStop, setSelectedStop] = useState(selectedStopRoutes);

  // GET THE USER CURRENT LOCATION
  const [userLatitude, setUserLatitude] = useState(null);
  const [userLongitude, setUserLongitude] = useState(null);

  const geo = navigator.geolocation;

  geo.getCurrentPosition(getCurrentLocation);

  function getCurrentLocation(position) {
    // const userLat = position.coords.latitude;
    // const userLng = position.coords.longitude;

    const userLat = 26.84959;
    const userLng = 45.13501999999999;
    // 26.84959, 45.13501999999999

    setUserLatitude(userLat);
    setUserLongitude(userLng);

    // Update filtered stops based on new location
    // const nearbyStops = filterNearbyStops(stopData, userLat, userLng);
    // setFilteredStops(nearbyStops);
  }

  const [intervalId, setIntervalId] = useState(null);

  // ...

  useEffect(() => {
    console.log("UseEffetc is working");
    GetStopsData();
    GetRoutesData();
    GetBusesData();

    // if (userLatitude !== null && userLongitude !== null) {
    //   const nearbyStops = filterNearbyStops(
    //     stopData,
    //     userLatitude,
    //     userLongitude
    //   );
    //   setFilteredStops(nearbyStops);
    // }

    const runInterval = () => {
      if (
        nearestBus &&
        selectedStop.geometry &&
        selectedStop.geometry.coordinates
      ) {
        handleStopClickBuses(selectedStop.geometry.coordinates);
      }
    };

    const interval = setInterval(runInterval, 10000);
    setIntervalId(interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [nearestBus, selectedStop]);

  // useEffect hook to sort stops based on distance when user's location changes
useEffect(() => {
  if (userLatitude !== null && userLongitude !== null) {
    // Calculate distance for each stop and sort them
    const stopsWithDistance = stopData.map(stop => {
      const distance = calculateDistance(userLatitude, userLongitude, stop.geometry.coordinates[0], stop.geometry.coordinates[1]);
      return { ...stop, distance };
    });
    const sortedStops = stopsWithDistance.sort((a, b) => a.distance - b.distance);
    setFilteredStops(sortedStops);
  }
}, [userLatitude, userLongitude, stopData]);

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

  const handleStopClick = (stopId, searchStopName) => {
    const selectedStop = stopData.find((stop) => stop.properties.id === stopId);
    if (selectedStop) {
      setSelectedStop(selectedStop); // Set selectedStop here
      setSearchInput(searchStopName);
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
      if (
        selectedStop.geometry &&
        selectedStop.geometry.coordinates &&
        selectedStop.geometry.coordinates.length === 2
      ) {
        handleStopClickBuses(selectedStop.geometry.coordinates);
      } else {
        console.error("No valid coordinates found for selected stop");
      }
    } else {
      console.error("Selected stop not found");
    }
  };

  const handleStopClickBuses = (stopCoordinates) => {
    const nearestBuses = findNearestBus(stopCoordinates, 3); // Fetch data for 3 nearest buses
  
    if (nearestBuses.length > 0) {
      // Calculate distance and estimated time for each nearest bus
      const updatedBuses = nearestBuses.map(bus => {
        const distance = calculateDistance(
          stopCoordinates[1],
          stopCoordinates[0],
          bus.geometry.coordinates[1],
          bus.geometry.coordinates[0]
        );
        // const busSpeed = bus.properties.speed || 30; // Assuming bus speed is in kilometers per hour
        // const estimatedTime = estimateTimeToReachStop(distance, busSpeed);
  
        // Return updated bus object with distance and estimated time
        return { ...bus, distance };
      });

      const sortedBuses = updatedBuses.sort((a, b) => a.distance - b.distance);
  
      // Update the state with modified nearestBuses array
      setNearestBus(sortedBuses);
    } else {
      console.error("No nearest buses found.");
    }
  };
  
  
  const findNearestBus = (stopCoordinates, count) => {
    let nearestBuses = [];
  
    if (busesData.length > 0) {
      busesData.forEach((bus) => {
        const busCoordinates = bus.geometry.coordinates;
        const distance = calculateDistance(
          stopCoordinates[1],
          stopCoordinates[0],
          busCoordinates[1],
          busCoordinates[0]
        );
  
        // Add bus to the nearestBuses array if it is one of the closest buses
        if (nearestBuses.length < count) {
          nearestBuses.push({ ...bus, distance });
        } else {
          const farthestBusIndex = nearestBuses.reduce((maxIndex, currentBus, index, array) =>
            currentBus.distance > array[maxIndex].distance ? index : maxIndex, 0);
  
          if (distance < nearestBuses[farthestBusIndex].distance) {
            nearestBuses[farthestBusIndex] = { ...bus, distance };
          }
        }
      });
    } else {
      console.error("No buses data available.");
    }
  
    return nearestBuses;
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

  // const estimateTimeToReachStop = (distance, speed) => {
  //   const timeInHours = distance / speed; // Time in hours
  //   const timeInMinutes = Math.round(timeInHours * 60); // Convert time from hours to minutes and round it to nearest integer
  //   return timeInMinutes;
  // };

  {
    /* Function to get the next stop based on the route and direction */
  }

  const getNextStop = (route, bearing) => {
    // Find the route data for the current route
    const currentRoute = routesData.find(
      (routeData) => routeData.short_name === route
    );

    // Check if currentRoute exists before accessing its properties
    if (currentRoute) {
      // Determine the appropriate headline based on the bus's bearing
      return bearing === 0 ? currentRoute.headline[0] : currentRoute.headline[1];
    } else {
      // Return a default message if currentRoute is undefined
      return "Unknown";
    }
};


  // Filter stops data

  const [filteredStops, setFilteredStops] = useState([]);
  // Function to filter stops based on proximity to user's location
  const filterNearbyStops = (
    stops,
    userLatitude,
    userLongitude
    // radius = 50
  ) => {
    return stops.filter((stop) => {
      // Calculate distance between stop and user's location
      const distanceThreshold = 1;
      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        stop.geometry.coordinates[0],
        stop.geometry.coordinates[1]
      );
      // Return true if the distance is within the specified radius
      return distance <= distanceThreshold;
    });
  };

  // Search Functionality
  const [searchInput, setSearchInput] = useState("");
  const [filterSearchValue, setFilterSearchValue] = useState([]);

  const searchStops = (e) => {
    const keyValue = e.target.value;
    setSearchInput(keyValue);

    const filterSearchResults = stopData.filter((product) =>
      product.properties.name.toLowerCase().includes(keyValue.toLowerCase())
    );

    setFilterSearchValue(filterSearchResults);
  };

  return (
    <div>
      <div className="main_heading">
        <h2>Real Time Bus Tracking</h2>
      </div>
      <div className="searchInput_Button">
        <h2>Search Your Stops</h2>
        <input
          type="text"
          onChange={searchStops}
          value={searchInput}
          placeholder="Search Stops..."
        />
        <div className="searchResults">
          {searchInput !== undefined && searchInput.trim() !== "" ? (
            filterSearchValue.length > 0 ? (
              filterSearchValue.map((stopNames, index) => (
                <p
                  key={index}
                  onClick={() => handleStopClick(stopNames.properties.id, stopNames.properties.name)}
                >
                  {stopNames.properties.name}
                </p>
              ))
            ) : (
              <h4>No results match your search.</h4>
            )
          ) : null}
        </div>
      </div>
      <h2>Nearest Stops</h2>
      <select onChange={(event) => handleStopClick(event.target.value)}>
      <option value="">--SELECT--</option>
        {filteredStops !== null ? (
          filteredStops.length > 0 ? (
            filteredStops.map((stop) => (
              <option key={stop.properties.id} value={stop.properties.id}>
                {stop.properties.name}
              </option>
            ))
          ) : (
            <option defaultValue="Make Sure Your Location Is On?">
              Make Sure Your Location Is On?
            </option>
          )
        ) : (
          <option disabled selected>
            Please wait...
          </option>
        )}
      </select>
      <h2 className="bus_details">Nearest Bus Details</h2>
      {/* {nearestBus ? (
        <div>
          <p>Route: {nearestBus.properties.route}</p>
          <p>
            Direction:{" "}
            {getNextStop(
              nearestBus.properties.route,
              nearestBus.properties.bearing
            )}
          </p>
          <p>License Plate: {nearestBus.properties.license_plate}</p>
          <p>Distance to stop: {distance.toFixed(2)} km</p>
          <p>Estimated time to reach stop: {estimatedTime} minutes</p>
        </div>
      ) : (
        <p>Please select any stop...</p>
      )} */}

{nearestBus && nearestBus.length > 0 ? (
  nearestBus.map((bus, index) => (
    <div key={index} className="bus_details">
      <h3>Bus {index + 1}</h3>
      <p>Route: {bus.properties.route}</p>
      <p>
            Direction:{" "}
            {getNextStop(
              bus.properties.route,
              bus.properties.bearing
            )}
          </p>
      {/* Display distance and estimated time */}
      <p>Distance to stop: {bus.distance !== undefined ? `${bus.distance.toFixed(2)} km` : 'N/A'}</p>
    </div>
  ))
) : (
  <p>No buses found near the stop.</p>
)}


    </div>
  );
}

export default StopsData;