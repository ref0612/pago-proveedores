import unicodedata

def normalize_str(s):
    if not isinstance(s, str):
        return ''
    # Corrige errores típicos de encoding antes de normalizar
    replacements = {
        '¤': 'ñ',  # Vi¤a -> Viña
        'Ã±': 'ñ', # ViÃ±a -> Viña
        '├▒': 'ñ', # Vi├▒a -> Viña
        'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
        'Ã': 'Á', 'Ã‰': 'É', 'Ã': 'Í', 'Ã“': 'Ó', 'Ãš': 'Ú',
        'Ã¼': 'ü', 'Ãœ': 'Ü',
        'â': "'", 'â': '-', 'â': '"', 'â': '"',
        'â¦': '...', 'â¢': '-', 'â”': '-',
    }
    for bad, good in replacements.items():
        s = s.replace(bad, good)
    # Normaliza a NFC, elimina tildes, pasa a minúsculas y quita espacios
    s = unicodedata.normalize('NFKC', s)
    s = ''.join(c for c in unicodedata.normalize('NFD', s)
                if unicodedata.category(c) != 'Mn')
    s = s.strip().lower()
    # Segunda pasada para errores de encoding que sobreviven la normalización
    post_replacements = {
        'viã±a': 'viña',
        'ã±': 'ñ',
        'ã¡': 'á', 'ã©': 'é', 'ã­': 'í', 'ã³': 'ó', 'ãº': 'ú',
        'ã¼': 'ü',
    }
    for bad, good in post_replacements.items():
        s = s.replace(bad, good)
    # Finalmente, elimina cualquier tilde y reemplaza ñ por n para forzar ASCII plano
    s = s.replace('ñ', 'n')
    s = s.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
    s = s.replace('ü', 'u')
    return s
