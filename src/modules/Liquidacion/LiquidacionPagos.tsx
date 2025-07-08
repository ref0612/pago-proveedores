import React, { useState } from 'react';

interface Liquidacion {
  id: number;
  decena: string;
  empresario: string;
  monto: number;
  pagado: boolean;
  fechaPago?: string;
  medioPago?: string;
  comprobante?: string;
  alertaVencimiento: boolean;
}

const decenas = ['2024-07-01 al 2024-07-10', '2024-07-11 al 2024-07-20'];
const empresarios = ['Empresa 1', 'Empresa 2'];

const datosIniciales: Liquidacion[] = [
  { id: 1, decena: decenas[0], empresario: empresarios[0], monto: 100000, pagado: false, alertaVencimiento: true },
  { id: 2, decena: decenas[0], empresario: empresarios[1], monto: 80000, pagado: true, fechaPago: '2024-07-15', medioPago: 'Transferencia', comprobante: 'comprobante1.pdf', alertaVencimiento: false },
];

export default function LiquidacionPagos() {
  const [liquidaciones, setLiquidaciones] = useState<Liquidacion[]>(datosIniciales);
  const [pago, setPago] = useState({ fechaPago: '', medioPago: '', comprobante: '' });
  const [selected, setSelected] = useState<number | null>(null);

  const handlePagar = (id: number) => {
    setLiquidaciones(liquidaciones => liquidaciones.map(l =>
      l.id === id ? {
        ...l,
        pagado: true,
        fechaPago: pago.fechaPago,
        medioPago: pago.medioPago,
        comprobante: pago.comprobante,
        alertaVencimiento: false,
      } : l
    ));
    setPago({ fechaPago: '', medioPago: '', comprobante: '' });
    setSelected(null);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Liquidación y Pagos</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-blue-100">
              <th className="p-2">Decena</th>
              <th className="p-2">Empresario</th>
              <th className="p-2">Monto</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Fecha Pago</th>
              <th className="p-2">Medio</th>
              <th className="p-2">Comprobante</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {liquidaciones.map((l, i) => (
              <tr key={l.id} className="border-t">
                <td className="p-2">{l.decena}</td>
                <td className="p-2">{l.empresario}</td>
                <td className="p-2">${l.monto.toLocaleString()}</td>
                <td className="p-2">
                  {l.pagado ? <span className="text-green-600 font-semibold">Pagado</span> : <span className="text-red-600 font-semibold">Pendiente</span>}
                  {l.alertaVencimiento && !l.pagado && (
                    <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">¡Vence pronto!</span>
                  )}
                </td>
                <td className="p-2">{l.fechaPago || '-'}</td>
                <td className="p-2">{l.medioPago || '-'}</td>
                <td className="p-2">{l.comprobante ? <a href="#" className="text-blue-600 underline">{l.comprobante}</a> : '-'}</td>
                <td className="p-2">
                  {!l.pagado ? (
                    selected === l.id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          className="border p-1 text-xs"
                          type="date"
                          placeholder="Fecha de pago"
                          value={pago.fechaPago}
                          onChange={e => setPago({ ...pago, fechaPago: e.target.value })}
                        />
                        <input
                          className="border p-1 text-xs"
                          placeholder="Medio de pago"
                          value={pago.medioPago}
                          onChange={e => setPago({ ...pago, medioPago: e.target.value })}
                        />
                        <input
                          className="border p-1 text-xs"
                          placeholder="Comprobante (nombre archivo)"
                          value={pago.comprobante}
                          onChange={e => setPago({ ...pago, comprobante: e.target.value })}
                        />
                        <button className="bg-green-600 text-white px-2 py-1 rounded" onClick={() => handlePagar(l.id)}>Registrar Pago</button>
                        <button className="text-xs text-gray-500 underline" onClick={() => setSelected(null)}>Cancelar</button>
                      </div>
                    ) : (
                      <button className="bg-blue-600 text-white px-2 py-1 rounded" onClick={() => setSelected(l.id)}>Registrar Pago</button>
                    )
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
            {liquidaciones.length === 0 && (
              <tr><td colSpan={8} className="text-center text-gray-400 p-4">No hay liquidaciones registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-xs text-gray-500">* Al registrar el pago, se asocia automáticamente a empresario y período. Se alerta si el pago está por vencer.</div>
    </div>
  );
} 