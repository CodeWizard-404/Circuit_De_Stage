package Circuit_De_Stage.Backend.Entities;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stagiaire")
@PrimaryKeyJoinColumn(name = "user_id")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Stagiaire extends User{
    
    private String emailPerso;
    private long cin;
    private long tel;
    private String institut;
    private String niveau;
    private String annee;
    private String specialite;
    
    private String emailPerso2;
    private String nom2;
    private String prenom2;
    private long cin2;
    private long tel2;
    private String specialite2;
    
    
    
    @OneToMany(mappedBy = "stagiaire",  
    		fetch = FetchType.LAZY,    
    		cascade = CascadeType.ALL, 
    	    orphanRemoval = true)
    private Set<Demande> demandes = new HashSet<>();


    
    
    
    
    
    
    
    
    



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

	public Set<Demande> getDemandes() {
		return demandes;
	}

	public void setDemandes(Set<Demande> demandes) {
		this.demandes = demandes;
	}
    
	public String getEmailPerso2() {
		return emailPerso2;
	}

	public void setEmailPerso2(String emailPerso2) {
		this.emailPerso2 = emailPerso2;
	}

	public String getNom2() {
		return nom2;
	}

	public void setNom2(String nom2) {
		this.nom2 = nom2;
	}

	public String getPrenom2() {
		return prenom2;
	}

	public void setPrenom2(String prenom2) {
		this.prenom2 = prenom2;
	}

	public long getCin2() {
		return cin2;
	}

	public void setCin2(long cin2) {
		this.cin2 = cin2;
	}

	public long getTel2() {
		return tel2;
	}

	public void setTel2(long tel2) {
		this.tel2 = tel2;
	}

	public String getSpecialite2() {
		return specialite2;
	}

	public void setSpecialite2(String specialite2) {
		this.specialite2 = specialite2;
	}

    
    
}
