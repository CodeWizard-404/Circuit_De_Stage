import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../classes/user';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoleType } from '../../../../classes/enums/role-type';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './users-management.component.html',
  styleUrls: ['./users-management.component.css']
})
export class UsersManagementComponent implements OnInit {
  users: User[] = [];
  searchTerm: string = '';
  user: User | null = null;
  roles = Object.values(RoleType); 
  confirmPassword: string = '';
  
  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // Initialize component data when the component loads
  ngOnInit(): void {
    const userId = this.route.snapshot.params['id']; // Get the user ID from the route parameters
    if (userId) {
      this.userService.getUserById(userId).subscribe((data: User) => {
        this.user = data; // Store the fetched user details
        this.user.passe = ''; // Ensure the password field is empty for security
      });
    }
  }

  // Save the updated user details
  saveUser(): void {
    if (this.user) {
      if (!this.validateUser()) {
        // Handle validation error (e.g., show an error message)
        return;
      }
      if (this.user.passe && this.user.passe !== this.confirmPassword) {
        // Handle password mismatch (e.g., show an error message)
        return;
      }
      // Call the service to update the user details
      this.userService.updateUser(this.user).subscribe(() => {
        this.router.navigate(['/service-administrative-dashboard']); // Redirect to the dashboard after saving
      });
    }
  }

  // Validate the user object before submission
  private validateUser(): boolean {
    if (!this.user) {
      return false; // Return false if no user is available
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@Tunisair\.com\.tn$/; // Regex pattern for valid email addresses
    return !!(this.user.nom && 
              this.user.prenom &&
              this.user.email && 
              this.user.type &&
              emailPattern.test(this.user.email)); // Ensure all fields are filled and email matches the pattern
  }

  // Delete the current user
  deleteUser(userId?: number): void {
    if (this.user) {
      this.userService.deleteUser(this.user.id).subscribe(() => {
        this.router.navigate(['/service-administrative-dashboard']); // Redirect to the dashboard after deletion
      });
    }
  }
}