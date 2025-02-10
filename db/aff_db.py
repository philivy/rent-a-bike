import sqlite3
import sys

def get_db_structure(db_path: str):
    """Affiche la structure des tables d'une base de données SQLite."""
    
    # Connexion à la base de données SQLite
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Récupérer les noms des tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    # Afficher la structure des tables
    db_structure = {}
    for table in tables:
        table_name = table[0]
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = cursor.fetchall()
        db_structure[table_name] = [column[1] for column in columns]
    
    conn.close()
    return db_structure

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python db_structure.py <chemin_vers_base.db>")
        sys.exit(1)
    
    db_path = sys.argv[1]
    
    try:
        structure = get_db_structure(db_path)
        
        # Affichage de la structure
        for table, columns in structure.items():
            print(f"Table: {table}")
            print("Colonnes:", ", ".join(columns))
            print("=" * 40)
    
    except Exception as e:
        print(f"Erreur: {e}")

