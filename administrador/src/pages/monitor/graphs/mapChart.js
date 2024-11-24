import React from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

const MapChart = ({ data }) => (
  <ComposableMap>
    <Geographies geography={geoUrl}>
      {({ geographies }) =>
        geographies.map((geo) => (
          <Geography
            key={geo.rsmKey}
            geography={geo}
            style={{
              default: { fill: "#D6D6DA", outline: "none" },
              hover: { fill: "#F53", outline: "none" },
              pressed: { fill: "#E42", outline: "none" },
            }}
          />
        ))
      }
    </Geographies>
    {data.map((country, index) => (
      <Marker key={index} coordinates={[country.lng, country.lat]}>
        <circle r={10} fill="#F00" />
        <text
          textAnchor="middle"
          style={{ fontFamily: "system-ui", fill: "#5D5A6D" }}
        >
          {country.users}
        </text>
      </Marker>
    ))}
  </ComposableMap>
);

export default MapChart;
