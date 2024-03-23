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

    const userLat = 26.83098;
    const userLng = 45.1348;

    setUserLatitude(userLat);
    setUserLongitude(userLng);

    // Update filtered stops based on new location
    const nearbyStops = filterNearbyStops(stopData, userLat, userLng);
    setFilteredStops(nearbyStops);
  }

  const [intervalId, setIntervalId] = useState(null);

  // ...

  useEffect(() => {
    console.log("UseEffetc is working");
    GetStopsData();
    GetRoutesData();
    GetBusesData();

    if (userLatitude !== null && userLongitude !== null) {
      const nearbyStops = filterNearbyStops(
        stopData,
        userLatitude,
        userLongitude
      );
      setFilteredStops(nearbyStops);
    }

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
  }, [nearestBus, selectedStop, userLatitude, userLongitude]);

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
      setSearchInput(searchStopName)
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

  {
    /* Function to get the next stop based on the route and direction */
  }

  const getNextStop = (route, bearing) => {
    // Find the route data for the current route
    const currentRoute = routesData.find(
      (routeData) => routeData.short_name === route
    );

    // Determine the appropriate headline based on the bus's bearing
    const headline =
      bearing === 0 ? currentRoute.headline[0] : currentRoute.headline[1];

    return headline;
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
      <h2>All Stops</h2>
      <select onChange={(event) => handleStopClick(event.target.value)}>
        {stopData !== null ? (
          stopData.length > 0 ? (
            stopData.map((stop) => (
              <option key={stop.properties.id} value={stop.properties.id}>
                {stop.properties.name}
              </option>
            ))
          ) : (
            <option defaultValue="Please Wait...">Please Wait...</option>
          )
        ) : (
          <option disabled>Please wait...</option>
        )}
      </select>
      <br /> <br />
      <h2>Stops According to your location</h2>
      <select onChange={(event) => handleStopClick(event.target.value)}>
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
      {nearestBus ? (
        <div>
          <p>Route: {nearestBus.properties.route}</p>
          {/* <p>Direction: {nearestBus.properties.bearing === 0 ? "Up" : "Down"}</p> */}
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
          {/* Display the next stop based on the bus's bearing and direction names */}
        </div>
      ) : (
        <p>Please select any stop...</p>
      )}
    </div>
  );
}

export default StopsData;