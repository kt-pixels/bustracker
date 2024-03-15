import { useState } from "react";
import { stopsData, routsData, allBuses } from "./AllData";

function App() {
  const [distanceCheck, setDistanceCheck] = useState(false);

  const [updateLocation, setUpdateLocation] = useState(0);
  const [updateSetBuses, setUpdateSetBuses] = useState(0);

  const [stops, setStops] = useState(stopsData);
  // const [routes, setRoutes] = useState(routsData);

  let busLocation = stopsData[updateLocation].geometry.coordinates;

  let userLocation = allBuses[updateSetBuses].features[updateSetBuses].geometry.coordinates

  console.log(busLocation);

  function calculateDistance(coord1, coord2) {
    const [x1, y1] = coord1;
    const [x2, y2] = coord2;
    const distanceInMeters = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const distanceInKilometers = distanceInMeters / 1000; // Convert meters to kilometers
    return {
        meters: distanceInMeters.toFixed(2),
        kilometers: distanceInKilometers.toFixed(2)
    };
}

// ROUTES 

// Distance calculate karna
const { meters, kilometers } = calculateDistance(userLocation, busLocation);
console.log("Distance in meters:", meters);
console.log("Distance in kilometers:", kilometers);

  // ROUTES 

  // Distance calculate karna
  // const distance = calculateDistance(userLocation, busLocation);

  return (
    <>
      <h1>Stops List</h1>
      <select onChange={(e) => setUpdateLocation(e.target.value)}>
        {stops.map((stops, index) => (
          <option
            value={index}
            key={stops.properties.id}
          >
            {stops.properties.name}
          </option>
        ))}
      </select>

      <h2>Distance</h2>
      {distanceCheck ? (
        <p>Distance between Stop and the bus: {meters} : Meters / {kilometers} : Kelometers</p>
      ) : (
        <p>No Distance Check Yet</p>
      )}
      <button onClick={() => setDistanceCheck(!distanceCheck)}>
        Check Distance
      </button>
    </>
  );
}

export default App;
