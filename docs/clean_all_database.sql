-- Script para limpiar completamente la base de datos
-- BORRA TODOS LOS VIAJES Y PRODUCCIONES
-- ⚠️ ADVERTENCIA: Este script eliminará TODOS los datos de viajes y producciones
-- ⚠️ Ejecutar solo si estás seguro de querer limpiar toda la base de datos

-- Paso 1: Verificar cuántos registros se van a borrar
SELECT 
    'Viajes a borrar' as tipo,
    COUNT(*) as cantidad
FROM trips
UNION ALL
SELECT 
    'Producciones a borrar' as tipo,
    COUNT(*) as cantidad
FROM productions;

-- Paso 2: Verificar las fechas de los viajes existentes
SELECT 
    MIN(travel_date) as fecha_minima,
    MAX(travel_date) as fecha_maxima,
    COUNT(*) as total_viajes
FROM trips;

-- Paso 3: Verificar las decenas de las producciones existentes
SELECT 
    decena,
    COUNT(*) as cantidad_producciones
FROM productions
GROUP BY decena
ORDER BY decena;

-- Paso 4: BORRAR TODAS LAS PRODUCCIONES
-- (Se borran primero para mantener integridad referencial)
DELETE FROM productions;

-- Paso 5: BORRAR TODOS LOS VIAJES
DELETE FROM trips;

-- Paso 6: Verificar que se borraron correctamente
SELECT 
    'Viajes restantes' as tipo,
    COUNT(*) as cantidad
FROM trips
UNION ALL
SELECT 
    'Producciones restantes' as tipo,
    COUNT(*) as cantidad
FROM productions;

-- Paso 7: Mostrar resumen final
SELECT 
    'LIMPIEZA COMPLETADA' as estado,
    'Toda la base de datos ha sido limpiada' as accion,
    'Puedes proceder con la nueva importación' as nota;

-- Paso 8: Verificar que las tablas están vacías
SELECT 
    'trips' as tabla,
    COUNT(*) as registros
FROM trips
UNION ALL
SELECT 
    'productions' as tabla,
    COUNT(*) as registros
FROM productions; 