-- Suppression des tables dans l'ordre inverse des dépendances
DROP TABLE IF EXISTS paiement CASCADE;
DROP TABLE IF EXISTS reservation CASCADE;
DROP TABLE IF EXISTS article CASCADE;
DROP TABLE IF EXISTS tarif CASCADE;
DROP TABLE IF EXISTS client CASCADE;
DROP TABLE IF EXISTS magasin_location CASCADE;
DROP TABLE IF EXISTS adresse_contact CASCADE;
DROP TABLE IF EXISTS system.mylist CASCADE;

-- Création du schéma système
CREATE SCHEMA IF NOT EXISTS system;

BEGIN;

-- Création de la table générique pour les listes
CREATE TABLE system.mylist (
    id SERIAL PRIMARY KEY,
    list_entete VARCHAR(100) NOT NULL,
    list_raw VARCHAR(255) NOT NULL,
    UNIQUE (list_entete, list_raw) -- Garantit l’unicité des couples list_entete/list_raw
);

-- Création de la fonction qui met la première lettre en majuscule
CREATE OR REPLACE FUNCTION system.capitalize_first_letter()
RETURNS TRIGGER AS $$
BEGIN
    NEW.list_entete := INITCAP(NEW.list_entete);
    NEW.list_raw := INITCAP(NEW.list_raw);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Création du trigger pour la capitalisation
CREATE TRIGGER mylist_capitalize_trigger
BEFORE INSERT OR UPDATE ON system.mylist
FOR EACH ROW EXECUTE FUNCTION system.capitalize_first_letter();

-- Ajout des valeurs pour les listes system 
INSERT INTO system.mylist (list_entete, list_raw) VALUES ('Sexe', 'Homme');
INSERT INTO system.mylist (list_entete, list_raw) VALUES ('Sexe', 'Femme');
INSERT INTO system.mylist (list_entete, list_raw) VALUES ('Sexe', 'Enfant');
INSERT INTO system.mylist (list_entete, list_raw) VALUES ('Propulsion', 'Mécanique');
INSERT INTO system.mylist (list_entete, list_raw) VALUES ('Propulsion', 'Électrique');
INSERT INTO "system".mylist (list_entete,list_raw) VALUES
	 ('Statut','En Cours'),
	 ('Statut','Annulation'),
	 ('Statut','Archivage');

-- Table des clients
CREATE TABLE client (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL, 
    prenom VARCHAR(100) NOT NULL,
    entreprise VARCHAR(100),
    email VARCHAR(100) NOT NULL,
    taux_reduction DECIMAL(5, 2) DEFAULT 0.00,
    password TEXT NOT NULL,
    magasin_id INTEGER
);

-- Table des adresses de contact
CREATE TABLE adresse_contact (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES client(id) ON DELETE CASCADE,
    rue VARCHAR(100),
    etage VARCHAR(100),
    residence VARCHAR(100),
    ville VARCHAR(100),
    code_postal VARCHAR(20),
    pays VARCHAR(100),
    telephone VARCHAR(20),
    type_adresse INTEGER CHECK (type_adresse IN (0, 1, 2)) 
);

-- Table des magasins
CREATE TABLE magasin_location (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    rib_iban VARCHAR(100) NOT NULL,
    adresse_contact_id INTEGER REFERENCES adresse_contact(id) ON DELETE SET NULL
);

CREATE TABLE tarif (
    id SERIAL PRIMARY KEY,
    prix_horaire DECIMAL(10, 2) NOT NULL CHECK (prix_horaire >= 0),
    prix_demi_journee DECIMAL(10, 2) NOT NULL CHECK (prix_demi_journee >= 0),
    prix_journee DECIMAL(10, 2) NOT NULL CHECK (prix_journee >= 0),
    devise VARCHAR(10) DEFAULT 'EUR',
    CONSTRAINT unique_prix UNIQUE (prix_horaire, prix_demi_journee, prix_journee)
);

-- Table des articles
CREATE TABLE article (
    id SERIAL PRIMARY KEY,
    tarif_id INTEGER REFERENCES tarif(id) ON DELETE SET NULL,
    magasin_id INTEGER REFERENCES magasin_location(id) ON DELETE SET NULL,
    ref_magasin VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    sexe_id INTEGER REFERENCES system.mylist(id) ON DELETE SET NULL,  -- Correction
    propulsion_id INTEGER REFERENCES system.mylist(id) ON DELETE SET NULL, -- Correction
    description VARCHAR(100) NOT NULL,
    etat VARCHAR(100) NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    photo BYTEA,
    qrcode BYTEA
);

-- Table des réservations
CREATE TABLE reservation (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES client(id) ON DELETE CASCADE,
    article_id INTEGER REFERENCES article(id) ON DELETE CASCADE,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    commentaire TEXT,
    statut_id INTEGER REFERENCES system.mylist(id) ON DELETE SET NULL, -- system.mylist en cours #6 
    magasin_id INTEGER REFERENCES magasin_location(id) ON DELETE SET NULL,
    CHECK (start_date < end_date)
);

-- Table des paiements
CREATE TABLE paiement (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES reservation(id) ON DELETE CASCADE,
    montant DECIMAL(10, 2) NOT NULL,
    date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    moyen_paiement VARCHAR(50) CHECK (moyen_paiement IN ('CB', 'Virement', 'Espèces', 'PayPal')),
    magasin_id INTEGER REFERENCES magasin_location(id) ON DELETE SET NULL
);

-- Ajout de la clé étrangère magasin_id dans client
ALTER TABLE client
ADD CONSTRAINT fk_magasin
FOREIGN KEY (magasin_id) REFERENCES magasin_location(id) ON DELETE SET NULL;

COMMIT;

