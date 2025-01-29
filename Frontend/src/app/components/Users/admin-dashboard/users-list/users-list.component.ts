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

  ngOnInit(): void {
    const currentPath = this.router.url;
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
    
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe((data: User[]) => {
      this.users = data.filter(user => user.type === this.roleFilter);
    });
  }

  get filteredUsers(): User[] {
    return this.users.filter(user =>
      user.nom.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  addUser(): void {
    this.router.navigate(['/users-add']);
  }

  manageUser(userId: number): void {
    this.router.navigate([`/users-edit/${userId}`]);
  }
}
