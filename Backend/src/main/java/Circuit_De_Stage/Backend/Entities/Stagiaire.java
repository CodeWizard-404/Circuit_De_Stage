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

    
    
    
    @OneToMany(mappedBy = "stagiaire", cascade = CascadeType.ALL)
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
    
    
    
    
}
