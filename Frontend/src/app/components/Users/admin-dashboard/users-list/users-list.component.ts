import { Component, OnInit } from '@angular/core';
import { User } from '../../../../classes/user';
import { UserService } from '../../../../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RoleType } from '../../../../classes/enums/role-type';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  users: User[] = [];
  searchTerm: string = '';
  roleFilter: RoleType;

  constructor(
    private userService: UserService, 
    private router: Router, 
    private route: ActivatedRoute
  ) {
    this.roleFilter = RoleType.SERVICE_ADMINISTRATIVE; 
  }

  // Initialize component data when the component loads
  ngOnInit(): void {
    const currentPath = this.router.url; // Get the current URL path
    // Set the role filter based on the current route
    switch (currentPath) {
      case '/users-admin':
        this.roleFilter = RoleType.SERVICE_ADMINISTRATIVE;
        break;
      case '/users-encadrant':
        this.roleFilter = RoleType.ENCADRANT;
        break;
      case '/users-dcrh':
        this.roleFilter = RoleType.DCRH;
        break;
      case '/users-centre-formation':
        this.roleFilter = RoleType.CENTRE_DE_FORMATION;
        break;
    }

    this.loadUsers(); // Load users based on the role filter
  }

  // Load users from the server and filter them by role
  loadUsers(): void {
    this.userService.getAllUsers().subscribe((data: User[]) => {
      this.users = data.filter(user => user.type === this.roleFilter); // Filter users by the selected role
    });
  }

  // Get the filtered list of users based on the search term
  get filteredUsers(): User[] {
    return this.users.filter(user =>
      user.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) // Filter users whose names match the search term
    );
  }

  // Navigate to the "Add User" page
  addUser(): void {
    this.router.navigate(['/users-add']); // Redirect to the "Add User" page
  }

  // Navigate to the "Edit User" page for a specific user
  manageUser(userId: number): void {
    this.router.navigate([`/users-edit/${userId}`]); // Redirect to the "Edit User" page with the user ID
  }
}