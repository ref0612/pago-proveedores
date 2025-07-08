import React, { useState } from 'react';

const decenas = ['2024-07-01 al 2024-07-10', '2024-07-11 al 2024-07-20'];
const zonas = ['JB', 'Norte Largo', 'Centro', 'Sur'];
const empresarios = ['Empresa 1', 'Empresa 2', 'Empresa 3'];

const datos = [
  { decena: decenas[0], zona: 'JB', empresario: 'Empresa 1', recorridos: 100, monto: 20000 },
  { decena: decenas[0], zona: 'Norte Largo', empresario: 'Empresa 2', recorridos: 80, monto: 16800 },
  { decena: decenas[1], zona: 'Centro', empresario: 'Empresa 3', recorridos: 120, monto: 22800 },
];

export default function ReportesGenerales() {
  const [filtroDecena, setFiltroDecena] = useState('');
  const [filtroZona, setFiltroZona] = useState('');
  const [filtroEmpresario, setFiltroEmpresario] = useState('');

  const filtrados = datos.filter(d =>
    (!filtroDecena || d.decena === filtroDecena) &&
    (!filtroZona || d.zona === filtroZona) &&
    (!filtroEmpresario || d.empresario === filtroEmpresario)
  );

  const handleExport = (tipo: 'pdf' | 'excel') => {
    alert(`Exportando reporte a ${tipo.toUpperCase()} (simulado)`);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Reportes Generales</h1>
      <div className="flex flex-wrap gap-4 mb-4">
        <select className="border p-2" value={filtroDecena} onChange={e => setFiltroDecena(e.target.value)}>
          <option value="">Todas las decenas</option>
          {decenas.map(d => <option key={d}>{d}</option>)}
        </select>
        <select className="border p-2" value={filtroZona} onChange={e => setFiltroZona(e.target.value)}>
          <option value="">Todas las zonas</option>
          {zonas.map(z => <option key={z}>{z}</option>)}
        </select>
        <select className="border p-2" value={filtroEmpresario} onChange={e => setFiltroEmpresario(e.target.value)}>
          <option value="">Todos los empresarios</option>
          {empresarios.map(e => <option key={e}>{e}</option>)}
        </select>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => handleExport('pdf')}>Exportar PDF</button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => handleExport('excel')}>Exportar Excel</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-blue-100">
              <th className="p-2">Decena</th>
              <th className="p-2">Zona</th>
              <th className="p-2">Empresario</th>
              <th className="p-2">Recorridos</th>
              <th className="p-2">Monto</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((d, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{d.decena}</td>
                <td className="p-2">{d.zona}</td>
                <td className="p-2">{d.empresario}</td>
                <td className="p-2">{d.recorridos}</td>
                <td className="p-2">${d.monto.toLocaleString()}</td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={5} className="text-center text-gray-400 p-4">No hay datos para mostrar.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2">Ranking de Empresarios</h2>
        <ol className="list-decimal ml-6">
          {empresarios.map(e => (
            <li key={e} className="mb-1">{e} - Total: ${datos.filter(d => d.empresario === e).reduce((acc, d) => acc + d.monto, 0).toLocaleString()}</li>
          ))}
        </ol>
      </div>
    </div>
  );
} 