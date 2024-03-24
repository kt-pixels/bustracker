import React from "react";

function BusesDetails({
  NearestBusDetails,
  refresh,
  start,
  stopbtn,
  direction,
  stop,
}) {
  return (
    <div>
      {NearestBusDetails && NearestBusDetails.length > 0 ? (
        NearestBusDetails.map((bus, index) => (
          <div key={index} className="buses_details">
            <h3>Bus {index + 1}</h3>
            <p>
              <b>Route:</b> {bus.properties.route}
            </p>
            <p>
              <b>Direction:</b>{" "}
              {direction(bus.properties.route, bus.properties.bearing)}
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

export default BusesDetails;
