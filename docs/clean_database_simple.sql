-- LIMPIEZA COMPLETA DE BASE DE DATOS
-- ⚠️ ADVERTENCIA: Este script eliminará TODOS los datos de viajes y producciones

-- Verificar datos existentes antes de borrar
SELECT 'ANTES DE LIMPIAR:' as estado;
SELECT COUNT(*) as total_viajes FROM trips;
SELECT COUNT(*) as total_producciones FROM productions;

-- BORRAR TODAS LAS PRODUCCIONES
DELETE FROM productions;

-- BORRAR TODOS LOS VIAJES  
DELETE FROM trips;

-- Verificar que se borraron correctamente
SELECT 'DESPUÉS DE LIMPIAR:' as estado;
SELECT COUNT(*) as viajes_restantes FROM trips;
SELECT COUNT(*) as producciones_restantes FROM productions;

-- Confirmación final
SELECT 'LIMPIEZA COMPLETADA - Base de datos lista para nueva importación' as resultado; 