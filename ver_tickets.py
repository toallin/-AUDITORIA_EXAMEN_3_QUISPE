import sqlite3
import os

# Ruta hacia la base de datos persistida en el Host
db_path = os.path.join("backend", "db", "tickets.db")

if not os.path.exists(db_path):
    print(f"Error: No se encontró el archivo de base de datos en '{db_path}'.")
    print("Asegúrate de ejecutar este script desde la raíz del proyecto.")
    exit(1)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Comprobar si la tabla 'tickets' existe
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='tickets'")
    if not cursor.fetchone():
        print("La tabla 'tickets' aún no existe en la base de datos.")
        conn.close()
        exit(0)
        
    # Consultar los registros
    cursor.execute("SELECT id, description, status FROM tickets")
    rows = cursor.fetchall()
    
    if not rows:
        print("No hay ningún ticket registrado en la base de datos todavía.")
    else:
        print("\n=== TICKETS REGISTRADOS ===")
        print(f"{'ID':<6} | {'Descripción':<50} | {'Estado':<10}")
        print("-" * 73)
        for row in rows:
            print(f"{row[0]:<6} | {row[1]:<50} | {row[2]:<10}")
        print("===========================\n")
        
    conn.close()
except Exception as e:
    print(f"Ocurrió un error al leer la base de datos: {e}")
