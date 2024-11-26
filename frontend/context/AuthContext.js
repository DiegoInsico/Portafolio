// src/context/AuthContext.js

import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Objeto del usuario autenticado
  const [userData, setUserData] = useState(null); // Datos adicionales del usuario desde Firestore
  const [isPremium, setIsPremium] = useState(false); // Estado premium del usuario
  const [loading, setLoading] = useState(true); // Estado de carga mientras se verifica la autenticación

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserData(userDoc.data());
            setIsPremium(userDoc.data().isPremium || false); // Asegúrate de tener este campo en Firestore
          } else {
            setUserData(null);
            setIsPremium(false);
          }
        } catch (error) {
          console.error("Error obteniendo datos del usuario:", error);
          setUserData(null);
          setIsPremium(false);
        }
      } else {
        setUser(null);
        setUserData(null);
        setIsPremium(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, userData, isPremium, setIsPremium, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
