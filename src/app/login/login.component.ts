import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DatabaseService } from '../database.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm!: FormGroup;

  constructor(private dbService: DatabaseService, private router: Router) {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.email]),
      password: new FormControl(),
    });
  }

  loginBtn(): void {
    if (this.loginForm.invalid) {
      alert('Invalid email or password');
      return;
    }
    this.dbService.login(
      this.loginForm.controls['email'].value,
      this.loginForm.controls['password'].value
    );
  }

  goToSignUp() {
    this.router.navigate(['signup']);
  }
}
