package Circuit_De_Stage.Backend.Entities;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import Circuit_De_Stage.Backend.Entities.Enum.DocumentStatus;
import Circuit_De_Stage.Backend.Entities.Enum.DocumentType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Document")
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 30) 
    private DocumentType type;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] fichier;

    @Enumerated(EnumType.STRING)
    private DocumentStatus status = DocumentStatus.SOUMIS;

    private LocalDateTime createdAt;

    
    
    
    
    
    
    
    
    
    @ManyToOne 
    @JoinColumn(name = "demande_id")
    @JsonIgnore
    private Demande demande;
    
    @ManyToOne
    @JoinColumn(name = "centre_formation_id")
    private User centreFormation;
    
    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<UserDocumentSeen> documentStatuses = new HashSet<>();

    
    
    
    
    
    
    
    
    
    
    
    
    
    
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public DocumentType getType() {
		return type;
	}

	public void setType(DocumentType type) {
		this.type = type;
	}

	public byte[] getFichier() {
		return fichier;
	}

	public void setFichier(byte[] fichier) {
		this.fichier = fichier;
	}

	public DocumentStatus getStatus() {
		return status;
	}

	public void setStatus(DocumentStatus status) {
		this.status = status;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public Demande getDemande() {
		return demande;
	}

	public void setDemande(Demande demande) {
		this.demande = demande;
	}
	
	@JsonIgnore
	public Stagiaire getStagiaire() {
        return this.demande.getStagiaire();
	}

	public void setStagiaire(Stagiaire stagiaire) {
		this.demande.setStagiaire(stagiaire);
	}

	public User getCentreFormation() {
		return centreFormation;
	}

	public void setCentreFormation(User centreFormation) {
		this.centreFormation = centreFormation;
	}

	public Set<UserDocumentSeen> getDocumentStatuses() {
		return documentStatuses;
	}

	public void setDocumentStatuses(Set<UserDocumentSeen> documentStatuses) {
		this.documentStatuses = documentStatuses;
	}

    
    
    
    
}
