import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { TweetComponent } from '../tweet/tweet.component';
import { DatabaseService, Post, User } from '../database.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [NgClass, TweetComponent, ReactiveFormsModule],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css',
})
export class FeedComponent implements OnInit {
  FocusedNavItem: string = 'feed';

  items: Post[] = [];

  write!: FormControl<string>;

  email!: string;

  constructor(
    private dbService: DatabaseService,
    private userService: UserService
  ) {
    this.write = new FormControl();
    this.email = <string>this.userService.user.getValue()?.email;
  }
  ngOnInit(): void {
    this.dbService.getFeed(this.email).then((data) => {
      this.items = data.sort((a, b) => <number>b.id - <number>a.id);
    });
  }

  FocusOnMe(val: string) {
    this.FocusedNavItem = val;
  }

  Write() {
    if (this.write.value != '') {
      const payload: Post = {
        userEmail: this.email,
        content: this.write.value,
        timeStemp: new Date(),
        name: <string>this.userService.user.getValue()?.name,
      };
      const user: User = <User>this.userService.user.getValue();
      user.posts += 1;

      this.userService.user.next(user);

      this.items.push(payload);
      this.dbService.addPost(payload);
    }
    this.write.setValue('');
  }
}
