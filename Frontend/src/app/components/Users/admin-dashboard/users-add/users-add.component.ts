import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../classes/user';
import { RoleType } from '../../../../classes/enums/role-type';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-users-add',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './users-add.component.html',
  styleUrls: ['./users-add.component.css']
})
export class UsersAddComponent {
  user: User = new User(0, '', '', '', '', RoleType.SERVICE_ADMINISTRATIVE);
  roles = Object.values(RoleType);
  confirmPassword: string = '';
  emailExists: boolean = false;


  constructor(
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  // Add a new user to the system
  addUser(): void {
    if (!this.validateUser()) {
      this.toastr.error('Please fill in all required fields'); // Show an error message if validation fails
      return;
    }
    if (this.user.passe.length < 8) {
      this.toastr.error('Password must be at least 8 characters long'); // Show an error message if the password is too short
      return;
    }
    if (this.user.passe !== this.confirmPassword) {
      this.toastr.error('Passwords do not match'); // Show an error message if passwords don't match
      return;
    }

    // Call the service to create the user
    this.userService.createUser(this.user).subscribe({
      next: () => {
        this.toastr.success('User created successfully'); // Show a success message
        this.router.navigate(['/service-administrative-dashboard']); // Navigate to the dashboard
      },
      error: (error) => {
        // Handle errors during user creation
        if (error.status === 403 || error.error?.message?.includes('email exists')) {
          this.emailExists = true; // Mark email as existing
          this.toastr.error(error.message || 'Cette adresse email existe déjà. Veuillez en utiliser une autre.');
        }
        this.toastr.error(error.message || 'Failed to create user'); // Show a generic error message
      }
    });
  }

  // Validate the user object before submission
  private validateUser(): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@Tunisair\.com\.tn$/; // Regex pattern for valid email addresses
    return !!(this.user.nom && 
              this.user.prenom &&
              this.user.passe && 
              this.user.email && 
              this.user.type &&
              emailPattern.test(this.user.email)); // Ensure all fields are filled and email matches the pattern
  }

  // Format role names for display in the UI
  formatRoleName(role: RoleType): string {
    return role.toString()
      .toLowerCase() // Convert the role name to lowercase
      .split('_') // Split the role name by underscores
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(' '); // Join the words with spaces
  }
}