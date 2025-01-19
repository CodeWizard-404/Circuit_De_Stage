-- Table for Users (including all types: Encadrant, DCRH, ServiceAdministrative, CentreDeFormation)
CREATE TABLE Utilisateur (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    passe VARCHAR(255) NOT NULL,
    type ENUM('Encadrant', 'DCRH', 'ServiceAdministrative', 'CentreDeFormation') NOT NULL
);

-- Table for Stagiaire-specific details
CREATE TABLE Stagiaire (
    id INT PRIMARY KEY AUTO_INCREMENT,
    emailPerso VARCHAR(150),
    cin BIGINT,
    tel BIGINT,
    institut VARCHAR(200),
    niveau VARCHAR(100),
    annee VARCHAR(50),
    specialite VARCHAR(100),
);

-- Table for Demande
CREATE TABLE Demande (
    id INT PRIMARY KEY AUTO_INCREMENT,
    stage ENUM('Stage Initiation', 'Stage Perfectionnement', 'PFA', 'PFE') NOT NULL,
    debutStage DATE NOT NULL,
    finStage DATE NOT NULL,
    status ENUM('Soumise', 'Validée', 'Rejetée') DEFAULT 'Soumise',
    stagiaire_id INT,
    encadrant_id INT,
    FOREIGN KEY (stagiaire_id) REFERENCES Stagiaire(id) ON DELETE CASCADE,
    FOREIGN KEY (encadrant_id) REFERENCES Utilisateur(id) ON DELETE SET NULL
);

CREATE TABLE Document (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('Document Personnel', 'Bulletin de Mouvement', 'Rapport', 'Convocation', 'Laisser Passer', 'Attestation') NOT NULL,
    fichier VARCHAR(255) NOT NULL,
    status ENUM('Soumis', 'Validé', 'Rejeté') DEFAULT 'Soumis',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stagiaire_id INT,
    demande_id INT,
    FOREIGN KEY (stagiaire_id) REFERENCES Stagiaire(id) ON DELETE CASCADE,
    FOREIGN KEY (demande_id) REFERENCES Demande(id) ON DELETE CASCADE
);

CREATE TABLE Utilisateur_Document (
    utilisateur_id INT NOT NULL,
    document_id INT NOT NULL,
    action ENUM('Consulter', 'Valider', 'Rejeter', 'Téléverser', 'Télécharger') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (utilisateur_id, document_id),
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES Document(id) ON DELETE CASCADE
);

CREATE TABLE Stagiaire_Utilisateur (
    stagiaire_id INT NOT NULL,
    utilisateur_id INT NOT NULL,
    role ENUM('Encadrant', 'DCRH', 'ServiceAdministrative', 'CentreDeFormation') NOT NULL,
    PRIMARY KEY (stagiaire_id, utilisateur_id),
    FOREIGN KEY (stagiaire_id) REFERENCES Stagiaire(id) ON DELETE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id) ON DELETE CASCADE
);

CREATE TABLE Demande_Document_User_Status (
    id INT PRIMARY KEY AUTO_INCREMENT,
    demande_id INT NOT NULL,
    document_id INT NOT NULL,
    utilisateur_id INT NOT NULL,
    seen BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (demande_id) REFERENCES Demande(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES Document(id) ON DELETE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES Utilisateur(id) ON DELETE CASCADE
);
