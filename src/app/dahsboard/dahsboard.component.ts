import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { UserService } from '../user.service';

@Component({
  selector: 'app-dahsboard',
  standalone: true,
  imports: [NgClass, RouterOutlet],
  templateUrl: './dahsboard.component.html',
  styleUrl: './dahsboard.component.css',
})
export class DahsboardComponent {
  FocusedNavItem!: string;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setFocusBasedOnUrl();
      });

    // Initial setting
    this.setFocusBasedOnUrl();
  }

  setFocusBasedOnUrl() {
    const urlSegments = this.router.url.split('/');

    // Assuming the relevant segment is at index 1
    if (urlSegments.length > 1) {
      switch (urlSegments[2]) {
        case 'feed':
          this.FocusedNavItem = 'feed';
          break;
        case 'user':
          this.FocusedNavItem = 'user';
          break;
        case 'profile':
          this.FocusedNavItem = 'profile';
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
    this.router.navigate(['dashboard', navItem]);
  }

  Logout() {
    this.userService.user.next(null);
    this.router.navigate(['login']);
  }
}
