// RightBar.js
import React from "react";
import { NavLink } from "react-router-dom";
import PeopleIcon from "@mui/icons-material/People";
import InboxIcon from "@mui/icons-material/Inbox";
import "./mainLayout.css";
import GroupIcon from "@mui/icons-material/Group";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

const RightBar = () => {
  return (
    <div className="rightbar">
      <NavLink to="/monitor/users/userActivity">
        <PeopleIcon className="icon" />
        <span className="sidebar-number">|</span> Gestión de Usuarios
      </NavLink>
      <NavLink to="/system/inbox">
        <InboxIcon className="icon" />
        <span className="sidebar-number">|</span> Consultas y Soporte
      </NavLink>
      {/* <NavLink to="/monitor/Clouster">
        <GroupIcon className="icon" />
        <span className="sidebar-number">|</span> Clúster de Usuarios
      </NavLink> */}
      <NavLink to="/rol/RolManagment">
        <ManageAccountsIcon className="icon" />
        <span className="sidebar-number">|</span> Administracion de usuarios
      </NavLink>
    </div>
  );
};

export default RightBar;
