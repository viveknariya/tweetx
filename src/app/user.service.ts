import { Injectable } from '@angular/core';
import { User } from './database.service';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  user = new BehaviorSubject<User | null>(null);

  data = new BehaviorSubject<any>(null);

  constructor(private router: Router) {
    this.user.subscribe({
      next: (nxt) => {
        if (nxt == null) {
          this.router.navigate(['login']);
        } else {
          this.router.navigate(['dashboard', 'feed']);
        }
      },
    });
  }
}
