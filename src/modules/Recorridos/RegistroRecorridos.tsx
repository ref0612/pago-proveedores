import React, { useState } from 'react';

interface Recorrido {
  fecha: string;
  origen: string;
  destino: string;
  horario: string;
  tipologia: string;
  zona: string;
  empresario: string;
  kilometraje?: number;
}

const zonas = ['JB', 'Norte Largo', 'Centro', 'Sur'];
const empresarios = ['Empresa 1', 'Empresa 2', 'Empresa 3'];

export default function RegistroRecorridos() {
  const [recorridos, setRecorridos] = useState<Recorrido[]>([]);
  const [lote, setLote] = useState<Recorrido[]>([]);
  const [form, setForm] = useState<Recorrido>({
    fecha: '',
    origen: '',
    destino: '',
    horario: '',
    tipologia: '',
    zona: zonas[0],
    empresario: empresarios[0],
    kilometraje: undefined,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddToBatch = (e: React.FormEvent) => {
    e.preventDefault();
    // Validación básica
    if (!form.fecha || !form.origen || !form.destino || !form.horario || !form.tipologia) {
      setError('Completa todos los campos obligatorios');
      return;
    }
    setLote([...lote, form]);
    setForm({ ...form, fecha: '', origen: '', destino: '', horario: '', tipologia: '', kilometraje: undefined });
    setError('');
    setSuccess('Recorrido agregado al lote');
    setTimeout(() => setSuccess(''), 1500);
  };

  const handleSaveBatch = () => {
    if (lote.length === 0) {
      setError('No hay recorridos en el lote para guardar');
      return;
    }
    setRecorridos([...recorridos, ...lote]);
    setLote([]);
    setError('');
    setSuccess('Lote de recorridos guardado');
    setTimeout(() => setSuccess(''), 2000);
  };

  // Preparado para carga masiva
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    alert('Funcionalidad de carga masiva por archivo próximamente.');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Registro de Recorridos</h1>
      <form onSubmit={handleAddToBatch} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-white p-4 rounded shadow">
        <input name="fecha" type="date" value={form.fecha} onChange={handleChange} className="border p-2" required />
        <input name="origen" placeholder="Origen" value={form.origen} onChange={handleChange} className="border p-2" required />
        <input name="destino" placeholder="Destino" value={form.destino} onChange={handleChange} className="border p-2" required />
        <input name="horario" placeholder="Horario" value={form.horario} onChange={handleChange} className="border p-2" required />
        <input name="tipologia" placeholder="Tipología" value={form.tipologia} onChange={handleChange} className="border p-2" required />
        <select name="zona" value={form.zona} onChange={handleChange} className="border p-2">
          {zonas.map(z => <option key={z}>{z}</option>)}
        </select>
        <select name="empresario" value={form.empresario} onChange={handleChange} className="border p-2">
          {empresarios.map(e => <option key={e}>{e}</option>)}
        </select>
        <input name="kilometraje" type="number" placeholder="Kilometraje (opcional)" value={form.kilometraje || ''} onChange={handleChange} className="border p-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded col-span-1 md:col-span-3">Agregar al lote</button>
      </form>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <button onClick={handleSaveBatch} className="bg-green-600 text-white px-4 py-2 rounded">Guardar lote</button>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="bg-gray-200 px-3 py-2 rounded">Carga masiva (próximamente)</span>
          <input type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFileUpload} disabled />
        </label>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <div className="mb-8">
        <h2 className="font-bold mb-2">Lote actual</h2>
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-blue-50">
              <th className="p-2">Fecha</th>
              <th className="p-2">Origen</th>
              <th className="p-2">Destino</th>
              <th className="p-2">Horario</th>
              <th className="p-2">Tipología</th>
              <th className="p-2">Zona</th>
              <th className="p-2">Empresario</th>
              <th className="p-2">Km</th>
            </tr>
          </thead>
          <tbody>
            {lote.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{r.fecha}</td>
                <td className="p-2">{r.origen}</td>
                <td className="p-2">{r.destino}</td>
                <td className="p-2">{r.horario}</td>
                <td className="p-2">{r.tipologia}</td>
                <td className="p-2">{r.zona}</td>
                <td className="p-2">{r.empresario}</td>
                <td className="p-2">{r.kilometraje || '-'}</td>
              </tr>
            ))}
            {lote.length === 0 && (
              <tr><td colSpan={8} className="text-center text-gray-400 p-4">No hay recorridos en el lote.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto">
        <h2 className="font-bold mb-2">Historial de recorridos guardados</h2>
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-blue-100">
              <th className="p-2">Fecha</th>
              <th className="p-2">Origen</th>
              <th className="p-2">Destino</th>
              <th className="p-2">Horario</th>
              <th className="p-2">Tipología</th>
              <th className="p-2">Zona</th>
              <th className="p-2">Empresario</th>
              <th className="p-2">Km</th>
            </tr>
          </thead>
          <tbody>
            {recorridos.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{r.fecha}</td>
                <td className="p-2">{r.origen}</td>
                <td className="p-2">{r.destino}</td>
                <td className="p-2">{r.horario}</td>
                <td className="p-2">{r.tipologia}</td>
                <td className="p-2">{r.zona}</td>
                <td className="p-2">{r.empresario}</td>
                <td className="p-2">{r.kilometraje || '-'}</td>
              </tr>
            ))}
            {recorridos.length === 0 && (
              <tr><td colSpan={8} className="text-center text-gray-400 p-4">No hay recorridos registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 