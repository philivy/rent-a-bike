from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Session

# Base de données SQLite
DATABASE_URL = "sqlite:///./bikes.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modèles SQLAlchemy
class Bike(Base):
    __tablename__ = "bikes"
    id = Column(Integer, primary_key=True, index=True)
    model = Column(String, index=True)
    available = Column(Boolean, default=True)

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    reservations = relationship("Reservation", back_populates="customer")

class Reservation(Base):
    __tablename__ = "reservations"
    id = Column(Integer, primary_key=True, index=True)
    bike_id = Column(Integer, ForeignKey("bikes.id"))
    customer_id = Column(Integer, ForeignKey("customers.id"))
    bike = relationship("Bike")
    customer = relationship("Customer", back_populates="reservations")

# Créer la base de données
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/bikes/", response_model=dict)
def add_bike(model: str, db: Session = Depends(get_db)):
    bike = Bike(model=model, available=True)
    db.add(bike)
    db.commit()
    db.refresh(bike)
    return {"message": "Vélo ajouté", "bike": bike.model}

@app.get("/bikes/")
def list_bikes(db: Session = Depends(get_db)):
    return db.query(Bike).all()

@app.post("/customers/")
def add_customer(name: str, email: str, db: Session = Depends(get_db)):
    customer = Customer(name=name, email=email)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return {"message": "Client ajouté", "customer": customer.name}

@app.get("/customers/")
def list_customers(db: Session = Depends(get_db)):
    return db.query(Customer).all()

@app.post("/rent/")
def rent_bike(bike_id: int, customer_id: int, db: Session = Depends(get_db)):
    bike = db.query(Bike).filter(Bike.id == bike_id, Bike.available == True).first()
    if not bike:
        raise HTTPException(status_code=400, detail="Vélo non disponible")
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=400, detail="Client introuvable")
    bike.available = False
    reservation = Reservation(bike_id=bike.id, customer_id=customer.id)
    db.add(reservation)
    db.commit()
    return {"message": "Vélo réservé", "customer": customer.name}

@app.post("/return/")
def return_bike(bike_id: int, db: Session = Depends(get_db)):
    bike = db.query(Bike).filter(Bike.id == bike_id).first()
    if not bike:
        raise HTTPException(status_code=400, detail="Vélo introuvable")
    bike.available = True
    db.commit()
    return {"message": "Vélo retourné"}

@app.get("/")
def home():
    return {"message": "Bienvenue sur l'API de location de vélos 🚴!"}

