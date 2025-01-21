package Circuit_De_Stage.Backend.Entities;


import java.util.HashSet;
import java.util.Set;

import Circuit_De_Stage.Backend.Entities.Enum.RoleType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "User")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    private String nom;
    private String prenom;
    private String email;
    private String passe;
    
    @Enumerated(EnumType.STRING)
    private RoleType type;  
    
    @OneToMany(mappedBy = "encadrant")
    private Set<Demande> demandes = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "user_document",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "document_id")
    )
    private Set<Document> documents = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "Stagiaire_Utilisateur",
        joinColumns = @JoinColumn(name = "utilisateur_id"),
        inverseJoinColumns = @JoinColumn(name = "stagiaire_id")
    )
    private Set<Stagiaire> stagiaires = new HashSet<>();

    @OneToMany(mappedBy = "utilisateur")
    private Set<InternDocumentUserStatus> internDocumentUserStatuses = new HashSet<>();
    
    
    
    

    

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getNom() {
		return nom;
	}

	public void setNom(String nom) {
		this.nom = nom;
	}

	public String getPrenom() {
		return prenom;
	}

	public void setPrenom(String prenom) {
		this.prenom = prenom;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPasse() {
		return passe;
	}

	public void setPasse(String passe) {
		this.passe = passe;
	}

	public RoleType getType() {
		return type;
	}

	public void setType(RoleType type) {
		this.type = type;
	}

	public Set<Demande> getDemandes() {
		return demandes;
	}

	public void setDemandes(Set<Demande> demandes) {
		this.demandes = demandes;
	}

	public Set<Document> getDocuments() {
		return documents;
	}

	public void setDocuments(Set<Document> documents) {
		this.documents = documents;
	}

	public Set<Stagiaire> getStagiaires() {
		return stagiaires;
	}

	public void setStagiaires(Set<Stagiaire> stagiaires) {
		this.stagiaires = stagiaires;
	}

	public Set<InternDocumentUserStatus> getDemandeDocumentUserStatuses() {
		return internDocumentUserStatuses;
	}

	public void setDemandeDocumentUserStatuses(Set<InternDocumentUserStatus> internDocumentUserStatuses) {
		this.internDocumentUserStatuses = internDocumentUserStatuses;
	}
    
    
    
    


}