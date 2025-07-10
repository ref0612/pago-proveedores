// Servicio para manejar las peticiones HTTP con autenticación
const API_BASE_URL = 'http://localhost:8080/api';

// Función para obtener las credenciales de autenticación
const getAuthHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Temporalmente comentado para probar sin autenticación
  // const token = localStorage.getItem('authToken');
  // if (token) {
  //   headers['Authorization'] = `Bearer ${token}`;
  // }
  
  return headers;
};

// Función para obtener las credenciales para archivos (sin Content-Type)
const getFileAuthHeaders = () => {
  const headers: Record<string, string> = {};
  
  // Temporalmente comentado para probar sin autenticación
  // const token = localStorage.getItem('authToken');
  // if (token) {
  //   headers['Authorization'] = `Bearer ${token}`;
  // }
  
  return headers;
};

// Función genérica para peticiones GET
export const apiGet = async (endpoint: string) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Función genérica para peticiones POST
export const apiPost = async (endpoint: string, data?: any) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Función específica para subir archivos CSV
export const uploadCsvFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  console.log('Enviando archivo al backend:', file.name, 'Tamaño:', file.size);
  
  const response = await fetch(`${API_BASE_URL}/trips/import-csv`, {
    method: 'POST',
    headers: getFileAuthHeaders(),
    body: formData,
  });
  
  console.log('Response status:', response.status);
  console.log('Response headers:', response.headers);
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Error en la importación: ${response.status}`;
    
    if (response.status === 403) {
      errorMessage = `Error 403 - Acceso denegado. Posibles causas:\n- Problema de CORS\n- Configuración de seguridad incorrecta\n- Backend no disponible\n\nDetalles: ${errorText}`;
    } else if (response.status === 413) {
      errorMessage = `Error 413 - Archivo demasiado grande. El archivo excede el límite permitido.\n\nDetalles: ${errorText}`;
    } else if (response.status === 500) {
      errorMessage = `Error 500 - Error interno del servidor.\n\nDetalles: ${errorText}`;
    } else {
      errorMessage = `Error ${response.status} - ${errorText}`;
    }
    
    console.error('Error response:', errorMessage);
    throw new Error(errorMessage);
  }
  
  return response.json();
};

// Funciones específicas para viajes
export const tripsApi = {
  getAll: () => apiGet('/trips'),
  getAllPaginated: (page = 0, size = 1000) => apiGet(`/trips/paginated?page=${page}&size=${size}`),
  getAllComplete: async () => {
    console.log('Cargando todos los viajes...');
    const allTrips: any[] = [];
    let page = 0;
    let hasNext = true;
    
    while (hasNext) {
      console.log(`Cargando página ${page}...`);
      const response = await apiGet(`/trips/paginated?page=${page}&size=1000`);
      allTrips.push(...response.content);
      hasNext = response.hasNext;
      page++;
    }
    
    console.log(`Total de viajes cargados: ${allTrips.length}`);
    return allTrips;
  },
  getById: (id: number) => apiGet(`/trips/${id}`),
  create: (trip: any) => apiPost('/trips', trip),
  update: (id: number, trip: any) => apiPost(`/trips/${id}`, trip),
  delete: (id: number) => apiPost(`/trips/${id}/delete`),
  getByDate: (date: string) => apiGet(`/trips/date/${date}`),
  getByOrigin: (origin: string) => apiGet(`/trips/origin/${origin}`),
  getByDestination: (destination: string) => apiGet(`/trips/destination/${destination}`),
  getByCompany: (company: string) => apiGet(`/trips/company/${company}`),
  getByDriver: (driver: string) => apiGet(`/trips/driver/${driver}`),
  getByStatus: (status: string) => apiGet(`/trips/status/${status}`),
  getRevenueByDate: (date: string) => apiGet(`/trips/revenue/date/${date}`),
  getRevenueByCompany: (date: string) => apiGet(`/trips/revenue/company/${date}`),
  getRevenueByRoute: (date: string) => apiGet(`/trips/revenue/route/${date}`),
  getStats: () => apiGet('/trips/stats'),
  importCsv: uploadCsvFile,
};

export const productionsApi = {
  getAll: () => apiGet('/productions'),
  getAprobadas: () => apiGet('/productions?validado=true'),
  // Puedes agregar más funciones según sea necesario
};