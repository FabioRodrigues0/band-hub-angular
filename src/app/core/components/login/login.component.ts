import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  isModalOpen = false;
  loginForm = {
    email: '',
    password: ''
  };
  errorMessage = '';

  constructor(public auth: AuthService) {}

  openModal() {
    this.isModalOpen = true;
    this.resetForm();
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.loginForm = {
      email: '',
      password: ''
    };
    this.errorMessage = '';
  }

  login() {
    this.errorMessage = '';
    this.auth.login(this.loginForm.email, this.loginForm.password).subscribe({
      next: () => {
        this.closeModal();
      },
      error: (error) => {
        this.errorMessage = error.message || 'Login failed. Please try again.';
      }
    });
  }
}
