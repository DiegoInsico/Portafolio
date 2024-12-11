import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { ToastContainer, toast } from "react-toastify";
import { Box, Button, Typography } from "@mui/material";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { DataGrid } from "@mui/x-data-grid";
import "./userList.css";

const UserList = () => {
  const [users, setUsers] = useState([]);

  // Obtener lista de empleados
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "employees"));
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id, // ID del documento en Firestore
        ...doc.data(),
      }));
      setUsers(usersData);
    } catch (error) {
      console.error("Error al obtener los empleados:", error);
      toast.error("Error al obtener los empleados.");
    }
  };

  // Autenticar empleado
  const handleAuthenticateEmployee = async (employee) => {
    try {
      // Crear usuario en Firebase Authentication usando el ID del documento como UID
      const customUid = employee.id;
      const email = employee.email;
      const password = "contraseña-segura-por-defecto";

      // Usar una función personalizada para crear el usuario con UID
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Actualizar el documento en Firestore con el UID del usuario autenticado
      await updateDoc(doc(db, "employees", customUid), {
        authId: user.uid,
        isAuthenticated: true,
      });

      toast.success(`Empleado ${employee.displayName} autenticado con éxito.`);
      fetchUsers(); // Refrescar lista
    } catch (error) {
      console.error("Error al autenticar empleado:", error);
      toast.error("Error al autenticar empleado.");
    }
  };

  // Eliminar empleado
  const handleDelete = async (userId) => {
    try {
      await deleteDoc(doc(db, "employees", userId));
      toast.success("Empleado eliminado con éxito.");
      fetchUsers(); // Actualizar lista después de eliminar
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      toast.error("Error al eliminar empleado.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Box
      sx={{
        maxWidth: 800,
        margin: "auto",
        padding: 3,
        backgroundColor: "#212121",
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Lista de Empleados
      </Typography>
      <DataGrid
        rows={users}
        columns={[
          { field: "displayName", headerName: "Nombre", width: 150 },
          { field: "email", headerName: "Correo", width: 200 },
          { field: "role", headerName: "Rol", width: 100 },
          {
            field: "isAuthenticated",
            headerName: "Estado",
            width: 150,
            renderCell: (params) => (
              <span>
                {params.row.isAuthenticated ? "Autenticado" : "No autenticado"}
              </span>
            ),
          },
          {
            field: "actions",
            headerName: "Acciones",
            width: 200,
            renderCell: (params) => (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAuthenticateEmployee(params.row)}
                  disabled={params.row.isAuthenticated}
                  style={{ marginRight: "10px" }}
                >
                  Autenticar
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => handleDelete(params.row.id)}
                >
                  Eliminar
                </Button>
              </>
            ),
          },
        ]}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        autoHeight
        disableSelectionOnClick
      />
      <ToastContainer />
    </Box>
  );
};

export default UserList;
