package Circuit_De_Stage.Backend.Entities;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import Circuit_De_Stage.Backend.Entities.Enum.DemandeStatus;
import Circuit_De_Stage.Backend.Entities.Enum.StageType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Demande")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Demande {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Enumerated(EnumType.STRING)
    private StageType stage;

    private LocalDate debutStage;
    private LocalDate finStage;

    @Enumerated(EnumType.STRING)
    private DemandeStatus status;

    @OneToOne // Each demande has one stagiaire
    @JoinColumn(name = "stagiaire_id")
    private Stagiaire stagiaire;

    @ManyToOne // Each demande has one encadrant
    @JoinColumn(name = "encadrant_id")
    private User encadrant;

    @OneToMany(mappedBy = "demande")
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

	public LocalDate getDebutStage() {
		return debutStage;
	}

	public void setDebutStage(LocalDate debutStage) {
		this.debutStage = debutStage;
	}

	public LocalDate getFinStage() {
		return finStage;
	}

	public void setFinStage(LocalDate finStage) {
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

	public Set<User> getAllAssociatedUsers() {
	    Set<User> users = new HashSet<>();
	    
	    // Add the encadrant
	    users.add(this.encadrant);
	    
	    // Add users from documents via InternDocumentUserStatus
	    this.documents.forEach(document -> 
	        document.getInternDocumentUserStatuses().forEach(status -> 
	            users.add(status.getUtilisateur())
	        )
	    );
	    
	    return users;
	}
    
    
    
    
}
