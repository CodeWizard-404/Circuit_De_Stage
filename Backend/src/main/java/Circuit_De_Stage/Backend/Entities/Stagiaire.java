package Circuit_De_Stage.Backend.Entities;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Stagiaire")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Stagiaire {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String nom;
    private String prenom;
    private String email;
    private String passe;
    
    private String role= "STAGIAIRE";
    
    private String emailPerso;
    private long cin;
    private long tel;
    private String institut;
    private String niveau;
    private String annee;
    private String specialite;

    
    
    
    
    
    
    
    
    
    @ManyToMany(mappedBy = "stagiaires")
    private Set<User> utilisateurs = new HashSet<>();

    @OneToMany(mappedBy = "stagiaire", cascade = CascadeType.ALL)
    private Set<Demande> demandes = new HashSet<>();


    @OneToMany(mappedBy = "stagiaire")
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


	public String getRole() {
		return role;
	}


	public void setRole(String role) {
		this.role = role;
	}


	public String getEmailPerso() {
		return emailPerso;
	}


	public void setEmailPerso(String emailPerso) {
		this.emailPerso = emailPerso;
	}


	public long getCin() {
		return cin;
	}


	public void setCin(long cin) {
		this.cin = cin;
	}


	public long getTel() {
		return tel;
	}


	public void setTel(long tel) {
		this.tel = tel;
	}


	public String getInstitut() {
		return institut;
	}


	public void setInstitut(String institut) {
		this.institut = institut;
	}


	public String getNiveau() {
		return niveau;
	}


	public void setNiveau(String niveau) {
		this.niveau = niveau;
	}


	public String getAnnee() {
		return annee;
	}


	public void setAnnee(String annee) {
		this.annee = annee;
	}


	public String getSpecialite() {
		return specialite;
	}


	public void setSpecialite(String specialite) {
		this.specialite = specialite;
	}


	public Set<User> getUtilisateurs() {
		return utilisateurs;
	}


	public void setUtilisateurs(Set<User> utilisateurs) {
		this.utilisateurs = utilisateurs;
	}


	public Set<Demande> getDemandes() {
		return demandes;
	}


	public void setDemandes(Set<Demande> demandes) {
		this.demandes = demandes;
	}


	public Set<InternDocumentUserStatus> getInternDocumentUserStatuses() {
		return internDocumentUserStatuses;
	}


	public void setInternDocumentUserStatuses(Set<InternDocumentUserStatus> internDocumentUserStatuses) {
		this.internDocumentUserStatuses = internDocumentUserStatuses;
	}
    
    
    

}
