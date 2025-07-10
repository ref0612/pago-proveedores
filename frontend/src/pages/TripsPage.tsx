import React, { useState, useEffect } from 'react';
import CsvImport from '../components/CsvImport';
import Modal from '../components/Modal';
import TripList from '../components/TripList';
import { tripsApi } from '../services/api';

interface Trip {
  id: number;
  travelDate: string;
  departureTime: string;
  origin: string;
  destination: string;
  routeName: string;
  serviceCode: string;
  serviceType: string;
  status: string;
  busNumber: string;
  licensePlate: string;
  vehicleYear: number;
  totalSeats: number;
  initialScore: number;
  additionalScore: number;
  totalScore: number;
  compensation: number;
  totalCompensated: number;
  companyRut: string;
  companyName: string;
  driverName: string;
  branchSeats: number;
  branchRevenue: number;
  roadSeats: number;
  roadRevenue: number;
  manualIncome: string;
}

// Función para obtener la decena actual
function getDecenaActual(): string {
  const ahora = new Date();
  const mes = ahora.getMonth() + 1; // getMonth() devuelve 0-11
  const año = ahora.getFullYear();
  const dia = ahora.getDate();
  
  // Determinar qué decena estamos
  let decena = 1;
  if (dia > 20) decena = 3;
  else if (dia > 10) decena = 2;
  
  return `${decena}${mes.toString().padStart(2, '0')}${año}`;
}

// Función para obtener fechas de una decena
function getFechasDecena(decenaStr: string): { desde: string; hasta: string } {
  const decena = parseInt(decenaStr.charAt(0));
  const mes = parseInt(decenaStr.substring(1, 3));
  const año = parseInt(decenaStr.substring(3));
  
  let diaInicio = 1;
  let diaFin = 10;
  
  if (decena === 2) {
    diaInicio = 11;
    diaFin = 20;
  } else if (decena === 3) {
    diaInicio = 21;
    // Obtener el último día del mes (0 significa último día del mes anterior)
    const ultimoDia = new Date(año, mes, 0).getDate();
    diaFin = ultimoDia;
  }
  
  const desde = `${año}-${mes.toString().padStart(2, '0')}-${diaInicio.toString().padStart(2, '0')}`;
  const hasta = `${año}-${mes.toString().padStart(2, '0')}-${diaFin.toString().padStart(2, '0')}`;
  
  return { desde, hasta };
}

// Función para generar opciones de decenas (últimos 12 meses)
function generarOpcionesDecenas(): string[] {
  const opciones: string[] = [];
  const ahora = new Date();
  
  for (let i = 0; i < 12; i++) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const mes = fecha.getMonth() + 1;
    const año = fecha.getFullYear();
    
    // Agregar las 3 decenas del mes
    opciones.push(`1${mes.toString().padStart(2, '0')}${año}`);
    opciones.push(`2${mes.toString().padStart(2, '0')}${año}`);
    opciones.push(`3${mes.toString().padStart(2, '0')}${año}`);
  }
  
  return opciones;
}

