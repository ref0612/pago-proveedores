import React, { useState, useEffect } from 'react';

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

interface TripListProps {
  trips: Trip[];
  onTripSelect?: (trip: Trip) => void;
}

const TripList: React.FC<TripListProps> = ({ trips, onTripSelect }) => {
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>(trips);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    let filtered = trips;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(trip =>
        trip.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter) {
      filtered = filtered.filter(trip => trip.status === statusFilter);
    }

    // Filtrar por empresa
    if (companyFilter) {
      filtered = filtered.filter(trip => trip.companyName === companyFilter);
    }

    setFilteredTrips(filtered);
    setCurrentPage(1);
  }, [trips, searchTerm, statusFilter, companyFilter]);

  // Obtener viajes únicos para los filtros
  const uniqueStatuses = Array.from(new Set(trips.map(trip => trip.status)));
  const uniqueCompanies = Array.from(new Set(trips.map(trip => trip.companyName)));

  // Calcular paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTrips = filteredTrips.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Mostrar solo HH:MM
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Lista de Viajes</h2>
      
      {/* Filtros */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <input
            type="text"
            placeholder="Origen, destino, ruta, conductor, bus, patente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Empresa
          </label>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las empresas</option>
            {uniqueCompanies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setCompanyFilter('');
            }}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="font-semibold text-blue-800">Total Viajes</p>
          <p className="text-2xl font-bold text-blue-600">{filteredTrips.length}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-md">
          <p className="font-semibold text-green-800">Ingresos Sucursal</p>
          <p className="text-lg font-bold text-green-600">
            {formatCurrency(filteredTrips.reduce((sum, trip) => sum + (trip.branchRevenue || 0), 0))}
          </p>
        </div>
        <div className="bg-orange-50 p-3 rounded-md">
          <p className="font-semibold text-orange-800">Ingresos Camino</p>
          <p className="text-lg font-bold text-orange-600">
            {formatCurrency(filteredTrips.reduce((sum, trip) => sum + (trip.roadRevenue || 0), 0))}
          </p>
        </div>
        <div className="bg-purple-50 p-3 rounded-md">
          <p className="font-semibold text-purple-800">Total Ingresos</p>
          <p className="text-lg font-bold text-purple-600">
            {formatCurrency(filteredTrips.reduce((sum, trip) => sum + (trip.branchRevenue || 0) + (trip.roadRevenue || 0), 0))}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="w-full overflow-x-auto">
        <table className="min-w-full w-full divide-y divide-gray-200 text-xs md:text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Hora</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Ruta</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Origen</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Destino</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Bus</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Patente</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Empresa</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Conductor</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Asientos</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Sucursal</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Camino</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Manual</th>
              <th className="px-4 py-2 text-left font-medium text-gray-500 uppercase">Total Ingresos</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentTrips.map((trip) => (
              <tr 
                key={trip.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onTripSelect?.(trip)}
              >
                <td className="px-4 py-2 whitespace-nowrap">{formatDate(trip.travelDate)}</td>
                <td className="px-4 py-2 whitespace-nowrap">{formatTime(trip.departureTime)}</td>
                <td className="px-4 py-2 whitespace-nowrap font-medium">{trip.routeName}</td>
                <td className="px-4 py-2 whitespace-nowrap">{trip.origin}</td>
                <td className="px-4 py-2 whitespace-nowrap">{trip.destination}</td>
                <td className="px-4 py-2 whitespace-nowrap"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{trip.busNumber || 'N/A'}</span></td>
                <td className="px-4 py-2 whitespace-nowrap"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{trip.licensePlate || 'N/A'}</span></td>
                <td className="px-4 py-2 whitespace-nowrap">{trip.companyName}</td>
                <td className="px-4 py-2 whitespace-nowrap">{trip.driverName}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    trip.status === 'Recaudado' ? 'bg-green-100 text-green-800' :
                    trip.status === 'Completados' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {trip.status}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-center">{trip.totalSeats}</td>
                <td className="px-4 py-2 whitespace-nowrap text-right">{formatCurrency(trip.branchRevenue || 0)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-right">{formatCurrency(trip.roadRevenue || 0)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-right">{trip.manualIncome || '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-right font-bold">{formatCurrency((trip.branchRevenue || 0) + (trip.roadRevenue || 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredTrips.length)} de {filteredTrips.length} resultados
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripList; 