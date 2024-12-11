// Aqui no se puede hacer nada nuevo, solo se puede contextualizar las colecciones de usuarios y eso
import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import "./pb.css";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const AnalysisPage = () => {
  const [data, setData] = useState({ entries: [], sessions: [], users: [] });
  const [xAxisFilter, setXAxisFilter] = useState(null);
  const [yAxisFilter, setYAxisFilter] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

  const clearFiltersAndCharts = () => {
    setXAxisFilter(null);
    setYAxisFilter(null);
    setFilteredData([]);
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate.seconds * 1000);
    let age = today.getFullYear() - birth.getFullYear();
    if (
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getZodiacSign = (birthDate) => {
    const birth = new Date(birthDate.seconds * 1000);
    const month = birth.getMonth() + 1;
    const day = birth.getDate();
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
      return "Acuario";
    // Añadir más signos zodiacales aquí
    return "Desconocido";
  };

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      const entriesSnapshot = await getDocs(collection(db, "entradas"));
      const sessionsSnapshot = await getDocs(collection(db, "sessions"));
      const usersSnapshot = await getDocs(collection(db, "users"));

      setData({
        entries: entriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
        sessions: sessionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
        users: usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      });
    };
    fetchData();
  }, []);

  // Process filters
  const processFilters = () => {
    const { entries } = data;

    if (!xAxisFilter || !yAxisFilter) {
      alert("Por favor selecciona filtros para ambos ejes.");
      return [];
    }

    let result = [];
    const xField = xAxisFilter;
    const yField = yAxisFilter;

    // Mapeo para campos especiales que requieren transformación
    const specialFields = {
      fechaCreacion: (entry) =>
        new Date(entry.fechaCreacion.seconds * 1000).toLocaleDateString(),
      isProtected: (entry) =>
        entry.isProtected ? "Protegido" : "No Protegido",
    };

    const getFieldValue = (entry, field) =>
      specialFields[field] ? specialFields[field](entry) : entry[field];

    // Procesar combinaciones dinámicamente
    result = entries.reduce((acc, entry) => {
      const xValue = getFieldValue(entry, xField) || "Sin Valor";
      const yValue = getFieldValue(entry, yField);

      // Manejo de múltiples valores (ej: emociones)
      if (Array.isArray(yValue)) {
        yValue.forEach((val) => {
          acc[xValue] = acc[xValue] || {};
          acc[xValue][val] = (acc[xValue][val] || 0) + 1;
        });
      } else {
        acc[xValue] = acc[xValue] || {};
        acc[xValue][yValue || "Sin Valor"] =
          (acc[xValue][yValue || "Sin Valor"] || 0) + 1;
      }

      return acc;
    }, {});

    // Transformar resultados en un formato de gráficos
    const formattedResult = Object.entries(result).flatMap(([xKey, yValues]) =>
      Object.entries(yValues).map(([yKey, count]) => ({
        x: xKey,
        y: count,
        label: yKey,
      }))
    );

    setFilteredData((prev) => [
      ...prev,
      { xAxis: xAxisFilter, yAxis: yAxisFilter, data: formattedResult },
    ]);
  };

  // combinacinoes para el tiempo: edad o fechas x
  const processFiltersTime = () => {
    const { users } = data;

    if (!xAxisFilter || !yAxisFilter) {
      alert("Por favor selecciona filtros para ambos ejes.");
      return;
    }

    const timeFields = {
      edad: (user) => calculateAge(user.birthDate),
      signo: (user) => getZodiacSign(user.birthDate),
      dia: (user) => {
        const date = new Date(user.createdAt.seconds * 1000);
        return date.getDate();
      },
      mes: (user) => {
        const date = new Date(user.createdAt.seconds * 1000);
        return date.toLocaleString("default", { month: "long" });
      },
      año: (user) => {
        const date = new Date(user.createdAt.seconds * 1000);
        return date.getFullYear();
      },
    };

    const getTimeFieldValue = (user, field) =>
      timeFields[field] ? timeFields[field](user) : "Sin Valor";

    const result = users.reduce((acc, user) => {
      const xValue = getTimeFieldValue(user, xAxisFilter);
      const yValue = getTimeFieldValue(user, yAxisFilter);

      if (!xValue || !yValue) return acc;

      acc[xValue] = acc[xValue] || {};
      acc[xValue][yValue] = (acc[xValue][yValue] || 0) + 1;

      return acc;
    }, {});

    const formattedResult = Object.entries(result).flatMap(([xKey, yValues]) =>
      Object.entries(yValues).map(([yKey, count]) => ({
        x: xKey,
        y: count,
        label: yKey,
      }))
    );

    setFilteredData((prev) => [
      ...prev,
      { xAxis: xAxisFilter, yAxis: yAxisFilter, data: formattedResult },
    ]);
  };

  const processFiltersUsers = () => {
    const { users } = data;

    if (!xAxisFilter || !yAxisFilter) {
      alert("Por favor selecciona filtros para ambos ejes.");
      return;
    }

    const userFields = {
      ciudad: (user) => user.ciudad || "Sin Ciudad",
      comuna: (user) => user.comuna || "Sin Comuna",
      pais: (user) => user.pais || "Sin País",
      premium: (user) => (user.isPremium ? "Premium" : "No Premium"),
    };

    const getUserFieldValue = (user, field) =>
      userFields[field] ? userFields[field](user) : "Sin Valor";

    const result = users.reduce((acc, user) => {
      const xValue = getUserFieldValue(user, xAxisFilter);
      const yValue = getUserFieldValue(user, yAxisFilter);

      if (!xValue || !yValue) return acc;

      acc[xValue] = acc[xValue] || {};
      acc[xValue][yValue] = (acc[xValue][yValue] || 0) + 1;

      return acc;
    }, {});

    const formattedResult = Object.entries(result).flatMap(([xKey, yValues]) =>
      Object.entries(yValues).map(([yKey, count]) => ({
        x: xKey,
        y: count,
        label: yKey,
      }))
    );

    setFilteredData((prev) => [
      ...prev,
      { xAxis: xAxisFilter, yAxis: yAxisFilter, data: formattedResult },
    ]);
  };

  useEffect(() => {
    const validateData = (users) => {
      if (!users || !Array.isArray(users)) {
        console.error("Error: Los datos de usuarios no son válidos.", users);
        return [];
      }

      return users.map((user) => ({
        ...user,
        birthDate: user.birthDate || null,
        createdAt: user.createdAt || null,
        isPremium: user.isPremium || false,
        comuna: user.comuna || "Sin Comuna",
        ciudad: user.ciudad || "Sin Ciudad",
        pais: user.pais || "Sin País",
      }));
    };

    const fetchData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setData((prevData) => ({
          ...prevData,
          users: validateData(usersData),
        }));
      } catch (error) {
        console.error("Error al cargar los datos de usuarios:", error);
      }
    };

    fetchData();
  }, []);

  // Drag-and-Drop handlers
  const [{ isOverX }, dropX] = useDrop({
    accept: ["filter", "category", "security", "creation", "user"],
    drop: (item) => setXAxisFilter(item.name),
    collect: (monitor) => ({
      isOverX: !!monitor.isOver(),
    }),
  });

  const [{ isOverY }, dropY] = useDrop({
    accept: ["filter", "category", "security", "creation", "user"],
    drop: (item) => setYAxisFilter(item.name),
    collect: (monitor) => ({
      isOverY: !!monitor.isOver(),
    }),
  });

  const [{ isDragging }, dragEmotion] = useDrag({
    type: "filter",
    item: { name: "emociones" },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [{ isDraggingCategory }, dragCategory] = useDrag({
    type: "category",
    item: { name: "categorías" },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [{ isDraggingSecurity }, dragSecurity] = useDrag({
    type: "security",
    item: { name: "seguridad" },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [{ isDraggingCreation }, dragCreation] = useDrag({
    type: "creation",
    item: { name: "fechaCreacion" },
    collect: (monitor) => ({
      isDraggingCreation: !!monitor.isDragging(),
    }),
  });

  const [{ isDraggingUser }, dragUser] = useDrag({
    type: "user",
    item: { name: "userID" },
    collect: (monitor) => ({
      isDraggingUser: !!monitor.isDragging(),
    }),
  });

  const [{ isDraggingAge }, dragAge] = useDrag({
    type: "user",
    item: { name: "edad" },
    collect: (monitor) => ({
      isDraggingAge: !!monitor.isDragging(),
    }),
  });

  const [{ isDraggingSign }, dragSign] = useDrag({
    type: "user",
    item: { name: "signo" },
    collect: (monitor) => ({
      isDraggingSign: !!monitor.isDragging(),
    }),
  });

  const [{ isDraggingCity }, dragCity] = useDrag({
    type: "user",
    item: { name: "ciudad" },
    collect: (monitor) => ({
      isDraggingCity: !!monitor.isDragging(),
    }),
  });

  const [{ isDraggingdragCommune }, dragCommune] = useDrag({
    type: "user",
    item: { name: "comuna" },
    collect: (monitor) => ({
      isDraggingCommune: !!monitor.isDragging(),
    }),
  });
  const [{ isDraggingdragCountry }, dragCountry] = useDrag({
    type: "user",
    item: { name: "pais" },
    collect: (monitor) => ({
      isDraggingCountry: !!monitor.isDragging(),
    }),
  });
  const [{ isDraggingdragPremium }, dragPremium] = useDrag({
    type: "user",
    item: { name: "premium" },
    collect: (monitor) => ({
      isDraggingPremium: !!monitor.isDragging(),
    }),
  });
  const [{ isDraggingdragCreatedAt }, dragCreatedAt] = useDrag({
    type: "user",
    item: { name: "creacion" },
    collect: (monitor) => ({
      isDraggingCreatedAt: !!monitor.isDragging(),
    }),
  });
  const [{ isDraggingdragLevel }, dragLevel] = useDrag({
    type: "user",
    item: { name: "creacion" },
    collect: (monitor) => ({
      isDraggingLevel: !!monitor.isDragging(),
    }),
  });

  // Render chart
  const renderChart = () => {
    if (!filteredData.length) {
      return <p>No hay datos para los filtros seleccionados.</p>;
    }

    return filteredData.map((dataset, index) => {
      const chartData = {
        labels: dataset.data.map((item) => item.label),
        datasets: [
          {
            label: `${dataset.yAxis} por ${dataset.xAxis}`,
            data: dataset.data.map((item) => item.y),
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
          },
        ],
      };

      return <Bar key={index} data={chartData} />;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="pb-container">
        <div className="pb-filters">
          <div className="pb-section">
            <h3>Entradas</h3>
            <button ref={dragEmotion} className="pb-filter-button pb-emociones">
              Emociones
            </button>
            <button
              ref={dragCategory}
              className="pb-filter-button pb-categorias"
            >
              Categorías
            </button>
            <button
              ref={dragSecurity}
              className="pb-filter-button pb-seguridad"
            >
              Seguridad
            </button>
            <button ref={dragCreation} className="pb-filter-button pb-creacion">
              Fecha de Creación
            </button>
            <button ref={dragUser} className="pb-filter-button pb-user">
              Entradas por Usuario
            </button>
          </div>

          <div className="pb-section">
            <h3>Usuarios</h3>
            <button ref={dragAge} className="pb-filter-button pb-edad">
              Edad
            </button>
            <button ref={dragSign} className="pb-filter-button pb-signo">
              Signo
            </button>
            <button ref={dragCity} className="pb-filter-button pb-ciudad">
              Ciudad
            </button>
            <button ref={dragCommune} className="pb-filter-button pb-comuna">
              Comuna
            </button>
            <button ref={dragCountry} className="pb-filter-button pb-pais">
              País
            </button>
            <button ref={dragPremium} className="pb-filter-button pb-premium">
              Premium
            </button>
            <button
              ref={dragCreatedAt}
              className="pb-filter-button pb-creacion"
            >
              Fecha de Creación
            </button>
            {/* <button ref={dragLevel} className="pb-filter-button pb-nivel">
              Nivel
            </button> */}
          </div>
        </div>

        <div className="pb-add-filters">
          <h3>Insertar filtros</h3>
          <div className="pb-filters-container">
            <div
              ref={dropX}
              className={`pb-filter-slot ${isOverX ? "pb-highlight" : ""}`}
            >
              {xAxisFilter || "Eje X"}
            </div>
            <div
              ref={dropY}
              className={`pb-filter-slot ${isOverY ? "pb-highlight" : ""}`}
            >
              {yAxisFilter || "Eje Y"}
            </div>
          </div>
          <button onClick={processFilters}>Agregar Gráfico</button>
          <button onClick={clearFiltersAndCharts} className="pb-clear-button">
            Limpiar Gráficos
          </button>

          <div className="pb-section">
            <h3>Tiempo</h3>
            <button className="pb-filter-button pb-dia">Día</button>
            <button className="pb-filter-button pb-mes">Mes</button>
            <button className="pb-filter-button pb-ano">Año</button>
          </div>
        </div>

        <div className="pb-graphs">{renderChart()}</div>
      </div>
    </DndProvider>
  );
};

export default AnalysisPage;
