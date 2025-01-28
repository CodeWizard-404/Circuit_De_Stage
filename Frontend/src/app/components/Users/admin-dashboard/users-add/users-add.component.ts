import { Component } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../classes/user';
import { RoleType } from '../../../../classes/enums/role-type';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users-add',
  imports: [FormsModule],
  templateUrl: './users-add.component.html',
  styleUrls: ['./users-add.component.css']
})
export class UsersAddComponent {
  user: User = new User(0, '', '', '', '', RoleType.SERVICE_ADMINISTRATIVE);
  roles = Object.values(RoleType);

  constructor(private userService: UserService) { }

  addUser(): void {
    this.userService.createUser(this.user).subscribe(() => {
      // Navigate back to users list or show success message
    });
  }
}
