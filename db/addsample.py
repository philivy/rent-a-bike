from sqlalchemy.orm import Session
from main import Bike, Reservation, SessionLocal

def populate_db():
    db: Session = SessionLocal()
    try:
        # Ajouter 10 vélos
        bikes = [Bike(model=f"Modèle {i}", available=True) for i in range(1, 11)]
        db.add_all(bikes)
        db.commit()
        
        # Faire quelques réservations fictives
        reservations = [
            Reservation(bike_id=1, user="Alice"),
            Reservation(bike_id=3, user="Bob"),
            Reservation(bike_id=5, user="Charlie")
        ]
        
        # Marquer ces vélos comme non disponibles
        for reservation in reservations:
            bike = db.query(Bike).filter(Bike.id == reservation.bike_id).first()
            if bike:
                bike.available = False
                db.add(reservation)
        
        db.commit()
        print("Base de données remplie avec des vélos et des réservations d'essai.")
    except Exception as e:
        db.rollback()
        print(f"Erreur lors de la population de la base : {e}")
    finally:
        db.close()

if __name__ == "__main__":
    populate_db()

