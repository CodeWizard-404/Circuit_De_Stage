package Circuit_De_Stage.Backend.Entities;


import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import Circuit_De_Stage.Backend.Entities.Enum.RoleType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Utilisateur")
@Inheritance(strategy = InheritanceType.JOINED)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    
    private String nom;
    private String prenom;
    
    @Column(unique = true)
    private String email;
    private String passe;
    
    @Enumerated(EnumType.STRING)
    private RoleType type;  
    
    
    
    
    
    
    
    
    @OneToMany(mappedBy = "encadrant", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<Demande> demandes = new HashSet<>();

    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<UserDocumentSeen> documentStatuses = new HashSet<>();

    
    
    
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

	public Set<UserDocumentSeen> getDocumentStatuses() {
		return documentStatuses;
	}

	public void setDocumentStatuses(Set<UserDocumentSeen> documentStatuses) {
		this.documentStatuses = documentStatuses;
	}

    
    
    
    
    
    

}