import { Component, OnInit } from '@angular/core';
import { FollowComponent } from '../follow/follow.component';
import { DatabaseService, User } from '../database.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-profile-followers',
  standalone: true,
  imports: [FollowComponent],
  templateUrl: './profile-followers.component.html',
  styleUrl: './profile-followers.component.css',
})
export class ProfileFollowersComponent {
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
