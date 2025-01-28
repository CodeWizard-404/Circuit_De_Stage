package Circuit_De_Stage.Backend.Entities;

import java.sql.Date;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonFormat;

import Circuit_De_Stage.Backend.Entities.Enum.DemandeStatus;
import Circuit_De_Stage.Backend.Entities.Enum.StageType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Demande")
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Demande {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Enumerated(EnumType.STRING)
    private StageType stage;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date debutStage;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date finStage;

    @Enumerated(EnumType.STRING)
    private DemandeStatus status;

    
    
    
    
    
    
    
    
    
    @ManyToOne
    @JoinColumn(name = "stagiaire_id")
    private Stagiaire stagiaire;

    @ManyToOne 
    @JoinColumn(name = "encadrant_id")
    private User encadrant;

    @OneToMany(mappedBy = "demande",
    		fetch = FetchType.LAZY, 
    		cascade = CascadeType.ALL, 
    		orphanRemoval = true)
    private Set<Document> documents = new HashSet<>();

    
    
    
    
    
    
    
    
    
    
    
    
    
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public StageType getStage() {
		return stage;
	}

	public void setStage(StageType stage) {
		this.stage = stage;
	}

	public Date getDebutStage() {
		return debutStage;
	}

	public void setDebutStage(Date debutStage) {
		this.debutStage = debutStage;
	}

	public Date getFinStage() {
		return finStage;
	}

	public void setFinStage(Date finStage) {
		this.finStage = finStage;
	}

	public DemandeStatus getStatus() {
		return status;
	}

	public void setStatus(DemandeStatus status) {
		this.status = status;
	}

	public Stagiaire getStagiaire() {
		return stagiaire;
	}

	public void setStagiaire(Stagiaire stagiaire) {
		this.stagiaire = stagiaire;
	}

	public User getEncadrant() {
		return encadrant;
	}

	public void setEncadrant(User encadrant) {
		this.encadrant = encadrant;
	}

	public Set<Document> getDocuments() {
		return documents;
	}

	public void setDocuments(Set<Document> documents) {
		this.documents = documents;
	}

    
    
    
    
    
    
    
    
    
    
    
    
    
    
/*

	public Set<User> getAllAssociatedUsers() {
	    Set<User> users = new HashSet<>();
	    
	    // Add the encadrant
	    if (this.encadrant != null) {
	        users.add(this.encadrant);
	    }
	    
	    // Add users from documents via InternDocumentUserStatus
	    this.documents.forEach(document -> 
	        document.getInternDocumentUserStatuses().forEach(status -> 
	            users.add(status.getUtilisateur())
	        )
	    );
	    
	    return users;
	}
    
    */
    
    
}
