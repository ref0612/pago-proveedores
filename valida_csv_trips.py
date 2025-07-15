import sys
import csv
from collections import Counter

if len(sys.argv) < 2:
    print("Uso: python valida_csv_trips.py <archivo.csv>")
    sys.exit(1)

csv_path = sys.argv[1]

# Posibles nombres de columnas para cada campo clave
FIELD_NAMES = {
    'travel_date': ['travel_date', 'fecha', 'Fecha de Viaje'],
    'departure_time': ['departure_time', 'hora', 'Hora de Salida'],
    'origin': ['origin', 'origen', 'Origen'],
    'destination': ['destination', 'destino', 'Destino'],
    'bus_number': ['bus_number', 'bus', 'Bus', 'nro_bus', 'número de bus', 'número']
}

def get_field(row, keys):
    for k in keys:
        if k in row and row[k] is not None:
            return row[k].strip()
    return ''

with open(csv_path, encoding='utf-8') as f:
    reader = csv.DictReader(f)
    keys = []
    invalid_rows = []
    for i, row in enumerate(reader, start=2):  # start=2 para contar desde la primera línea de datos
        travel_date = get_field(row, FIELD_NAMES['travel_date'])
        departure_time = get_field(row, FIELD_NAMES['departure_time'])
        origin = get_field(row, FIELD_NAMES['origin']).lower()
        destination = get_field(row, FIELD_NAMES['destination']).lower()
        bus_number = get_field(row, FIELD_NAMES['bus_number']).lower()
        if not departure_time:
            invalid_rows.append((i, row))
            continue
        k = (travel_date, departure_time, origin, destination, bus_number)
        keys.append(k)
    c = Counter(keys)
    dups = [k for k, v in c.items() if v > 1]
    print(f"Duplicados encontrados: {len(dups)}")
    if dups:
        for k in dups:
            print(f"{k}: {c[k]} veces")
    else:
        print("No se encontraron duplicados según los campos clave.")
    if invalid_rows:
        print(f"\nFilas con hora de salida vacía o inválida: {len(invalid_rows)}")
        for idx, row in invalid_rows:
            print(f"Línea {idx}: {row}") 