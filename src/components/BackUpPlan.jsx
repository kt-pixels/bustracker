import React, { useEffect, useState } from "react";
import "./StopsData.css";

function StopsData() {
  const [stopData, setStopData] = useState([]);
  const [routesData, setRoutesData] = useState([]);
  const [busesData, setBusesData] = useState([]);
  const [selectedStopRoutes, setSelectedStopRoutes] = useState([]);
  const [nearestBus, setNearestBus] = useState(null);
  const [selectedStop, setSelectedStop] = useState(selectedStopRoutes);
  const [filteredStops, setFilteredStops] = useState([]);

  const [isIntervalRunning, setIsIntervalRunning] = useState(false);
  const [shouldRefreshBusesData, setShouldRefreshBusesData] = useState(false);

  // GET THE USER CURRENT LOCATION
  const [userLatitude, setUserLatitude] = useState(null);
  const [userLongitude, setUserLongitude] = useState(null);

  const geo = navigator.geolocation;

geo.getCurrentPosition(getCurrentLocation);

function getCurrentLocation(position) {
  const userLat = position.coords.latitude;
  const userLng = position.coords.longitude;

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
          stop.geometry.coordinates[1],
          stop.geometry.coordinates[0]
        );
        return { ...stop, distance };
      });
      const sortedStops = stopsWithDistance.sort(
        (a, b) => a.distance - b.distance
      );
      setFilteredStops(sortedStops);
    } else {
      // If location is not available, show all stops without sorting
      setFilteredStops(stopData);
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
    console.log("Clicked stop:", stopId, selectedStop.properties.name);
    if (selectedStop) {
      // setSearchInput(searchStopName);
      const stopName = selectedStop.properties.name;

      setSelectedStop(selectedStop); // Set selectedStop here

      const stopRoutes = routesData.filter((route) => {
        return (
          route.extra_data &&
          route.extra_data.headline &&
          route.extra_data.headline[1].includes(stopName)
        );
      });

      console.log("Filtered stopRoutes:", stopRoutes);

      setSelectedStopRoutes(stopRoutes);

      // setIsShowingStops(false);

      // setFilterSearchValue([]);

      // setSearchInput("");

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
      console.log("Updated and sorted buses:", sortedBuses);
      
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

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const point1 = new window.google.maps.LatLng(lat1, lon1);
    const point2 = new window.google.maps.LatLng(lat2, lon2);
    const distance = window.google.maps.geometry.spherical.computeDistanceBetween(point1, point2);
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

    const filterSearchResults = filteredStops.filter((product) =>
      product.properties.name.toLowerCase().includes(keyValue.toLowerCase())
    );

    setFilterSearchValue(filterSearchResults);
  };

  // const [isShowingStops, setIsShowingStops] = useState(true);

  const [messageToast, setMessageToast] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const handleStartIsClick = () => {
    setIsIntervalRunning(true);

    var message = "Auto Refresh Start";

    // Display message
    // alert(message);
    setMessageToast(message);
    setShowMessage(true);

    // Convert message to speech
    var speechSynthesis = window.speechSynthesis;
    var speechMessage = new SpeechSynthesisUtterance(message);
    speechSynthesis.speak(speechMessage);

    setTimeout(() => {
      setShowMessage(false);
    }, 1);
  };

  const handleStopIsClick = () => {
    setIsIntervalRunning(false);

    var message = "Auto Refresh Stop";

    // Display message
    // alert(message);
    setMessageToast(message);
    setShowMessage(true);

    // Convert message to speech
    var speechSynthesis = window.speechSynthesis;
    var speechMessage = new SpeechSynthesisUtterance(message);
    speechSynthesis.speak(speechMessage);

    setTimeout(() => {
      setShowMessage(false);
    }, 1);
  };

  const handleRefreshIsClick = () => {
    setShouldRefreshBusesData(true);

    var message = "Refresh";

    // Display message
    // alert(message);
    setMessageToast(message);
    setShowMessage(true);

    // Convert message to speech
    var speechSynthesis = window.speechSynthesis;
    var speechMessage = new SpeechSynthesisUtterance(message);
    speechSynthesis.speak(speechMessage);

    setTimeout(() => {
      setShowMessage(false);
    }, 1);
  };

  const isApproaching = (bus, stopCoordinates) => {
    const busCoordinates = bus.geometry.coordinates;
    // Calculate the distance between the bus and the stop
    const distance = calculateDistance(
      stopCoordinates[1],
      stopCoordinates[0],
      busCoordinates[1],
      busCoordinates[0]
    );
    // Assuming the threshold for considering a bus as approaching is 2 km
    return distance <= 20; // Adjust this threshold as needed
  };

  return (
    <div>
      {/* {isShowingStops === true ? ( */}
      <div className="searchInput_Button">
        {/* <h2>Search Your Stops</h2> */}
        <span class="material-symbols-outlined search_icon" aria-hidden="true">
          search
        </span>
        <input
          type="text"
          onChange={searchStops}
          value={searchInput}
          placeholder="Search Stops..."
        />
        {showMessage && <div style={{ display: "none" }}>{messageToast}</div>}

        <div className="searchResults">
          {searchInput !== undefined && searchInput.trim() !== ""
            ? filterSearchValue.length > 0
              ? filterSearchValue.map((stopNames, index) => (
                  <p
                    key={index}
                    onClick={() =>
                      handleStopClick(
                        stopNames.properties.id,
                        stopNames.properties.name
                      )
                    }
                  >
                    {stopNames.properties.name} (
                    {stopNames.distance !== undefined
                      ? stopNames.distance.toFixed(2)
                      : "N/A"}{" "}
                    km)
                  </p>
                ))
              : ""
            : null}
        </div>
      </div>
      <div className="">
        <select onChange={(event) => handleStopClick(event.target.value)}>
          <option value="">--SELECT--</option>
          {filteredStops.map((stops) => (
            <option value={stops.properties.id} key={stops.properties.id}>
              {stops.properties.name} (
              {stops.distance !== undefined ? stops.distance.toFixed(2) : "N/A"}{" "}
              km)
            </option>
          ))}
        </select>
      </div>
      <div className="buses_details_container" aria-live="assertive">
        <div className="title_container">
          <div className="title_bk">
            <h2 className="bus_details">Nearest Bus Details</h2>
          </div>
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
        </div>
        <div className="start_stop_btns">
          <button onClick={handleStartIsClick}>Auto Refresh Start</button>
          <button onClick={handleStopIsClick}>Auto Refresh Stop</button>
        </div>

        <div>
          {selectedStop && selectedStop.properties && (
            <p style={{ fontSize: 20, textAlign: "center" }}>
              Selected stop is {selectedStop.properties.name}
            </p>
          )}
        </div>

        {nearestBus && nearestBus.length > 0 ? (
          // nearestBus.map((bus, index) => (
          nearestBus
            .filter((bus) =>
              isApproaching(bus, selectedStop.geometry.coordinates)
            )
            .map((bus, index) => (
              <div key={index} className="buses_details">
                <h3>Bus {index + 1}</h3>
                <p>
                  <b>Route:</b> {bus.properties.route}
                </p>
                <p>
                  <b>Direction:</b>{" "}
                  {getNextStop(bus.properties.route, bus.properties.bearing)}
                </p>
                <p>
                  <b>Distance to stop:</b>{" "}
                  {bus.distance !== undefined
                    ? `${bus.distance.toFixed(2)} km`
                    : "N/A"}
                </p>
                {/* <p aria-live="assertive">
                {bus.properties.route}
                {" "}, {" "}
                {getNextStop(bus.properties.route, bus.properties.bearing)}
                {" "}, {" "}
                {bus.distance !== undefined
                  ? `${bus.distance.toFixed(2)} km`
                  : "N/A"}
              </p> */}
              </div>
            ))
        ) : (
          <p className="no_buses_found">Please select any stop...</p>
        )}
      </div>
    </div>
  );
}

export default StopsData;
