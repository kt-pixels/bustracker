import React, { useEffect, useState } from "react";
import "./StopsData.css";

function StopsData() {
  const [stopData, setStopData] = useState([]);
  const [routesData, setRoutesData] = useState([]);
  const [busesData, setBusesData] = useState([]);
  const [selectedStopRoutes, setSelectedStopRoutes] = useState([]);
  const [nearestBus, setNearestBus] = useState(null);
  // const [distance, setDistance] = useState(null);
  // const [estimatedTime, setEstimatedTime] = useState(null);
  const [selectedStop, setSelectedStop] = useState(selectedStopRoutes);
  const [filteredStops, setFilteredStops] = useState([]);
  const [isSearchIsShowingStops, setIsSearchIsShowingStops] = useState(true);

  const [isIntervalRunning, setIsIntervalRunning] = useState(false);
  const [shouldRefreshBusesData, setShouldRefreshBusesData] = useState(false);

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

    setUserLatitude(userLat);
    setUserLongitude(userLng);
  }

  const [intervalId, setIntervalId] = useState(null);

  // ...

  useEffect(() => {
    console.log("UseEffetc is working");
    GetStopsData();
    GetRoutesData();
    GetBusesData();

    const runInterval = () => {
      if (
        nearestBus &&
        selectedStop.geometry &&
        selectedStop.geometry.coordinates
      ) {
        handleStopClickBuses(selectedStop.geometry.coordinates);
      }
    };

    if (isIntervalRunning) {
      const interval = setInterval(runInterval, 10000);
      setIntervalId(interval);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [nearestBus, selectedStop, isIntervalRunning]);

  useEffect(() => {
    if (shouldRefreshBusesData) {
      if (
        selectedStop &&
        selectedStop.geometry &&
        selectedStop.geometry.coordinates
      ) {
        handleStopClickBuses(selectedStop.geometry.coordinates);
        setShouldRefreshBusesData(false);
      }
    }
  }, [shouldRefreshBusesData, selectedStop]);

  // useEffect hook to sort stops based on distance when user's location changes
  useEffect(() => {
    if (userLatitude !== null && userLongitude !== null) {
      // Calculate distance for each stop and sort them
      const stopsWithDistance = stopData.map((stop) => {
        const distance = calculateDistance(
          userLatitude,
          userLongitude,
          stop.geometry.coordinates[0],
          stop.geometry.coordinates[1]
        );
        return { ...stop, distance };
      });
      const sortedStops = stopsWithDistance.sort(
        (a, b) => a.distance - b.distance
      );
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

      setIsShowingStops(true);

      setFilterSearchValue([])

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
      const updatedBuses = nearestBuses.map((bus) => {
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
          const farthestBusIndex = nearestBuses.reduce(
            (maxIndex, currentBus, index, array) =>
              currentBus.distance > array[maxIndex].distance ? index : maxIndex,
            0
          );

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

  // const calculateDistance = (lat1, lon1, lat2, lon2) => {
  //   const R = 6371; // Radius of the Earth in kilometers
  //   const dLat = (lat2 - lat1) * (Math.PI / 180);
  //   const dLon = (lon2 - lon1) * (Math.PI / 180);
  //   const a =
  //     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  //     Math.cos(lat1 * (Math.PI / 180)) *
  //       Math.cos(lat2 * (Math.PI / 180)) *
  //       Math.sin(dLon / 2) *
  //       Math.sin(dLon / 2);
  //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  //   const distance = R * c;
  //   return distance;
  // };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const point1 = new window.google.maps.LatLng(lat1, lon1);
    const point2 = new window.google.maps.LatLng(lat2, lon2);
    const distance =
      window.google.maps.geometry.spherical.computeDistanceBetween(
        point1,
        point2
      );
    return distance / 1000; // Convert distance to kilometers
  };

  const getNextStop = (route, bearing) => {
    // Find the route data for the current route
    const currentRoute = routesData.find(
      (routeData) => routeData.short_name === route
    );

    // Check if currentRoute exists before accessing its properties
    if (currentRoute) {
      // Determine the appropriate headline based on the bus's bearing
      return bearing === 0
        ? currentRoute.headline[0]
        : currentRoute.headline[1];
    } else {
      // Return a default message if currentRoute is undefined
      return "Unknown";
    }
  };

  // Filter stops data

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

  const [isShowingStops, setIsShowingStops] = useState(true);

  const handleStartIsClick = () => {
    setIsIntervalRunning(true);
  };

  const handleStopIsClick = () => {
    setIsIntervalRunning(false);
  };

  const handleRefreshIsClick = () => {
    setShouldRefreshBusesData(true);
  };

  return (
    <div>
      {/* <div className="main_heading">
        <h2>Real Time Bus Tracking</h2>
      </div> */}
      <div className="searchInput_Button">
        {/* <h2>Search Your Stops</h2> */}
        <span class="material-symbols-outlined search_icon">search</span>
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
                  onClick={() =>
                    handleStopClick(
                      stopNames.properties.id,
                      stopNames.properties.name
                    )
                  }
                >
                  {stopNames.properties.name}
                </p>
              ))
            ) : (
              ""
            )
          ) : null}
        </div>
      </div>
      <h2
        className="nearest_stop_list"
        title="Stops List, Button"
        onClick={() => setIsShowingStops(!isShowingStops)}
      >
        Nearest Stops{" "}
        <span class="material-symbols-outlined" aria-hidden="true">
          keyboard_arrow_down
        </span>
      </h2>
      {isShowingStops === false ? (
        <div className="nearest_stops_data_container">
          {filteredStops.map((f_stops) => (
            <p
              key={f_stops.properties.id}
              className={
                selectedStop === f_stops.properties.id
                  ? `f_stops_lists active`
                  : `f_stops_lists`
              }
              onClick={() => handleStopClick(f_stops.properties.id, f_stops.properties.name)}
            >
              {f_stops.properties.name}
            </p>
          ))}
        </div>
      ) : null}
      <h2 className="bus_details">
        Nearest Bus Details
        <span
          class="material-symbols-outlined"
          title="Refresh Data, Button"
          style={{
            background: "black",
            borderRadius: 5,
            color: "white",
          }}
          onClick={handleRefreshIsClick}
        >
          refresh
        </span>
      </h2>
      <div className="start_stop_btns">
        <button onClick={handleStartIsClick}>Auto Refresh Start</button>
        <button onClick={handleStopIsClick}>Auto Refresh Stop</button>
      </div>

      {nearestBus && nearestBus.length > 0 ? (
        nearestBus.map((bus, index) => (
          <div key={index} className="buses_details">
            <h3>Bus {index + 1}</h3>
            <p>
              <b>Route:</b> {bus.properties.route}
            </p>
            <p>
              <b>Direction:</b>{" "}
              {getNextStop(bus.properties.route, bus.properties.bearing)}
            </p>
            {/* Display distance and estimated time */}
            <p>
              <b>Distance to stop:</b>{" "}
              {bus.distance !== undefined
                ? `${bus.distance.toFixed(2)} km`
                : "N/A"}
            </p>
          </div>
        ))
      ) : (
        <p className="no_buses_found">No buses found near the stop.</p>
      )}
    </div>
  );
}

export default StopsData;
