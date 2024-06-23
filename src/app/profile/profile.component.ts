import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FollowComponent } from '../follow/follow.component';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { DatabaseService, User } from '../database.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgClass, RouterOutlet],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  FocusedNavItem!: string;

  user: User = {
    name: '',
    email: '',
    password: '',
    followers: 0,
    followings: 0,
    thisUserFollowedByLoginedUser: false,
    LoginedUserFollowedBythisUser: false, // login user followers dont check name
    posts: 0,
  };

  email!: string;

  constructor(
    private router: Router,
    private dbService: DatabaseService,
    private userService: UserService
  ) {
    this.email = <string>this.userService.user.getValue()?.email;
  }

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setFocusBasedOnUrl();
      });

    // Initial setting
    this.setFocusBasedOnUrl();

    this.userService.user.subscribe({
      next: (nxt) => {
        this.user = <User>nxt;
      },
    });
    this.dbService
      .getPostByUser(this.email)
      .then((posts) => {
        this.userService.data.next(posts);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  setFocusBasedOnUrl() {
    const urlSegments = this.router.url.split('/');

    // Assuming the relevant segment is at index 1
    if (urlSegments.length > 1) {
      switch (urlSegments[3]) {
        case 'followers':
          this.FocusedNavItem = 'followers';
          break;
        case 'post':
          this.FocusedNavItem = 'post';
          break;
        case 'following':
          this.FocusedNavItem = 'following';
          break;
        default:
          this.FocusedNavItem = '';
      }
    } else {
      this.FocusedNavItem = '';
    }
  }

  FocusOnMe(navItem: string) {
    this.FocusedNavItem = navItem;
    switch (this.FocusedNavItem) {
      case 'followers':
        this.dbService
          .getUsersWithFollowerCountAndFollowStatus(this.email)
          .then((users) => {
            let temp = users.filter(
              (user) => user.LoginedUserFollowedBythisUser
            );
            this.userService.data.next(temp);
          })
          .catch((error) => {
            console.log(error);
          });
        break;
      case 'post':
        this.dbService
          .getPostByUser(this.email)
          .then((posts) => {
            this.userService.data.next(posts);
          })
          .catch((error) => {
            console.log(error);
          });
        break;
      case 'following':
        this.dbService
          .getUsersWithFollowerCountAndFollowStatus(this.email)
          .then((users) => {
            let temp = users.filter(
              (user) => user.thisUserFollowedByLoginedUser
            );
            this.userService.data.next(temp);
          })
          .catch((error) => {
            console.log(error);
          });
        break;
    }
    this.router.navigate(['dashboard', 'profile', navItem]);
  }
}
