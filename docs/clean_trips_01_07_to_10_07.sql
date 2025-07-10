-- Script para borrar viajes desde el 01/07 hasta el 10/07
-- Incluye limpieza de producciones relacionadas para mantener consistencia

-- Paso 1: Verificar cuántos viajes se van a borrar
SELECT 
    COUNT(*) as total_viajes_a_borrar,
    MIN(travel_date) as fecha_minima,
    MAX(travel_date) as fecha_maxima
FROM trips 
WHERE travel_date >= '2024-07-01' AND travel_date <= '2024-07-10';

-- Paso 2: Verificar las producciones que podrían estar afectadas
-- (producciones de las decenas que incluyen estas fechas)
SELECT 
    p.id,
    p.decena,
    p.total,
    p.validado,
    e.company_name
FROM productions p
JOIN entrepreneurs e ON p.entrepreneur_id = e.id
WHERE p.decena IN ('01/07', '02/07', '03/07', '04/07', '05/07', '06/07', '07/07', '08/07', '09/07', '10/07');

-- Paso 3: Borrar las producciones relacionadas primero
-- (para mantener integridad referencial)
DELETE FROM productions 
WHERE decena IN ('01/07', '02/07', '03/07', '04/07', '05/07', '06/07', '07/07', '08/07', '09/07', '10/07');

-- Paso 4: Borrar los viajes del período especificado
DELETE FROM trips 
WHERE travel_date >= '2024-07-01' AND travel_date <= '2024-07-10';

-- Paso 5: Verificar que se borraron correctamente
SELECT 
    COUNT(*) as viajes_restantes_en_periodo
FROM trips 
WHERE travel_date >= '2024-07-01' AND travel_date <= '2024-07-10';

-- Paso 6: Verificar que no quedaron producciones huérfanas
SELECT 
    COUNT(*) as producciones_restantes_en_decenas
FROM productions 
WHERE decena IN ('01/07', '02/07', '03/07', '04/07', '05/07', '06/07', '07/07', '08/07', '09/07', '10/07');

-- Paso 7: Mostrar resumen final
SELECT 
    'Limpieza completada' as estado,
    'Viajes del 01/07 al 10/07 borrados' as accion,
    'Producciones relacionadas también borradas' as nota; 