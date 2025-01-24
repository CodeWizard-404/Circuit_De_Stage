package Circuit_De_Stage.Backend.Entities;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import Circuit_De_Stage.Backend.Entities.Enum.DocumentStatus;
import Circuit_De_Stage.Backend.Entities.Enum.DocumentType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Document")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    
    @Enumerated(EnumType.STRING)
    private DocumentType type;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] fichier;

    @Enumerated(EnumType.STRING)
    private DocumentStatus status = DocumentStatus.SOUMIS;

    private LocalDateTime createdAt;

    
    
    
    
    
    
    
    
    
    @ManyToOne // Each document is associated with one demande
    @JoinColumn(name = "demande_id")
    private Demande demande;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<InternDocumentUserStatus> internDocumentUserStatuses = new HashSet<>();

    
    
    
    
    
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

	public Stagiaire getStagiaire() {
        return this.demande.getStagiaire();
	}

	public void setStagiaire(Stagiaire stagiaire) {
		this.demande.setStagiaire(stagiaire);
	}



	public Set<InternDocumentUserStatus> getInternDocumentUserStatuses() {
		return internDocumentUserStatuses;
	}

	public void setInternDocumentUserStatuses(Set<InternDocumentUserStatus> internDocumentUserStatuses) {
		this.internDocumentUserStatuses = internDocumentUserStatuses;
	}
    
    
    
    
    
}
