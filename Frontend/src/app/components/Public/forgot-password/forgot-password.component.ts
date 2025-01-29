import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  // Import required Angular Material and other modules
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    NgIf
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  // Form group for the forgot password form
  forgotForm: FormGroup;
  // Messages to show operation status
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    // Initialize form with email validation
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // Handle form submission
  onSubmit() {
    if (this.forgotForm.valid) {
      // Call auth service to process password reset
      this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
        next: () => {
          // Show success message when email is sent
          this.successMessage = 'Un Nouveau mot de passe a été envoyées à votre email';
          this.errorMessage = '';
        },
        error: (err) => {
          // Show error message if something goes wrong
          this.errorMessage = "Erreur lors de l'envoi des instructions";
          this.successMessage = '';
        }
      });
    }
  }
}