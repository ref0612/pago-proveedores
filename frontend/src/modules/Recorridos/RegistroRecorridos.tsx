import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Modal from 'react-modal';
import { SingleValue } from 'react-select';
import * as XLSX from 'xlsx';

interface Tramo {
  origen: { value: string; label: string } | null;
  destino: { value: string; label: string } | null;
  kilometraje: number;
}

// Función para normalizar nombres de ciudades (minúsculas, sin tildes, sin espacios extra)
function normalizeCityName(name: string): string {
  if (!name) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina tildes y diacríticos
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const RegistroRecorridos: React.FC = () => {
  const [ciudadesChile, setCiudadesChile] = useState([
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
  const [zones, setZones] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [porcentaje, setPorcentaje] = useState<number>(0);
  const [editId, setEditId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  // Formulario zona
  const [nombreZona, setNombreZona] = useState('');
  const [porcentajeZona, setPorcentajeZona] = useState<number>(0);
  // Tramos dinámicos
  const [tramos, setTramos] = useState<Tramo[]>([
    { origen: null, destino: null, kilometraje: 0 },
  ]);

  // Estado para edición de zona
  const [editZone, setEditZone] = useState<any | null>(null);
  // Estado para edición de tramo
  const [editTramo, setEditTramo] = useState<{ tramo: any, zoneId: number } | null>(null);

  // Estado para modal de resumen de importación masiva
  const [bulkSummary, setBulkSummary] = useState<any | null>(null);
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
  const [bulkWarnings, setBulkWarnings] = useState<string[]>([]);
  const [bulkData, setBulkData] = useState<Record<string, { porcentaje: number, tramos: any[] }>>({});
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  // Estado para ciudades no configuradas
  const [unconfiguredCities, setUnconfiguredCities] = useState<string[]>([]);
  const [unconfiguredTramos, setUnconfiguredTramos] = useState<Array<{origen: string, destino: string}>>([]);
  const [showCitiesModal, setShowCitiesModal] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Cargar zonas al montar
  useEffect(() => {
    fetch('/api/zones')
      .then(res => res.json())
      .then(data => setZones(data))
      .catch(err => console.error('Error cargando zonas:', err));
  }, []);

  // Al montar, obtener ciudades únicas de los viajes y agregarlas si no existen
  useEffect(() => {
    fetch('http://localhost:8080/api/trips')
      .then(res => res.json())
      .then(data => {
        const ciudadesViajes = new Map<string, string>();
        data.forEach((trip: any) => {
          if (trip.origin) {
            const norm = normalizeCityName(trip.origin);
            if (!ciudadesViajes.has(norm)) ciudadesViajes.set(norm, trip.origin.trim());
          }
          if (trip.destination) {
            const norm = normalizeCityName(trip.destination);
            if (!ciudadesViajes.has(norm)) ciudadesViajes.set(norm, trip.destination.trim());
          }
        });
        setCiudadesChile(prev => {
          const existentes = new Map(prev.map(c => [normalizeCityName(c.value), c.value]));
          const nuevas = Array.from(ciudadesViajes.entries())
            .filter(([norm]) => !existentes.has(norm))
            .map(([_, original]) => ({ value: original, label: original }));
          return [
            ...prev,
            ...nuevas
          ];
        });
      })
      .catch(err => console.error('Error cargando ciudades de viajes:', err));
  }, []);

  // Modal config
  useEffect(() => {
    Modal.setAppElement('#root');
  }, []);

  // Handlers tramos
  const handleTramoChange = (idx: number, field: keyof Tramo, value: any) => {
    setTramos(tramos =>
      tramos.map((t, i) =>
        i === idx ? { ...t, [field]: value } : t
      )
    );
  };
  const handleAddTramo = () => {
    setTramos([...tramos, { origen: null, destino: null, kilometraje: 0 }]);
  };
  const handleRemoveTramo = (idx: number) => {
    if (tramos.length === 1) return;
    setTramos(tramos => tramos.filter((_, i) => i !== idx));
  };

  // Crear o editar zona
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || porcentaje <= 0) return;
    const zona = { nombre, porcentaje };
    if (editId) {
      // Editar
      const res = await fetch(`/api/zones/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zona),
      });
      if (res.ok) {
        const zonaEditada = await res.json();
        setZones(zones.map(z => (z.id === editId ? zonaEditada : z)));
        setEditId(null);
        setNombre('');
        setPorcentaje(0);
      }
    } else {
      // Crear
      const res = await fetch('/api/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zona),
      });
      if (res.ok) {
        const zonaCreada = await res.json();
        setZones([...zones, zonaCreada]);
        setNombre('');
        setPorcentaje(0);
      }
    }
  };

  // Eliminar zona
  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (!window.confirm('¿Seguro que deseas eliminar esta zona?')) return;
    const res = await fetch(`/api/zones/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setZones(zones.filter(z => z.id !== id));
    }
  };

  // Editar zona (cargar en formulario)
  const handleEdit = (zone: any) => {
    setEditId(zone.id!);
    setNombre(zone.nombre);
    setPorcentaje(zone.porcentaje);
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditId(null);
    setNombre('');
    setPorcentaje(0);
  };

  // Abrir modal para editar zona
  const handleEditZone = (zone: any) => {
    setEditZone(zone);
    setNombreZona(zone.nombre);
    setPorcentajeZona(zone.porcentaje);
    // Mostrar los tramos asociados en el modal (solo visualización)
    const tramosZona = routesByZone[zone.id] || [];
    setTramos(tramosZona.map((t: any) => ({
      origen: ciudadesChile.find(c => c.value === t.origen) || { value: t.origen, label: t.origen },
      destino: ciudadesChile.find(c => c.value === t.destino) || { value: t.destino, label: t.destino },
      kilometraje: t.kilometraje
    })));
    setModalOpen(true);
  };

  // Guardar edición de zona (ahora permite CRUD de tramos)
  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let zonaCreada = editZone;
      // 1. Actualizar zona (nombre, porcentaje)
      if (editZone) {
        const zonaRes = await fetch(`/api/zones/${editZone.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: nombreZona, porcentaje: porcentajeZona }),
        });
        if (!zonaRes.ok) throw new Error('Error actualizando zona');
        zonaCreada = await zonaRes.json();
      } else {
        // Crear zona nueva
        const zonaRes = await fetch('/api/zones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: nombreZona, porcentaje: porcentajeZona }),
        });
        if (!zonaRes.ok) throw new Error('Error creando zona');
        zonaCreada = await zonaRes.json();
      }
      // 2. Obtener tramos actuales en backend (solo si es edición)
      let tramosBackend: any[] = [];
      if (editZone) {
        const routesRes = await fetch('/api/routes');
        const allRoutes = await routesRes.json();
        tramosBackend = allRoutes.filter((r: any) => r.zona && r.zona.id === editZone.id);
      }
      // 3. Determinar tramos a crear y a eliminar
      const tramosValidos = tramos.filter(t => t.origen && t.destino && t.kilometraje > 0);
      // Tramos a crear: los que no existen en backend
      const tramosToCreate = tramosValidos.filter(t =>
        !tramosBackend.some(tb => tb.origen === t.origen?.value && tb.destino === t.destino?.value)
      );
      // Tramos a eliminar: los que están en backend pero no en el array actual
      const tramosToDelete = tramosBackend.filter(tb =>
        !tramosValidos.some(t => t.origen?.value === tb.origen && t.destino?.value === tb.destino)
      );
      // 4. Crear tramos nuevos
      await Promise.all(
        tramosToCreate.map(tramo =>
          fetch('/api/routes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origen: tramo.origen?.value,
              destino: tramo.destino?.value,
              kilometraje: tramo.kilometraje,
              zona: zonaCreada,
            }),
          })
        )
      );
      // 5. Eliminar tramos quitados
      await Promise.all(
        tramosToDelete.map(tb =>
          fetch(`/api/routes/${tb.id}`, { method: 'DELETE' })
        )
      );
      // 6. Actualizar listado de zonas
      const zonasActualizadas = await fetch('/api/zones').then(res => res.json());
      setZones(zonasActualizadas);
      setModalOpen(false);
      setEditZone(null);
      setNombreZona('');
      setPorcentajeZona(0);
      setTramos([{ origen: null, destino: null, kilometraje: 0 }]);
      setSuccessMsg(editZone ? 'Zona y tramos actualizados correctamente' : 'Zona y tramos guardados correctamente');
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      alert('Error guardando zona y tramos: ' + (err as Error).message);
    }
  };

  // Mostrar tramos asociados a cada zona
  const [routesByZone, setRoutesByZone] = useState<{ [zoneId: number]: any[] }>({});
  useEffect(() => {
    // Cargar tramos para cada zona
    const fetchRoutes = async () => {
      const routesRes = await fetch('/api/routes');
      const allRoutes = await routesRes.json();
      const grouped: { [zoneId: number]: any[] } = {};
      allRoutes.forEach((route: any) => {
        if (route.zona && route.zona.id) {
          if (!grouped[route.zona.id]) grouped[route.zona.id] = [];
          grouped[route.zona.id].push(route);
        }
      });
      setRoutesByZone(grouped);
    };
    fetchRoutes();
  }, [zones]);

  // Eliminar zona y sus tramos asociados
  const handleDeleteZone = async (id?: number) => {
    if (!id) return;
    if (!window.confirm('¿Seguro que deseas eliminar esta zona y todos sus tramos asociados?')) return;
    // Eliminar tramos asociados primero
    const tramos = routesByZone[id] || [];
    await Promise.all(tramos.map(tramo => fetch(`/api/routes/${tramo.id}`, { method: 'DELETE' })));
    // Eliminar zona
    const res = await fetch(`/api/zones/${id}`, { method: 'DELETE' });
    if (res.ok) {
      const zonasActualizadas = await fetch('/api/zones').then(res => res.json());
      setZones(zonasActualizadas);
      setSuccessMsg('Zona eliminada correctamente');
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  // Eliminar tramo individual
  const handleDeleteTramo = async (tramoId: number, zoneId: number) => {
    if (!window.confirm('¿Seguro que deseas eliminar este tramo?')) return;
    const res = await fetch(`/api/routes/${tramoId}`, { method: 'DELETE' });
    if (res.ok) {
      // Actualizar tramos de la zona
      const routesRes = await fetch('/api/routes');
      const allRoutes = await routesRes.json();
      const grouped: { [zoneId: number]: any[] } = {};
      allRoutes.forEach((route: any) => {
        if (route.zona && route.zona.id) {
          if (!grouped[route.zona.id]) grouped[route.zona.id] = [];
          grouped[route.zona.id].push(route);
        }
      });
      setRoutesByZone(grouped);
      setSuccessMsg('Tramo eliminado correctamente');
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  // Eliminar el modal y lógica de edición de tramo individual

  // Carga masiva desde Excel/CSV con validación y agrupación
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = evt.target?.result;
      if (!data) return;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      // Buscar encabezado
      const header = rows[0].map((h: string) => h.trim().toLowerCase());
      const idxNombre = header.indexOf('nombre');
      const idxOrigen = header.indexOf('origen');
      const idxDestino = header.indexOf('destino');
      const idxKm = header.indexOf('km');
      const idxPorcentaje = header.indexOf('porcentaje');
      const errors: string[] = [];
      const warnings: string[] = [];
      if (idxNombre === -1 || idxOrigen === -1 || idxDestino === -1 || idxKm === -1 || idxPorcentaje === -1) {
        errors.push('El archivo debe tener los encabezados: Nombre | Origen | Destino | KM | Porcentaje');
      }
      // Agrupar por zona
      const zonasMap: Record<string, { porcentaje: number, tramos: any[] }> = {};
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const nombre = String(row[idxNombre] || '').trim();
        const origen = String(row[idxOrigen] || '').trim();
        const destino = String(row[idxDestino] || '').trim();
        const km = Number(row[idxKm]);
        const porcentaje = Number(row[idxPorcentaje]);
        // Validaciones
        if (!nombre || !origen || !destino || !row[idxKm] || !row[idxPorcentaje]) {
          errors.push(`Fila ${i + 1}: Todos los campos son obligatorios.`);
          continue;
        }
        if (isNaN(km) || km <= 0) {
          errors.push(`Fila ${i + 1}: KM debe ser un número positivo.`);
        }
        if (isNaN(porcentaje) || porcentaje <= 0) {
          errors.push(`Fila ${i + 1}: Porcentaje debe ser un número positivo.`);
        }
        // Agrupar por zona
        if (!zonasMap[nombre]) {
          zonasMap[nombre] = { porcentaje, tramos: [] };
        } else {
          // Validar que el porcentaje sea consistente
          if (zonasMap[nombre].porcentaje !== porcentaje) {
            errors.push(`Fila ${i + 1}: El porcentaje de la zona '${nombre}' no es consistente con otras filas.`);
          }
        }
        zonasMap[nombre].tramos.push({ origen, destino, km });
      }
      // Validar duplicados y existencia en backend
      const zonasExistentes = await fetch('/api/zones').then(res => res.json());
      const routesExistentes = await fetch('/api/routes').then(res => res.json());
      const resumen: any[] = [];
      Object.entries(zonasMap).forEach(([nombre, data]) => {
        const zonaExistente = zonasExistentes.find((z: any) => z.nombre === nombre);
        const tramosNuevos: any[] = [];
        const tramosDuplicados: any[] = [];
        data.tramos.forEach((t: any) => {
          const existe = routesExistentes.some((r: any) =>
            r.zona && r.zona.nombre === nombre &&
            ((r.origen === t.origen && r.destino === t.destino) || (r.origen === t.destino && r.destino === t.origen))
          );
          if (existe) {
            tramosDuplicados.push(t);
            warnings.push(`El tramo ${t.origen} - ${t.destino} ya existe en la zona '${nombre}'. Agregarlo podría duplicar el pago de producción.`);
          } else {
            tramosNuevos.push(t);
          }
        });
        resumen.push({
          nombre,
          porcentaje: data.porcentaje,
          zonaExistente: !!zonaExistente,
          tramosNuevos,
          tramosDuplicados
        });
        if (zonaExistente) {
          warnings.push(`La zona '${nombre}' ya existe y será actualizada.`);
        }
      });
      setBulkSummary(resumen);
      setBulkErrors(errors);
      setBulkWarnings(warnings);
      setBulkData(zonasMap);
      setBulkModalOpen(true);
    };
    reader.readAsBinaryString(file);
  };

  // Actualizar routesExistentes al cargar el modal de carga masiva
  const [routesExistentes, setRoutesExistentes] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/routes').then(res => res.json()).then(setRoutesExistentes);
  }, [bulkModalOpen]);

  // Confirmar importación masiva
  const handleBulkConfirm = async () => {
    setBulkModalOpen(false);
    for (const nombre in bulkData) {
      const data = bulkData[nombre];
      // Buscar o crear zona
      let zona = zones.find(z => z.nombre === nombre);
      if (!zona) {
        const res = await fetch('/api/zones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre, porcentaje: data.porcentaje }),
        });
        if (!res.ok) continue;
        zona = await res.json();
      } else {
        // Actualizar porcentaje si cambió
        if (zona.porcentaje !== data.porcentaje) {
          await fetch(`/api/zones/${zona.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, porcentaje: data.porcentaje }),
          });
        }
      }
      // Crear tramos nuevos (comparando localmente)
      for (const tramo of data.tramos) {
        const existe = routesExistentes.some((r: any) =>
          r.zona && r.zona.nombre === nombre &&
          ((r.origen === tramo.origen && r.destino === tramo.destino) || (r.origen === tramo.destino && r.destino === tramo.origen))
        );
        if (!existe) {
          await fetch('/api/routes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              origen: tramo.origen,
              destino: tramo.destino,
              kilometraje: tramo.km,
              zona,
            }),
          });
        }
      }
    }
    // Refrescar zonas y tramos
    const zonasActualizadas = await fetch('/api/zones').then(res => res.json());
    setZones(zonasActualizadas);
    fetch('/api/routes').then(res => res.json()).then(setRoutesExistentes);
    setSuccessMsg('Carga masiva completada');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  // Función para obtener ciudades no configuradas
  const fetchUnconfiguredCities = async () => {
    setLoadingCities(true);
    try {
      const response = await fetch('http://localhost:8080/api/zones/unconfigured-tramos');
      if (response.ok) {
        const tramos = await response.json();
        setUnconfiguredTramos(tramos);
        setShowCitiesModal(true);
      } else {
        console.error('Error obteniendo tramos no configurados');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Manejo de Zonas</h1>
      <div className="flex gap-4 mb-6 items-center">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setModalOpen(true)}
        >
          Crear zona
        </button>
        <button
          className="bg-orange-600 text-white px-4 py-2 rounded"
          onClick={fetchUnconfiguredCities}
          disabled={loadingCities}
        >
          {loadingCities ? 'Cargando...' : 'Ver tramos sin configurar'}
        </button>
        <label className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer">
          Carga masiva (Excel)
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={handleBulkUpload}
            className="hidden"
          />
        </label>
      </div>
      {/* Modal para crear/editar zona */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => { setModalOpen(false); setEditZone(null); }}
        contentLabel={editZone ? "Editar Zona" : "Crear Zona"}
        className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-auto mt-20 outline-none flex flex-col max-h-[90vh]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
      >
        <h2 className="text-xl font-bold mb-4">{editZone ? "Editar Zona" : "Crear Zona"}</h2>
        <form onSubmit={handleSubmitModal} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto min-h-0 flex-1 pr-2" style={{ maxHeight: '60vh' }}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nombre de la zona</label>
              <input
                type="text"
                value={nombreZona}
                onChange={e => setNombreZona(e.target.value)}
                className="border px-2 py-1 rounded w-full"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">% de comisión de la zona</label>
              <input
                type="text"
                value={porcentajeZona}
                onChange={e => setPorcentajeZona(Number(e.target.value.replace(/[^\d.]/g, '')))}
                className="border px-2 py-1 rounded w-full"
                inputMode="decimal"
                required
              />
            </div>
            {editZone && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tramos configurados en la zona</label>
                {tramos.length ? (
                  <table className="border w-full text-xs">
                    <thead>
                      <tr>
                        <th className="px-2 py-1">Origen</th>
                        <th className="px-2 py-1">Destino</th>
                        <th className="px-2 py-1">Km</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tramos.map((t, i) => (
                        <tr key={i}>
                          <td className="px-2 py-1">{t.origen?.label ?? ''}</td>
                          <td className="px-2 py-1">{t.destino?.label ?? ''}</td>
                          <td className="px-2 py-1">{t.kilometraje}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <span className="text-gray-400">Sin tramos</span>
                )}
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Tramos de la zona</label>
              {tramos.map((tramo, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <span className="text-sm">Origen</span>
                  <div className="w-40">
                    <Select
                      options={ciudadesChile}
                      value={tramo.origen}
                      onChange={(opt: SingleValue<{ value: string; label: string }>) => handleTramoChange(idx, 'origen', opt)}
                      placeholder="Buscar ciudad..."
                      isSearchable
                    />
                  </div>
                  <span className="text-sm">Destino</span>
                  <div className="w-40">
                    <Select
                      options={ciudadesChile}
                      value={tramo.destino}
                      onChange={(opt: SingleValue<{ value: string; label: string }>) => handleTramoChange(idx, 'destino', opt)}
                      placeholder="Buscar ciudad..."
                      isSearchable
                    />
                  </div>
                  <input
                    type="number"
                    className="border px-2 py-1 rounded w-24"
                    placeholder="Km"
                    value={tramo.kilometraje}
                    min={0}
                    onChange={e => handleTramoChange(idx, 'kilometraje', Number(e.target.value))}
                    required
                  />
                  <button type="button" onClick={handleAddTramo} className="text-green-600 text-xl font-bold">＋</button>
                  <button type="button" onClick={() => handleRemoveTramo(idx)} className="text-red-500 text-xl font-bold">－</button>
                </div>
              ))}
            </div>
          </div>
          {/* Footer fijo */}
          <div className="flex justify-end gap-2 pt-4 border-t bg-white sticky bottom-0 z-10">
            <button type="button" onClick={() => setModalOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancelar</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Guardar zona</button>
          </div>
        </form>
      </Modal>
      {/* Modal de resumen de importación masiva */}
      <Modal
        isOpen={bulkModalOpen}
        onRequestClose={() => setBulkModalOpen(false)}
        contentLabel="Resumen de importación"
        className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto mt-20 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Resumen de importación</h2>
        {bulkErrors.length > 0 && (
          <div className="mb-4">
            {bulkErrors.map((err, i) => (
              <div key={i} className="text-red-600 font-semibold">{err}</div>
            ))}
          </div>
        )}
        {bulkWarnings.length > 0 && (
          <div className="mb-4">
            {bulkWarnings.map((warn, i) => (
              <div key={i} className="text-orange-500 font-semibold">{warn}</div>
            ))}
          </div>
        )}
        {bulkSummary && bulkErrors.length === 0 && (
          <div className="mb-4">
            {bulkSummary.map((z: any, i: number) => (
              <div key={i} className="mb-2">
                <div className="font-bold">
                  Zona: {z.nombre} ({z.zonaExistente ? 'Actualizar' : 'Crear nueva'}) - %: {z.porcentaje}
                </div>
                <div className="ml-4">
                  <span className="font-semibold">Tramos a agregar:</span> {z.tramosNuevos.map((t: any) => `${t.origen} - ${t.destino} (${t.km} km)`).join(', ') || 'Ninguno'}
                </div>
                {z.tramosDuplicados.length > 0 && (
                  <div className="ml-4 text-orange-500">
                    <span className="font-semibold">Tramos duplicados:</span> {z.tramosDuplicados.map((t: any) => `${t.origen} - ${t.destino}`).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <button type="button" onClick={() => setBulkModalOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancelar</button>
          <button
            type="button"
            onClick={handleBulkConfirm}
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={bulkErrors.length > 0}
          >
            Confirmar importación
          </button>
        </div>
      </Modal>
      {/* Modal de ciudades no configuradas */}
      <Modal
        isOpen={showCitiesModal}
        onRequestClose={() => setShowCitiesModal(false)}
        contentLabel="Tramos no configurados"
        className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto mt-20 outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center"
      >
        <h2 className="text-xl font-bold mb-4">Verificación de tramos en zonas</h2>
        {unconfiguredTramos.length === 0 ? (
          <div className="text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <p className="text-green-600 font-medium text-lg mb-2">
              ¡Excelente! Todos los tramos están configurados
            </p>
            <p className="text-gray-600 text-sm">
              Todos los tramos presentes en los viajes están correctamente asignados a sus zonas correspondientes.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center mb-4">
              <div className="text-orange-600 text-2xl mr-2">⚠️</div>
              <p className="text-orange-600 font-medium">
                Se encontraron {unconfiguredTramos.length} tramo{unconfiguredTramos.length > 1 ? 's' : ''} sin configurar
              </p>
            </div>
            <p className="mb-4 text-gray-700">
              Los siguientes tramos están presentes en los viajes pero no están asignados a ninguna zona. 
              Por favor, asígnalos a una zona para poder usarlos correctamente:
            </p>
            <div className="max-h-60 overflow-y-auto border rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Origen</th>
                    <th className="px-4 py-3 text-left font-medium">Destino</th>
                  </tr>
                </thead>
                <tbody>
                  {unconfiguredTramos.map((tramo, index) => {
                    const origenBonito = ciudadesChile.find(c => normalizeCityName(c.value) === normalizeCityName(tramo.origen))?.label || tramo.origen;
                    const destinoBonito = ciudadesChile.find(c => normalizeCityName(c.value) === normalizeCityName(tramo.destino))?.label || tramo.destino;
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{origenBonito}</td>
                        <td className="px-4 py-3 font-medium">{destinoBonito}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              💡 <strong>Consejo:</strong> Puedes crear una nueva zona o agregar estos tramos a una zona existente.
            </p>
          </div>
        )}
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setShowCitiesModal(false)}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </Modal>
      {/* Eliminar el modal y lógica de edición de tramo individual */}
      {successMsg && (
        <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4 text-center font-semibold">
          {successMsg}
        </div>
      )}
      <table className="min-w-full border divide-y divide-gray-200 text-sm mt-8">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Nombre</th>
            <th className="px-4 py-2 text-left">Porcentaje (%)</th>
            <th className="px-4 py-2 text-left">Tramos asociados</th>
            <th className="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {zones.map(zone => (
            <tr key={zone.id} className="border-b align-top">
              <td className="px-4 py-2 font-medium">{zone.nombre}</td>
              <td className="px-4 py-2">{zone.porcentaje}</td>
              <td className="px-4 py-2">
                {routesByZone[zone.id]?.length ? (
                  <table className="border w-full text-xs">
                    <thead>
                      <tr>
                        <th className="px-2 py-1">Origen</th>
                        <th className="px-2 py-1">Destino</th>
                        <th className="px-2 py-1">Km</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routesByZone[zone.id].map((r, i) => (
                        <tr key={i}>
                          <td className="px-2 py-1">{r.origen}</td>
                          <td className="px-2 py-1">{r.destino}</td>
                          <td className="px-2 py-1">{r.kilometraje}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <span className="text-gray-400">Sin tramos</span>
                )}
              </td>
              <td className="px-4 py-2">
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                  onClick={() => handleEditZone(zone)}
                >
                  Editar
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleDeleteZone(zone.id)}
                >
                  Eliminar zona
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RegistroRecorridos; 