// Función para obtener el nombre del mes y año de una decena
function getNombreMesDecena(decenaStr: string): string {
  const mes = parseInt(decenaStr.substring(1, 3));
  const año = parseInt(decenaStr.substring(3));
  const fecha = new Date(año, mes - 1, 1); // mes - 1 porque getMonth() devuelve 0-11
  return fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

const TripsPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [decenaSeleccionada, setDecenaSeleccionada] = useState<string>(getDecenaActual());
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState<string>('');

  // Cargar viajes al montar el componente
  useEffect(() => {
    fetchTrips();
  }, []);

  // Actualizar fechas cuando cambia la decena seleccionada
  useEffect(() => {
    if (decenaSeleccionada) {
      const { desde, hasta } = getFechasDecena(decenaSeleccionada);
      setFechaDesde(desde);
      setFechaHasta(hasta);
    }
  }, [decenaSeleccionada]);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    setLoadingProgress('Iniciando carga...');
    
    try {
      console.log('Iniciando carga de viajes...');
      const data = await tripsApi.getAllComplete();
      console.log(`Viajes cargados: ${data.length}`);
      setTrips(data);
      setLoadingProgress(`Carga completada: ${data.length} viajes`);
    } catch (err) {
      setError('Error al cargar los viajes');
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingProgress(''), 3000); // Limpiar mensaje después de 3 segundos
    }
  };

  // Filtrar viajes por fecha
  const tripsFiltrados = trips.filter(trip => {
    if (!trip.travelDate) return true;
    const fechaViaje = new Date(trip.travelDate);
    const fechaViajeYMD = fechaViaje.toISOString().slice(0, 10); // 'YYYY-MM-DD'

    if (fechaDesde) {
      if (fechaViajeYMD < fechaDesde) {
        return false;
      }
    }
    if (fechaHasta) {
      if (fechaViajeYMD > fechaHasta) {
        return false;
      }
    }
    return true;
  });

  // Mostrar todas las fechas únicas presentes en los viajes cargados
  console.log('Fechas únicas en los viajes cargados:', Array.from(new Set(trips.map(t => t.travelDate))));

  // Validar que la fecha "hasta" sea mayor o igual que "desde"
  const fechaValida = !fechaDesde || !fechaHasta || new Date(fechaDesde) <= new Date(fechaHasta);
  const mensajeError = fechaDesde && fechaHasta && !fechaValida 
    ? 'La fecha "Hasta" debe ser mayor o igual que la fecha "Desde"' 
    : '';

  const handleImportSuccess = (importedTrips: Trip[]) => {
    setTrips(importedTrips);
    setShowImportModal(false);
    alert(`Importación exitosa: ${importedTrips.length} viajes importados.`);
  };

  const handleImportError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
  };

  const handleTripSelect = (trip: Trip) => {
    // Aquí puedes implementar la lógica para mostrar detalles del viaje
    console.log('Viaje seleccionado:', trip);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sistema de Transporte Pullman</h1>
          <p className="mt-2 text-gray-600">Gestión de viajes y análisis de ingresos</p>
        </div>

        {/* Botones de acción */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Importar CSV
          </button>
          
          <button
            onClick={fetchTrips}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Actualizar Datos'}
          </button>
        </div>

        {/* Filtros de fecha */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Filtros por Decena</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Decena:
            </label>
            <select
              value={decenaSeleccionada}
              onChange={(e) => setDecenaSeleccionada(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {generarOpcionesDecenas().map(decena => {
                const decenaNum = decena.charAt(0);
                const nombreMesAño = getNombreMesDecena(decena);
                
                return (
                  <option key={decena} value={decena}>
                    {decenaNum}ª Decena {nombreMesAño}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="text-sm text-gray-600 mb-3">
            <strong>Período seleccionado:</strong> {fechaDesde && fechaHasta ? 
              `${new Date(fechaDesde).toLocaleDateString()} - ${new Date(fechaHasta).toLocaleDateString()}` : 
              'No seleccionado'
            }
          </div>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desde:
              </label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !fechaValida ? 'border-red-500' : 'border-gray-300'
                }`}
                max={fechaHasta || undefined}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hasta:
              </label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !fechaValida ? 'border-red-500' : 'border-gray-300'
                }`}
                min={fechaDesde || undefined}
              />
            </div>
            <button
              onClick={() => {
                setDecenaSeleccionada(getDecenaActual());
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Ir a Decena Actual
            </button>
          </div>
          {mensajeError && (
            <p className="text-sm text-red-600 mt-2">{mensajeError}</p>
          )}
          {(fechaDesde || fechaHasta) && (
            <p className="text-sm text-gray-600 mt-2">
              Mostrando {fechaValida ? tripsFiltrados.length : 0} de {trips.length} viajes
            </p>
          )}
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Indicador de progreso */}
        {loadingProgress && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-700 text-sm">{loadingProgress}</p>
          </div>
        )}

        {/* Lista de viajes */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Cargando viajes...</span>
          </div>
        ) : (fechaValida && tripsFiltrados.length > 0) ? (
          <TripList trips={tripsFiltrados} onTripSelect={handleTripSelect} />
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {!fechaValida ? 'Rango de fechas inválido' : 
               trips.length > 0 ? 'No hay viajes en el rango de fechas seleccionado' : 'No hay viajes registrados'}
            </h3>
            <p className="text-gray-500 mb-4">
              {!fechaValida ? 'Corrige el rango de fechas seleccionado.' :
               trips.length > 0 
                ? 'Ajusta los filtros de fecha o importa más datos.'
                : 'Importa un archivo CSV para comenzar a gestionar los viajes.'
              }
            </p>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Importar CSV
            </button>
          </div>
        )}
      </div>

      {/* Modal de importación */}
      <Modal
        isOpen={showImportModal}
        onClose={handleCloseImportModal}
        title="Importar Datos CSV"
        size="lg"
      >
        <CsvImport
          onImportSuccess={handleImportSuccess}
          onImportError={handleImportError}
          onClose={handleCloseImportModal}
        />
      </Modal>
    </div>
  );
};

export default TripsPage; 