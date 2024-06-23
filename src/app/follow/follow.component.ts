import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../database.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-follow',
  standalone: true,
  imports: [NgClass],
  templateUrl: './follow.component.html',
  styleUrl: './follow.component.css',
})
export class FollowComponent {
  @Input()
  user!: User;

  @Output()
  emiter: EventEmitter<string> = new EventEmitter();

  followMe(email: string) {
    this.emiter.emit(email);
  }
}
