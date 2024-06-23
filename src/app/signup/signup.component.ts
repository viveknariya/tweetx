import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  MaxValidator,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DatabaseService } from '../database.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  signUpFrom!: FormGroup;

  confirmPassword!: FormControl;

  emails: string[] = [];

  constructor(private dbService: DatabaseService, private router: Router) {
    this.signUpFrom = new FormGroup({
      name: new FormControl(),
      email: new FormControl(null, [Validators.email]),
      password: new FormControl(),
    });
    this.confirmPassword = new FormControl();

    this.dbService.listOfEmails().then((data) => {
      this.emails = data;
    });
  }

  signUpBtn() {
    if (this.signUpFrom.invalid) {
      alert('Invalid email');
      return;
    }
    if (this.confirmPassword.value != this.signUpFrom.value.password) {
      alert('Password does not match');
      return;
    }
    this.emails.forEach((email) => {
      if (email == this.signUpFrom.value.email) {
        alert('Email already exists');
        return;
      }
    });
    this.dbService.addUser(this.signUpFrom.value);
    this.router.navigate(['login']);
  }
  goToLogin() {
    this.router.navigate(['login']);
  }
}
