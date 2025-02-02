import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../../interfaces';
import { AuthService } from '../../../services/auth.service';

interface NavigationItem {
  label: string;
  icon: string;
  route?: string;
  subItems?: NavigationItem[];
  routeData?: Record<string, string>;
  isOpen?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  user$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;

  navigationItems: NavigationItem[] = [
    { label: 'Home', icon: 'ri-home-line', route: '/' },
    { 
      label: 'Artists', 
      icon: 'ri-mic-line',
      isOpen: false,
      subItems: [
        { 
          label: 'All Artists', 
          icon: 'ri-user-voice-line', 
          route: '/lists', 
          routeData: { type: 'artist' } 
        },
        { 
          label: 'Top Artists', 
          icon: 'ri-star-line', 
          route: '/lists', 
          routeData: { type: 'artist', filter: 'top' } 
        }
      ]
    },
    {
      label: 'Bands',
      icon: 'ri-group-line',
      isOpen: false,
      subItems: [
        { 
          label: 'All Bands', 
          icon: 'ri-team-line', 
          route: '/lists', 
          routeData: { type: 'band' } 
        },
        { 
          label: 'Trending Bands', 
          icon: 'ri-fire-line', 
          route: '/lists', 
          routeData: { type: 'band', filter: 'trending' } 
        }
      ]
    },
    {
      label: 'Albums',
      icon: 'ri-album-line',
      isOpen: false,
      subItems: [
        { 
          label: 'All Albums', 
          icon: 'ri-music-2-line', 
          route: '/lists', 
          routeData: { type: 'album' } 
        },
        { 
          label: 'Recent Releases', 
          icon: 'ri-calendar-line', 
          route: '/lists', 
          routeData: { type: 'album', filter: 'recent' } 
        }
      ]
    },
    { label: 'Genres', icon: 'ri-music-2-line', route: '/lists', routeData: { type: 'genre' } }
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

  getUserProfileName(user: User | null): string {
    return user?.profile?.name || '';
  }

  getUserProfileUsername(user: User | null): string {
    return user?.profile?.username || '';
  }

  getUserProfileImage(user: User | null): string | null {
    return user?.profile?.image || null;
  }

  getUserProfileInitial(user: User | null): string {
    const name = this.getUserProfileName(user);
    return name ? name.charAt(0).toUpperCase() : '';
  }

  trackByRoute(index: number, item: any): string {
    return item.route;
  }
}
