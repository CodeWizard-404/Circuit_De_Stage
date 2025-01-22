package Circuit_De_Stage.Backend.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import Circuit_De_Stage.Backend.Entities.Document;
import Circuit_De_Stage.Backend.Entities.User;
import Circuit_De_Stage.Backend.Entities.Enum.DocumentType;
import Circuit_De_Stage.Backend.Services.DocumentService;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

 @Autowired
 private DocumentService documentService;

 @PostMapping("/upload")
 public ResponseEntity<Document> uploadDocument(
         @RequestParam("file") MultipartFile file,
         @RequestParam("demandeId") int demandeId,
         @RequestParam("type") DocumentType type) throws io.jsonwebtoken.io.IOException, Throwable {
     
     Document document = documentService.uploadDocument(demandeId, file, type);
     return ResponseEntity.status(HttpStatus.CREATED).body(document);
 }

 @GetMapping("/{id}/download")
 public ResponseEntity<byte[]> downloadDocument(@PathVariable int id) {
     byte[] fileContent = documentService.downloadDocument(id);
     return ResponseEntity.ok()
             .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"document.pdf\"")
             .contentType(MediaType.APPLICATION_PDF)
             .body(fileContent);
 }

 @PutMapping("/{id}/validate")
 @PreAuthorize("hasAnyRole('SERVICE_ADMIN', 'DCRH')")
 public ResponseEntity<Void> validateDocument(@PathVariable int id) {
     Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
     User user = (User) authentication.getPrincipal();
     
     documentService.validateDocument(id, user.getId());
     return ResponseEntity.ok().build();
 }

 @PutMapping("/{id}/reject")
 @PreAuthorize("hasAnyRole('SERVICE_ADMIN', 'DCRH')")
 public ResponseEntity<Void> rejectDocument(@PathVariable int id, @RequestBody String reason) {
     Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
     User user = (User) authentication.getPrincipal();
     
     documentService.rejectDocument(id, user.getId(), reason);
     return ResponseEntity.ok().build();
 }
}