import { Component } from '@angular/core';
import { TweetComponent } from '../tweet/tweet.component';
import { User, DatabaseService, Post } from '../database.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-profile-post',
  standalone: true,
  imports: [TweetComponent],
  templateUrl: './profile-post.component.html',
  styleUrl: './profile-post.component.css',
})
export class ProfilePostComponent {
  items: Post[] = [];

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
