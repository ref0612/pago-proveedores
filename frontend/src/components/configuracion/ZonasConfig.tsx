import React, { useState, useEffect } from 'react';
import { Globe, Plus, Trash2, Edit, X } from 'lucide-react';

interface Tramo {
  origen: { value: string; label: string } | null;
  destino: { value: string; label: string } | null;
  kilometraje: number;
}

interface Zona {
  id?: number;
  nombre: string;
  porcentaje: number;
  tramos?: Tramo[];
}

const ZonasConfig: React.FC = () => {
  const [ciudades, setCiudades] = useState([
    { value: 'Cartagena', label: 'Cartagena' },
    { value: 'Concón', label: 'Concón' },
    { value: 'El Tabo', label: 'El Tabo' },
    { value: 'Laguna Verde', label: 'Laguna Verde' },
    { value: 'Limache', label: 'Limache' },
    { value: 'Los Andes', label: 'Los Andes' },
    { value: 'San Antonio', label: 'San Antonio' },
    { value: 'San Felipe', label: 'San Felipe' },
    { value: 'Santiago', label: 'Santiago' },
    { value: 'Santo Domingo', label: 'Santo Domingo' },
    { value: 'Valparaiso', label: 'Valparaiso' },
    { value: 'Villa Alemana', label: 'Villa Alemana' },
    { value: 'Viña Del Mar', label: 'Viña Del Mar' },
  ]);
  
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [nombre, setNombre] = useState('');
  const [porcentaje, setPorcentaje] = useState<number>(0);
  const [editId, setEditId] = useState<number | null>(null);
  const [tramos, setTramos] = useState<Tramo[]>([{ origen: null, destino: null, kilometraje: 0 }]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar zonas al montar
  useEffect(() => {
    cargarZonas();
    cargarCiudades();
  }, []);

  const cargarZonas = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/zones?page=0&size=1000');
      const data = await res.json();
      setZonas(data.content || data);
    } catch (err) {
      console.error('Error cargando zonas:', err);
      setError('Error al cargar las zonas');
    } finally {
      setLoading(false);
    }
  };

  const cargarCiudades = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/trips');
      const data = await res.json();
      const ciudadesUnicas = new Set<string>();
      
      data.forEach((trip: any) => {
        if (trip.origin) ciudadesUnicas.add(trip.origin.trim());
        if (trip.destination) ciudadesUnicas.add(trip.destination.trim());
      });

      const nuevasCiudades = Array.from(ciudadesUnicas)
        .filter(ciudad => !ciudades.some(c => c.value === ciudad))
        .map(ciudad => ({ value: ciudad, label: ciudad }));

      if (nuevasCiudades.length > 0) {
        setCiudades(prev => [...prev, ...nuevasCiudades]);
      }
    } catch (err) {
      console.error('Error cargando ciudades:', err);
    }
  };

  const handleTramoChange = (idx: number, field: keyof Tramo, value: any) => {
    setTramos(tramos.map((t, i) => (i === idx ? { ...t, [field]: value } : t)));
  };

  const handleAddTramo = () => {
    setTramos([...tramos, { origen: null, destino: null, kilometraje: 0 }]);
  };

  const handleRemoveTramo = (idx: number) => {
    if (tramos.length > 1) {
      setTramos(tramos.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || porcentaje <= 0) return;

    const zonaData = { 
      nombre, 
      porcentaje,
      tramos: tramos.filter(t => t.origen && t.destino && t.kilometraje > 0)
    };

    try {
      setLoading(true);
      if (editId) {
        const res = await fetch(`/api/zones/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(zonaData),
        });
        if (res.ok) {
          const zonaEditada = await res.json();
          setZonas(zonas.map(z => (z.id === editId ? { ...zonaEditada, tramos } : z)));
          resetForm();
        }
      } else {
        const res = await fetch('/api/zones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(zonaData),
        });
        if (res.ok) {
          const zonaCreada = await res.json();
          setZonas([...zonas, { ...zonaCreada, tramos }]);
          resetForm();
        }
      }
    } catch (err) {
      console.error('Error guardando zona:', err);
      setError('Error al guardar la zona');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm('¿Está seguro de eliminar esta zona?')) return;
    
    try {
      setLoading(true);
      const res = await fetch(`/api/zones/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setZonas(zonas.filter(z => z.id !== id));
      }
    } catch (err) {
      console.error('Error eliminando zona:', err);
      setError('Error al eliminar la zona');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (zona: Zona) => {
    setEditId(zona.id || null);
    setNombre(zona.nombre);
    setPorcentaje(zona.porcentaje);
    setTramos(zona.tramos || [{ origen: null, destino: null, kilometraje: 0 }]);
    setShowModal(true);
  };

  const resetForm = () => {
    setEditId(null);
    setNombre('');
    setPorcentaje(0);
    setTramos([{ origen: null, destino: null, kilometraje: 0 }]);
    setShowModal(false);
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Configuración de Zonas</h3>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Zona
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {zonas.map((zona) => (
            <li key={zona.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 truncate">{zona.nombre}</p>
                    <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>Porcentaje: {zona.porcentaje}%</span>
                      </div>
                      {zona.tramos && zona.tramos.length > 0 && (
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span>
                            Tramos: {zona.tramos.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    <button
                      onClick={() => handleEdit(zona)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(zona.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {zonas.length === 0 && !loading && (
            <li className="px-4 py-4 text-center text-gray-500">
              No hay zonas configuradas
            </li>
          )}
          {loading && zonas.length === 0 && (
            <li className="px-4 py-4 text-center text-gray-500">
              Cargando zonas...
            </li>
          )}
        </ul>
      </div>

      {/* Modal para agregar/editar zona */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Cerrar</span>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {editId ? 'Editar Zona' : 'Nueva Zona'}
                  </h3>
                  <div className="mt-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                          Nombre de la Zona
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="nombre"
                            id="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="porcentaje" className="block text-sm font-medium text-gray-700">
                          Porcentaje (%)
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            name="porcentaje"
                            id="porcentaje"
                            min="0"
                            max="100"
                            value={porcentaje}
                            onChange={(e) => setPorcentaje(Number(e.target.value))}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-medium text-gray-700">
                            Tramos de la Zona
                          </label>
                          <button
                            type="button"
                            onClick={handleAddTramo}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Plus className="h-3 w-3 mr-1" /> Agregar Tramo
                          </button>
                        </div>
                        <div className="mt-2 space-y-4">
                          {tramos.map((tramo, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                              <div className="col-span-5">
                                <select
                                  value={tramo.origen?.value || ''}
                                  onChange={(e) => {
                                    const selected = ciudades.find(c => c.value === e.target.value);
                                    handleTramoChange(idx, 'origen', selected || null);
                                  }}
                                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                  <option value="">Seleccione origen</option>
                                  {ciudades.map((ciudad) => (
                                    <option key={ciudad.value} value={ciudad.value}>
                                      {ciudad.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-span-5">
                                <select
                                  value={tramo.destino?.value || ''}
                                  onChange={(e) => {
                                    const selected = ciudades.find(c => c.value === e.target.value);
                                    handleTramoChange(idx, 'destino', selected || null);
                                  }}
                                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                  <option value="">Seleccione destino</option>
                                  {ciudades.map((ciudad) => (
                                    <option key={ciudad.value} value={ciudad.value}>
                                      {ciudad.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-span-1">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={tramo.kilometraje}
                                  onChange={(e) => handleTramoChange(idx, 'kilometraje', Number(e.target.value))}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  placeholder="Km"
                                />
                              </div>
                              <div className="col-span-1">
                                {tramos.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTramo(idx)}
                                    className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZonasConfig;
