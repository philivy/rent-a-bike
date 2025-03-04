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

-- Activer l'extension btree_gist pour supporter les contraintes GIST
CREATE EXTENSION IF NOT EXISTS btree_gist;

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

-- Insertion des valeurs pour les listes system
INSERT INTO system.mylist (list_entete, list_raw) VALUES
    ('Sexe', 'Homme'),
    ('Sexe', 'Femme'),
    ('Sexe', 'Enfant'),
    ('Propulsion', 'Mécanique'),
    ('Propulsion', 'Électrique'),
    ('Statut', 'En Cours'),
    ('Statut', 'Annulation'),
    ('Statut', 'Archivage'),
    ('Paiement', 'Cb'),
    ('Paiement', 'Virement'),
    ('Paiement', 'Espèces'),
    ('Paiement', 'PayPal');

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
    sexe VARCHAR(255),  
    propulsion VARCHAR(255),  
    description VARCHAR(100) NOT NULL,
    etat VARCHAR(100) NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    photo BYTEA,
    qrcode BYTEA
);

-- Trigger pour valider le sexe
CREATE OR REPLACEAm FUNCTION validate_sexe() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sexe NOT IN (SELECT list_raw FROM system.mylist WHERE list_entete = 'Sexe') THEN
        RAISE EXCEPTION 'Valeur invalide pour sexe: %', NEW.sexe;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_sexe
BEFORE INSERT OR UPDATE ON article
FOR EACH ROW EXECUTE FUNCTION validate_sexe();

-- Trigger pour valider la propulsion
CREATE OR REPLACE FUNCTION validate_propulsion() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.propulsion NOT IN (SELECT list_raw FROM system.mylist WHERE list_entete = 'Propulsion') THEN
        RAISE EXCEPTION 'Valeur invalide pour propulsion: %', NEW.propulsion;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_propulsion
BEFORE INSERT OR UPDATE ON article
FOR EACH ROW EXECUTE FUNCTION validate_propulsion();

-- Table des réservations (modifiée)
CREATE TABLE reservation (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES client(id) ON DELETE CASCADE,
    article_id INTEGER REFERENCES article(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,  -- Spécifier explicitement WITH TIME ZONE
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    commentaire TEXT,
    status VARCHAR(100),
    magasin_id INTEGER REFERENCES magasin_location(id) ON DELETE SET NULL,
    CHECK (start_date < end_date),
    EXCLUDE USING GIST (
        article_id WITH =,
        TSTZRANGE(start_date::timestamptz, end_date::timestamptz) WITH &&
    )
);

-- Trigger pour valider le statut
CREATE OR REPLACE FUNCTION validate_status() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status NOT IN (SELECT list_raw FROM system.mylist WHERE list_entete = 'Statut') THEN
        RAISE EXCEPTION 'Valeur invalide pour status: %', NEW.status;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_status
BEFORE INSERT OR UPDATE ON reservation
FOR EACH ROW EXECUTE FUNCTION validate_status();

-- Table des paiements
CREATE TABLE paiement (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER REFERENCES reservation(id) ON DELETE CASCADE,
    montant DECIMAL(10, 2) NOT NULL,
    date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    moyen_paiement VARCHAR(50),
    magasin_id INTEGER REFERENCES magasin_location(id) ON DELETE SET NULL
);

-- Trigger pour valider le moyen de paiement
CREATE OR REPLACE FUNCTION validate_moyen_paiement() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.moyen_paiement NOT IN (SELECT list_raw FROM system.mylist WHERE list_entete = 'Paiement') THEN
        RAISE EXCEPTION 'Valeur invalide pour moyen_paiement: %', NEW.moyen_paiement;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_moyen_paiement
BEFORE INSERT OR UPDATE ON paiement
FOR EACH ROW EXECUTE FUNCTION validate_moyen_paiement();

-- Ajout de la clé étrangère magasin_id dans client
ALTER TABLE client
ADD CONSTRAINT fk_magasin
FOREIGN KEY (magasin_id) REFERENCES magasin_location(id) ON DELETE SET NULL;

COMMIT;
