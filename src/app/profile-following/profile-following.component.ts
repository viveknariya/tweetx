import { Component } from '@angular/core';
import { FollowComponent } from '../follow/follow.component';
import { User, DatabaseService } from '../database.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-profile-following',
  standalone: true,
  imports: [FollowComponent],
  templateUrl: './profile-following.component.html',
  styleUrl: './profile-following.component.css',
})
export class ProfileFollowingComponent {
  items: User[] = [];

  constructor(
    private dbService: DatabaseService,
    private userService: UserService
  ) {
    this.userService.data.subscribe({
      next: (nxt) => {
        this.items = nxt;
      },
    });
  }
}
