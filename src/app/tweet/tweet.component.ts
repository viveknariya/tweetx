import { Component, Input, input } from '@angular/core';
import { Post } from '../database.service';
import { DateDiffPipe } from '../date-diff.pipe';

@Component({
  selector: 'app-tweet',
  standalone: true,
  imports: [DateDiffPipe],
  templateUrl: './tweet.component.html',
  styleUrl: './tweet.component.css',
})
export class TweetComponent {
  @Input()
  tweetData!: Post;
}
