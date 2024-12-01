import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  user$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;

  navigationItems = [
    { label: 'Home', icon: 'ri-home-line', route: '/' },
    { label: 'Want to Listen', icon: 'ri-headphone-line', route: '/lists/want-to-listen' },
    { label: 'Currently Playing', icon: 'ri-play-circle-line', route: '/lists/currently-playing' },
    { label: 'Listened', icon: 'ri-history-line', route: '/lists/listened' },
    { label: 'Favorites', icon: 'ri-heart-line', route: '/lists/favorites' }
  ];

  constructor(private authService: AuthService) {
    this.user$ = this.authService.currentUser$;
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  logout(): void {
    this.authService.logout();
  }

  getUserInitial(user: User | null): string {
    return user?.name?.charAt(0).toUpperCase() ?? '?';
  }

  getUserName(user: User | null): string {
    return user?.name ?? 'User';
  }

  trackByRoute(index: number, item: any): string {
    return item.route;
  }
}
