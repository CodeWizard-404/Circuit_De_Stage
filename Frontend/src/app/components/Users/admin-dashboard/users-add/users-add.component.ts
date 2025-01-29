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

  constructor(
    private userService: UserService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  addUser(): void {
    if (!this.validateUser()) {
      this.toastr.error('Please fill in all required fields');
      return;
    }

    if (this.user.passe !== this.confirmPassword) {
      this.toastr.error('Passwords do not match');
      return;
    }

    this.userService.createUser(this.user).subscribe({
      next: () => {
        this.toastr.success('User created successfully');
        this.router.navigate(['/service-administrative-dashboard']);
      },
      error: (error) => {
        this.toastr.error(error.message || 'Failed to create user');
      }
    });
  }

  private validateUser(): boolean {
    return !!(this.user.nom && 
              this.user.prenom &&
              this.user.passe && 
              this.user.email && 
              this.user.type);
  }

  formatRoleName(role: RoleType): string {
    return role.toString()
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
