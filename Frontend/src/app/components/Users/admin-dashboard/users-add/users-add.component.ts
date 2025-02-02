import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../classes/user';
import { RoleType } from '../../../../classes/enums/role-type';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Validators } from '@angular/forms';

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

  addUser(): void {
    if (!this.validateUser()) {
      this.toastr.error('Please fill in all required fields');
      return;
    }

    if (this.user.passe.length < 8) {
      this.toastr.error('Password must be at least 8 characters long');
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
        if (error.status === 403 || error.error?.message?.includes('email exists')) {
          this.emailExists = true;
          this.toastr.error(error.message || 'Cette adresse email existe déjà. Veuillez en utiliser une autre.');
        }
        this.toastr.error(error.message || 'Failed to create user');
      }
    });
  }

  private validateUser(): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@Tunisair\.com\.tn$/;
    return !!(this.user.nom && 
              this.user.prenom &&
              this.user.passe && 
              this.user.email && 
              this.user.type &&
              emailPattern.test(this.user.email));
  }

  formatRoleName(role: RoleType): string {
    return role.toString()
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
