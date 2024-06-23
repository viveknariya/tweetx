import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FollowComponent } from '../follow/follow.component';
import { DatabaseService, User } from '../database.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [NgClass, FollowComponent],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
})
export class UserComponent implements OnInit {
  items: User[] = [];

  email!: string;

  constructor(
    private dbService: DatabaseService,
    private userService: UserService
  ) {
    this.email = <string>this.userService.user.getValue()?.email;
  }

  ngOnInit(): void {
    this.dbService
      .getUsersWithFollowerCountAndFollowStatus(this.email)
      .then((users) => {
        this.items = users;
      })
      .catch((error) => {
        console.log(error);
      });
  }
  FocusedNavItem: string = 'feed';

  FocusOnMe(val: string) {
    this.FocusedNavItem = val;
  }

  async followMe(followingEmail: string) {
    try {
      const loggedInUser = this.email;
      if (!loggedInUser) {
        throw new Error('No logged-in user found');
      }

      await this.dbService.addFollower(loggedInUser, followingEmail);
      let user: User = <User>this.userService.user.getValue();
      user.followings += 1;
      this.userService.user.next(user);

      this.items.forEach((user) => {
        if (user.email === followingEmail) {
          user.thisUserFollowedByLoginedUser = true;
          user.followers += 1;
        }
      });
    } catch (error) {
      console.error('Error following user:', error);
      // Additional error handling like user notification can be added here
    }
  }
}
