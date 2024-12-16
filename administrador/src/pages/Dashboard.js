import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Timestamp } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "leaflet/dist/leaflet.css";
import UserHeatmap from "./monitor/graphs/userHeatmap";
import {
  BarChart,
  Bar,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import "chart.js/auto";
import TicketsChart from "./monitor/graphs/tickets";
import UserContext from "./monitor/context/usercontext";
import Info from "./monitor/context/info";
import Music from "./monitor/graphs/music";

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {

  return (
    <div className="main-dashboard">
      <div className="tickets-section">
        <TicketsChart />
      </div>
      <div>
      <Info/>
      </div>
      <div>
        <Music />
      </div>
      {/* visualizamos el mapa desde otra page */}
      {/* <div className="map-section">
          <UserHeatmap />
      </div> */}

      {/* niveles de seguridad de los users */}
      <div className="charts-section">
        <UserContext />
      </div>
    </div>
  );
};

export default Dashboard;
