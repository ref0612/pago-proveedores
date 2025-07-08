import React, { useState } from 'react';

interface Produccion {
  decena: string;
  empresario: string;
  zona: string;
  totalRecorridos: number;
  porcentajeZona: number;
  monto: number;
  editable: boolean;
}

const zonas = [
  { nombre: 'JB', porcentaje: 0.20 },
  { nombre: 'Norte Largo', porcentaje: 0.21 },
  { nombre: 'Centro', porcentaje: 0.19 },
  { nombre: 'Sur', porcentaje: 0.18 },
];
const empresarios = ['Empresa 1', 'Empresa 2', 'Empresa 3'];
const decenas = ['2024-07-01 al 2024-07-10', '2024-07-11 al 2024-07-20', '2024-07-21 al 2024-07-30'];

export default function CalculoProduccion() {
  const [producciones, setProducciones] = useState<Produccion[]>([
    {
      decena: decenas[0],
      empresario: empresarios[0],
      zona: zonas[0].nombre,
      totalRecorridos: 100,
      porcentajeZona: zonas[0].porcentaje,
      monto: 100 * 1000 * zonas[0].porcentaje, // ejemplo: 100 recorridos x $1000 x %
      editable: true,
    },
    {
      decena: decenas[0],
      empresario: empresarios[1],
      zona: zonas[1].nombre,
      totalRecorridos: 80,
      porcentajeZona: zonas[1].porcentaje,
      monto: 80 * 1000 * zonas[1].porcentaje,
      editable: false,
    },
  ]);

  const handleEdit = (i: number) => {
    setProducciones(producciones => producciones.map((p, idx) => idx === i ? { ...p, editable: true } : p));
  };

  const handleChange = (i: number, field: keyof Produccion, value: string | number) => {
    setProducciones(producciones => producciones.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };

  const handleSave = (i: number) => {
    setProducciones(producciones => producciones.map((p, idx) => {
      if (idx === i) {
        const zona = zonas.find(z => z.nombre === p.zona);
        const porcentaje = zona ? zona.porcentaje : 0;
        const monto = p.totalRecorridos * 1000 * porcentaje;
        return { ...p, porcentajeZona: porcentaje, monto, editable: false };
      }
      return p;
    }));
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Cálculo de Producción</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-blue-100">
              <th className="p-2">Decena</th>
              <th className="p-2">Empresario</th>
              <th className="p-2">Zona</th>
              <th className="p-2">Total Recorridos</th>
              <th className="p-2">% Zona</th>
              <th className="p-2">Monto</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {producciones.map((p, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{p.decena}</td>
                <td className="p-2">{p.empresario}</td>
                <td className="p-2">{p.zona}</td>
                <td className="p-2">
                  {p.editable ? (
                    <input
                      type="number"
                      className="border p-1 w-20"
                      value={p.totalRecorridos}
                      onChange={e => handleChange(i, 'totalRecorridos', Number(e.target.value))}
                    />
                  ) : p.totalRecorridos}
                </td>
                <td className="p-2">{(p.porcentajeZona * 100).toFixed(2)}%</td>
                <td className="p-2">${p.monto.toLocaleString()}</td>
                <td className="p-2">
                  {p.editable ? (
                    <button className="bg-green-600 text-white px-2 py-1 rounded" onClick={() => handleSave(i)}>Guardar</button>
                  ) : (
                    <button className="bg-yellow-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(i)}>Editar</button>
                  )}
                </td>
              </tr>
            ))}
            {producciones.length === 0 && (
              <tr><td colSpan={7} className="text-center text-gray-400 p-4">No hay producciones registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-xs text-gray-500">* El monto se calcula automáticamente: recorridos x $1000 x % zona.</div>
    </div>
  );
} 