import React, { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Button,
} from "@mui/material";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase"; // Ajusta la ruta según tu configuración
import "./inbox.css";

const Access = ({ open, onClose, userId }) => {
  const [status, setStatus] = useState({
    isPremium: false,
    isBanned: false,
    enabled: false,
    protected: false,
  });

  // Cargar los datos actuales del usuario desde Firestore
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setStatus({
            isPremium: userData.isPremium || false,
            isBanned: userData.isBanned || false,
            enabled: userData.enabled || false,
            protected: userData.protected || false,
          });
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
      }
    };

    if (userId) fetchUserStatus();
  }, [userId]);

  // Actualizar los estados locales al interactuar con los switches
  const handleChange = (field) => {
    setStatus((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Guardar los cambios en Firestore
  const handleSave = async () => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, status);
      onClose();
      console.log("Datos actualizados correctamente:", status);
    } catch (error) {
      console.error("Error al actualizar datos del usuario:", error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "#f0e1d2",
          borderRadius: "10px",
          boxShadow: 24,
          p: 4,
          width: "90%",
          maxWidth: 500,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Configuración de Accesos
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={status.isPremium}
              onChange={() => handleChange("isPremium")}
            />
          }
          label="Premium"
        />
        <FormControlLabel
          control={
            <Switch
              checked={status.isBanned}
              onChange={() => handleChange("isBanned")}
            />
          }
          label="Baneado"
        />
        <FormControlLabel
          control={
            <Switch
              checked={status.enabled}
              onChange={() => handleChange("enabled")}
            />
          }
          label="Habilitado"
        />
        <FormControlLabel
          control={
            <Switch
              checked={status.protected}
              onChange={() => handleChange("protected")}
            />
          }
          label="Protegido"
        />
        <Box mt={2} textAlign="right">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            sx={{ mr: 1 }}
          >
            Guardar
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default Access;
