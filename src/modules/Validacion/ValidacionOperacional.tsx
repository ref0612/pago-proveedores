import React, { useState } from 'react';

interface Validacion {
  decena: string;
  empresario: string;
  total: number;
  validado: boolean;
  comentarios: string;
  bloqueado: boolean;
}

const decenas = ['2024-07-01 al 2024-07-10', '2024-07-11 al 2024-07-20'];
const empresarios = ['Empresa 1', 'Empresa 2'];

const datosIniciales: Validacion[] = [
  { decena: decenas[0], empresario: empresarios[0], total: 100000, validado: false, comentarios: '', bloqueado: false },
  { decena: decenas[0], empresario: empresarios[1], total: 80000, validado: true, comentarios: 'Validado sin observaciones', bloqueado: true },
];

export default function ValidacionOperacional() {
  const [validaciones, setValidaciones] = useState<Validacion[]>(datosIniciales);
  const [comentario, setComentario] = useState<string>('');

  const handleAprobar = (i: number) => {
    setValidaciones(validaciones => validaciones.map((v, idx) => idx === i ? { ...v, validado: true, comentarios: comentario, bloqueado: true } : v));
    setComentario('');
  };

  const handleRechazar = (i: number) => {
    setValidaciones(validaciones => validaciones.map((v, idx) => idx === i ? { ...v, validado: false, comentarios: comentario, bloqueado: true } : v));
    setComentario('');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Validación Operacional</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-blue-100">
              <th className="p-2">Decena</th>
              <th className="p-2">Empresario</th>
              <th className="p-2">Total</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Comentarios</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {validaciones.map((v, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{v.decena}</td>
                <td className="p-2">{v.empresario}</td>
                <td className="p-2">${v.total.toLocaleString()}</td>
                <td className="p-2">
                  {v.validado ? <span className="text-green-600 font-semibold">Aprobado</span> : <span className="text-red-600 font-semibold">Pendiente/Rechazado</span>}
                </td>
                <td className="p-2">{v.comentarios}</td>
                <td className="p-2">
                  {!v.bloqueado ? (
                    <div className="flex flex-col gap-2">
                      <input
                        className="border p-1 text-xs"
                        placeholder="Comentarios"
                        value={comentario}
                        onChange={e => setComentario(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button className="bg-green-600 text-white px-2 py-1 rounded" onClick={() => handleAprobar(i)}>Aprobar</button>
                        <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => handleRechazar(i)}>Rechazar</button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Bloqueado</span>
                  )}
                </td>
              </tr>
            ))}
            {validaciones.length === 0 && (
              <tr><td colSpan={6} className="text-center text-gray-400 p-4">No hay producciones para validar.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-xs text-gray-500">* Tras aprobar o rechazar, la edición queda bloqueada.</div>
    </div>
  );
} 