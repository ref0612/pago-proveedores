import React, { useState } from 'react';
import { tripsApi } from '../services/api';

interface CsvImportProps {
  onImportSuccess?: (data: any[]) => void;
  onImportError?: (error: string) => void;
  onClose?: () => void;
}

interface ImportStats {
  totalLines: number;
  validLines: number;
  invalidLines: number;
  fileSize: number;
  fileName: string;
}

const CsvImport: React.FC<CsvImportProps> = ({ onImportSuccess, onImportError, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setImportStats(null);
      setShowStats(false);
    } else {
      alert('Por favor selecciona un archivo CSV válido.');
    }
  };

  const analyzeFile = async () => {
    if (!file) {
      alert('Por favor selecciona un archivo primero.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:8080/api/trips/import-csv/stats', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const stats = await response.json();
        setImportStats(stats);
        setShowStats(true);
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error al analizar el archivo: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error analyzing file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al analizar el archivo:\n\n${errorMessage}\n\nVerifica que el backend esté ejecutándose en http://localhost:8080`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Por favor selecciona un archivo primero.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log('Iniciando importación de archivo:', file.name, 'Tamaño:', file.size);
      const importedData = await tripsApi.importCsv(file);
      setUploadProgress(100);
      let message = `Importación exitosa: ${importedData.length} viajes importados.`;
      if (importStats) {
        message += `\n\nEstadísticas del archivo:\n- Total de líneas: ${importStats.totalLines}\n- Líneas válidas: ${importStats.validLines}\n- Líneas inválidas: ${importStats.invalidLines}`;
      }
      alert(message);
      onImportSuccess?.(importedData);
      setFile(null);
      setImportStats(null);
      setShowStats(false);
      onClose?.(); // Cerrar el modal después de importar exitosamente
      // Limpiar el input de archivo
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      onImportError?.(errorMessage);
      alert(`Error al importar el archivo:\n\n${errorMessage}\n\nVerifica que:\n- El backend esté ejecutándose en http://localhost:8080\n- El archivo sea un CSV válido\n- El archivo no exceda el límite de tamaño`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">Importar Datos CSV</h2>
        <p className="text-sm text-gray-600 mb-4">
          Selecciona un archivo CSV con los datos de viajes para importar al sistema.
        </p>
      </div>
      
      <div className="mb-4">
        <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar archivo CSV
        </label>
        <input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-md"
          disabled={isUploading || isAnalyzing}
        />
      </div>

      {file && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">
            Archivo seleccionado: <strong>{file.name}</strong>
          </p>
          <p className="text-xs text-green-600">
            Tamaño: {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={analyzeFile}
              disabled={isAnalyzing || isUploading}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isAnalyzing ? 'Analizando...' : 'Analizar Archivo'}
            </button>
          </div>
        </div>
      )}

      {showStats && importStats && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Estadísticas del Archivo:</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• Total de líneas: {importStats.totalLines}</p>
            <p>• Líneas válidas: {importStats.validLines}</p>
            <p>• Líneas inválidas: {importStats.invalidLines}</p>
            <p>• Tamaño del archivo: {(importStats.fileSize / 1024 / 1024).toFixed(2)} MB</p>
            {importStats.invalidLines > 0 && (
              <p className="text-orange-600 font-medium">
                ⚠️ {importStats.invalidLines} líneas no pudieron ser procesadas
              </p>
            )}
          </div>
        </div>
      )}

      {isUploading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Importando archivo grande... {uploadProgress}%
            <br />
            <span className="text-xs text-gray-500">
              Esto puede tomar varios minutos para archivos grandes
            </span>
          </p>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button
          onClick={handleUpload}
          disabled={!file || isUploading || isAnalyzing}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            !file || isUploading || isAnalyzing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isUploading ? 'Importando...' : 'Importar CSV'}
        </button>
        <button
          onClick={onClose}
          disabled={isUploading || isAnalyzing}
          className="px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500 border-t pt-4">
        <p><strong>Formato esperado:</strong></p>
        <p>Fecha de Viaje, Hora de salida, Origen, Destino, Ruta, Servicio, Tipo de Servicio, Estado, Bus, Nº Patente, AÑO, es-Total Seats, Puntaje Iniciales, Puntaje adicionales, Puntaje Totales, Compensacion, Total Compensado, RUT, Razon Social, Conductor1, Asientos Sucursal, Recaudacion Sucursal, Asientos Camino, Recaudacion Camino, Ingresos manuales</p>
        <p className="mt-2 text-orange-600">
          <strong>Nota:</strong> Para archivos grandes (&gt;10MB), la importación puede tomar varios minutos.
        </p>
      </div>
    </div>
  );
};

export default CsvImport; 