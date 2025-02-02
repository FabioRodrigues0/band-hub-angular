import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isLoginModalOpen = false;
  loginForm = {
    email: '',
    password: ''
  };

  constructor(public authService: AuthService) {}

  openLoginModal() {
    this.isLoginModalOpen = true;
  }

  closeLoginModal() {
    this.isLoginModalOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.loginForm = {
      email: '',
      password: ''
    };
  }

  login() {
    this.authService.login(this.loginForm.email, this.loginForm.password).subscribe({
      next: () => {
        this.closeLoginModal();
      },
      error: (error) => {
        console.error('Login failed:', error);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
