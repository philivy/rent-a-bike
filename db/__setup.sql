-- Suppression des tables dans l'ordre inverse des dépendances
DROP TABLE IF EXISTS paiement CASCADE;
DROP TABLE IF EXISTS reservation CASCADE;
DROP TABLE IF EXISTS tarif CASCADE;
DROP TABLE IF EXISTS article CASCADE;
DROP TABLE IF EXISTS client CASCADE;
DROP TABLE IF EXISTS magasin_location CASCADE;
DROP TABLE IF EXISTS adresse_contact CASCADE;

-- Table pour les clients
CREATE TABLE client (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL, 
    prenom VARCHAR(100) NOT NULL,
    entreprise VARCHAR(100),
    email VARCHAR(100) NOT NULL,
    taux_reduction DECIMAL(5, 2) DEFAULT 0.00,
    password TEXT NOT NULL,
    magasin_id INTEGER -- Cette colonne sera modifiée plus tard
);

-- Table pour les adresses de contact
CREATE TABLE adresse_contact (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES client(id) ON DELETE CASCADE, -- Un client peut avoir plusieurs adresses
    rue VARCHAR(100),
    etage VARCHAR(100),
    residence VARCHAR(100),
    ville VARCHAR(100),
    code_postal VARCHAR(20),
    pays VARCHAR(100),
    telephone VARCHAR(20),
    type_adresse INTEGER CHECK (type_adresse IN (0, 1, 2)) -- 0: personnel, 1: facture, 2: autre
);

-- Table pour les magasins
CREATE TABLE magasin_location (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    rib_iban VARCHAR(100) NOT NULL,
    adresse_contact_id INTEGER REFERENCES adresse_contact(id) ON DELETE SET NULL
);

-- Table pour les articles
CREATE TABLE article (
    id SERIAL PRIMARY KEY,
    magasin_id INTEGER REFERENCES magasin_location(id) ON DELETE SET NULL,
    ref_magasin VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    type_genre INTEGER CHECK (type_genre IN (0, 1, 2)), -- 0: homme, 1: femme, 2: enfant
    type_categorie INTEGER CHECK (type_categorie IN (0, 1)), -- 0: normal, 1: electrique 
    description VARCHAR(100) NOT NULL,
    etat VARCHAR(100) NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    photo BYTEA DEFAULT NULL, -- Champ pour stocker l'image en format BLOB
    qrcode BYTEA DEFAULT NULL
);

-- Table pour les tarifs (lié 1:1 à article)
CREATE TABLE tarif (
    id SERIAL PRIMARY KEY,
    article_id INTEGER UNIQUE REFERENCES article(id) ON DELETE CASCADE,
    prix_horaire DECIMAL(10, 2) NOT NULL CHECK (prix_horaire >= 0),
    prix_demi_journee DECIMAL(10, 2) NOT NULL CHECK (prix_demi_journee >= 0),
    prix_journee DECIMAL(10, 2) NOT NULL CHECK (prix_journee >= 0),
    devise VARCHAR(10) DEFAULT 'EUR' -- Devise (par défaut EUR)
);

-- Table pour les réservations
CREATE TABLE reservation (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES client(id) ON DELETE CASCADE,
    article_id INTEGER REFERENCES article(id) ON DELETE SET NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    commentaire TEXT,
    etat INTEGER CHECK (etat IN (0, 1, 2)), -- 0: normal, 1: cancel, 2: archivé
    magasin_id INTEGER REFERENCES magasin_location(id) ON DELETE SET NULL,
    CHECK (start_date < end_date) -- Vérifie que la date de début est avant la fin
);

-- Table pour les paiements
CREATE TABLE paiement (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES reservation(id) ON DELETE CASCADE,
    montant DECIMAL(10, 2) NOT NULL,
    date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    moyen_paiement VARCHAR(50) NOT NULL,
    magasin_id INTEGER REFERENCES magasin_location(id) ON DELETE SET NULL
);

-- Ajout de la clé étrangère magasin_id dans client
ALTER TABLE client
ADD CONSTRAINT fk_magasin
FOREIGN KEY (magasin_id) REFERENCES magasin_location(id) ON DELETE SET NULL;


COMMIT;

