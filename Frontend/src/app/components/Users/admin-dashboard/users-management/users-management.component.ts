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

  ngOnInit(): void {
    const userId = this.route.snapshot.params['id'];
    if (userId) {
      this.userService.getUserById(userId).subscribe((data: User) => {
        this.user = data;
      });
    }
  }


  saveUser(): void {
    if (this.user) {
      if (this.user.passe !== this.confirmPassword) {
        // Handle password mismatch
        return;
      }
      this.userService.updateUser(this.user).subscribe(() => {
        this.router.navigate(['/service-administrative-dashboard']);
      });
    }
  }

  deleteUser(userId?: number): void {
    if (this.user) {
      this.userService.deleteUser(this.user.id).subscribe(() => {
        this.router.navigate(['/service-administrative-dashboard']);
      });
    }
  }
}

