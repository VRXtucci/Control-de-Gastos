import './App.css';
import { useState, useEffect } from "react";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const categoriasOpciones = [
    { valor: "Fijos", etiqueta: "Gastos fijos" },
    { valor: "Ocio", etiqueta: "Ocio" },
    { valor: "Ahorros", etiqueta: "Ahorros" },
    { valor: "Deudas", etiqueta: "Deudas" },
  ];

  const categoriaColores = {
    "": "bg-gray-700 text-gray-200 border border-white",
    Fijos: "bg-green-700 text-green-200 border border-white",
    Ocio: "bg-yellow-700 text-yellow-200 border border-white",
    Ahorros: "bg-purple-700 text-purple-200 border border-white",
    Deudas: "bg-red-700 text-red-200 border border-white",
  };

  const [ingresoTotal, setIngresoTotal] = useState(() => {
    const saved = localStorage.getItem("ingresoTotal");
    return saved ? Number(saved) : 160;
  });

  const [etiquetas, setEtiquetas] = useState(() => {
    const saved = localStorage.getItem("etiquetas");
    return saved ? JSON.parse(saved) : [];
  });

  const [nuevoTipo, setNuevoTipo] = useState("");

  useEffect(() => {
    localStorage.setItem("ingresoTotal", ingresoTotal);
  }, [ingresoTotal]);

  useEffect(() => {
    localStorage.setItem("etiquetas", JSON.stringify(etiquetas));
  }, [etiquetas]);

  const handleCategoriaChange = (index, value) => {
    const nuevasEtiquetas = [...etiquetas];
    nuevasEtiquetas[index].categoria = value;
    setEtiquetas(nuevasEtiquetas);
  };

  const handleMontoChange = (index, campo, valor) => {
    const nuevasEtiquetas = [...etiquetas];
    nuevasEtiquetas[index][campo] = valor;
    setEtiquetas(nuevasEtiquetas);
  };

  const totalPresupuesto = etiquetas.reduce((acc, item) => acc + Number(item.presupuesto || 0), 0);
  const totalActual = etiquetas.reduce((acc, item) => acc + Number(item.actual || 0), 0);
  const restante = ingresoTotal - totalPresupuesto;

  const alertaPresupuesto = totalPresupuesto > ingresoTotal;
  const alertaActual = totalActual > ingresoTotal;

  const datosGrafico = categoriasOpciones.map(cat => {
    const totalCategoria = etiquetas
      .filter(item => item.categoria === cat.valor)
      .reduce((acc, item) => acc + Number(item.actual || 0), 0);
    return { name: cat.etiqueta, value: totalCategoria, categoria: cat.valor };
  });

  const coloresGrafico = {
    Fijos: "#166534",
    Ocio: "#854d0e",
    Ahorros: "#6b21a8",
    Deudas: "#991b1b",
  };

  const handleReset = () => {
    setEtiquetas([]);
    setIngresoTotal(160);
    localStorage.removeItem("etiquetas");
    localStorage.removeItem("ingresoTotal");
  };
  

  const inputEstilos = "border rounded px-2 py-1 text-white bg-gray-700";

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 py-4">Control de gastos</h1>

      <div className="px-4 py-2 max-w-5xl mx-auto">

        <div className="flex flex-col md:flex-row justify-center gap-6">
          <div className="border rounded-lg shadow p-4 mb-6 w-full md:w-[300px] h-[360px] overflow-y-auto flex flex-col justify-between bg-gray-800">
            <h2 className="text-xl font-semibold mb-2">Resumen</h2>
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between font-bold text-green-400">
                <span>Ingreso total</span>
                <input
                  type="number"
                  value={ingresoTotal}
                  onChange={(e) => setIngresoTotal(Number(e.target.value))}
                  className={`w-24 ${inputEstilos} text-right`}
                />
              </li>
              <li className="flex justify-between text-blue-400">
                <span>Total presupuestado</span>
                <span>${totalPresupuesto.toFixed(2)}</span>
              </li>
              <li className="flex justify-between text-purple-400">
                <span>Total gastado</span>
                <span>${totalActual.toFixed(2)}</span>
              </li>
              <li className="flex justify-between text-gray-300">
                <span>Dinero restante</span>
                <span>${restante.toFixed(2)}</span>
              </li>
              {alertaPresupuesto && (
                <li className="text-red-400 font-semibold">¡El presupuesto excede el ingreso!</li>
              )}
              {alertaActual && (
                <li className="text-red-400 font-semibold">¡El gasto actual excede el ingreso!</li>
              )}
            </ul>
            <button
              onClick={handleReset}
              className="mt-4 bg-red-700 hover:bg-red-800 text-white font-bold py-1 px-3 rounded w-full"
            >
              Resetear datos
            </button>
          </div>

          <div className="border rounded-lg shadow p-4 mb-6 w-full md:w-80 flex justify-center items-center bg-gray-800">
            <Doughnut
              data={{
                labels: datosGrafico.map(d => d.name),
                datasets: [
                  {
                    data: datosGrafico.map(d => d.value),
                    backgroundColor: datosGrafico.map(d => coloresGrafico[d.categoria]),
                    borderColor: "#ffffff",
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: { position: "bottom", labels: { color: "white" } },
                },
              }}
              width={300}
              height={300}
            />
          </div>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row gap-2 justify-center items-center">
          <input
            type="text"
            placeholder="Nuevo tipo"
            value={nuevoTipo}
            onChange={(e) => setNuevoTipo(e.target.value)}
            className={`w-full sm:w-64 ${inputEstilos}`}
          />
          <button
            onClick={() => {
              const tipo = nuevoTipo.trim();
              if (!tipo || etiquetas.find(et => et.nombre.toLowerCase() === tipo.toLowerCase())) return;

              setEtiquetas([...etiquetas, {
                nombre: tipo,
                categoria: "",
                presupuesto: "",
                actual: ""
              }]);
              setNuevoTipo("");
            }}
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-1 rounded w-full sm:w-auto"
          >
            Agregar tipo
          </button>
        </div>

        <div className="mb-6 border rounded-lg shadow p-4 overflow-x-auto bg-gray-800">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead>
              <tr>
                <th className="py-2 text-white">Tipo</th>
                <th className="py-2 text-white">Categoría</th>
                <th className="py-2 text-white">Presupuesto</th>
                <th className="py-2 text-white">Actual</th>
              </tr>
            </thead>
            <tbody>
              {etiquetas.map((etiqueta, index) => (
                <tr key={index} className="border-t border-gray-600">
                  <td className="py-1 text-white">{etiqueta.nombre}</td>
                  <td className="py-1">
                    <select
                      value={etiqueta.categoria}
                      onChange={(e) => handleCategoriaChange(index, e.target.value)}
                      className={`appearance-none border rounded p-1 pr-6 ${categoriaColores[etiqueta.categoria] || "border border-white"}`}
                    >
                      <option value="">Selecciona</option>
                      {categoriasOpciones.map((cat, i) => (
                        <option key={i} value={cat.valor} className="text-black">
                          {cat.etiqueta}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-1">
                    <input
                      type="number"
                      value={etiqueta.presupuesto}
                      onChange={(e) => handleMontoChange(index, "presupuesto", e.target.value)}
                      className={`w-24 ${inputEstilos}`}
                    />
                  </td>
                  <td className="py-1">
                    <input
                      type="number"
                      value={etiqueta.actual}
                      onChange={(e) => handleMontoChange(index, "actual", e.target.value)}
                      className={`w-24 ${inputEstilos}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

export default App;
