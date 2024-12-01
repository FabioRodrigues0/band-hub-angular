import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { Album, Artist, Band, User, Genre } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3001';

  // Local storage key for recently played items
  private readonly RECENTLY_PLAYED_KEY = 'recently-played';
  private readonly MAX_RECENTLY_PLAYED = 10;
  private recentlyPlayed: (Album | Artist | Band)[] = [];

  constructor(private http: HttpClient) {
    // Initialize recently played items if we're in browser context
    if (typeof window !== 'undefined') {
      this.recentlyPlayed = JSON.parse(localStorage?.getItem(this.RECENTLY_PLAYED_KEY) || '[]');
    }
  }

  // Artist endpoints
  getArtists(params?: {
    search?: string;
    sortBy?: 'name';
    sortOrder?: 'asc' | 'desc';
  }): Observable<Artist[]> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.sortBy) {
        httpParams = httpParams.set('sortBy', params.sortBy);
        httpParams = httpParams.set('sortOrder', params.sortOrder || 'asc');
      }
    }

    return this.http.get<Artist[]>(`${this.apiUrl}/artists`, { params: httpParams });
  }

  getArtist(id: number): Observable<Artist> {
    return this.http.get<Artist>(`${this.apiUrl}/artists/${id}`);
  }

  getArtistBySlug(slug: string): Observable<Artist> {
    return this.http.get<Artist>(`${this.apiUrl}/artists/${slug}`);
  }

  getArtistAlbums(artistId: number): Observable<Album[]> {
    return this.http.get<Album[]>(`${this.apiUrl}/artists/${artistId}/albums`);
  }

  getRecentlyPlayed(): Observable<(Album | Artist | Band)[]> {
    return of(this.recentlyPlayed);
  }

  addToRecentlyPlayed(item: Album | Artist | Band) {
    if (typeof window === 'undefined') return; // Skip if not in browser context

    // Remove the item if it already exists to avoid duplicates
    this.recentlyPlayed = this.recentlyPlayed.filter(existing => existing.id !== item.id);
    // Add the new item at the beginning
    this.recentlyPlayed.unshift(item);
    // Keep only the most recent items
    this.recentlyPlayed = this.recentlyPlayed.slice(0, this.MAX_RECENTLY_PLAYED);
    // Update localStorage if available
    localStorage?.setItem(this.RECENTLY_PLAYED_KEY, JSON.stringify(this.recentlyPlayed));
  }

  getGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${this.apiUrl}/genres`);
  }

  // Album endpoints
  getAlbums(params?: {
    search?: string;
    sortBy?: 'title' | 'releaseDate';
    sortOrder?: 'asc' | 'desc';
  }): Observable<Album[]> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.sortBy) {
        httpParams = httpParams.set('sortBy', params.sortBy);
        httpParams = httpParams.set('sortOrder', params.sortOrder || 'asc');
      }
    }

    return this.http.get<Album[]>(`${this.apiUrl}/albums`, { params: httpParams });
  }

  getAlbum(id: number): Observable<Album> {
    return this.http.get<Album>(`${this.apiUrl}/albums/${id}`);
  }

  getAlbumBySlug(slug: string): Observable<Album> {
    return this.http.get<Album>(`${this.apiUrl}/albums/${slug}`);
  }

  // Band endpoints
  getBands(params?: {
    search?: string;
    sortBy?: 'name';
    sortOrder?: 'asc' | 'desc';
  }): Observable<Band[]> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.sortBy) {
        httpParams = httpParams.set('sortBy', params.sortBy);
        httpParams = httpParams.set('sortOrder', params.sortOrder || 'asc');
      }
    }

    return this.http.get<Band[]>(`${this.apiUrl}/bands`, { params: httpParams });
  }

  getBand(id: number): Observable<Band> {
    return this.http.get<Band>(`${this.apiUrl}/bands/${id}`);
  }

  getBandBySlug(slug: string): Observable<Band> {
    return this.http.get<Band>(`${this.apiUrl}/bands/${slug}`);
  }

  getBandAlbums(bandId: number): Observable<Album[]> {
    return this.http.get<Album[]>(`${this.apiUrl}/bands/${bandId}/albums`);
  }

  getBySlug(type: string, slug: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${type}/${slug}`);
  }

  getByIds(type: string, ids: (number | string)[]): Observable<any[]> {
    if (!ids.length) return of([]);
    const params = new HttpParams().set('ids', ids.join(','));
    return this.http.get<any[]>(`${this.apiUrl}/${type}`, { params }).pipe(
      map(items => {
        // Map the response to match our interfaces
        return items.map(item => {
          if (type === 'artists') {
            return {
              ...item,
              genres: item.genres || [],
              bands: item.bands || [],
              albums: item.albums || []
            };
          } else if (type === 'bands') {
            return {
              ...item,
              genres: item.genres || [],
              members: item.members || [],
              albums: item.albums || []
            };
          } else if (type === 'albums') {
            return {
              ...item,
              genres: item.genres || [],
              artists: item.artists || [],
              tracks: item.tracks || [],
              band: item.band ? {
                id: item.band.id,
                name: item.band.name,
                image: item.band.image
              } : undefined
            };
          }
          return item;
        });
      })
    );
  }

  // Mock Profile endpoints (no authentication required)
  getProfile(): Observable<User> {
    // Return mock user data that matches our interface
    const mockUser: User = {
      id: 1,
      name: "Admin User",
      email: "admin@example.com",
      password: "hashed_password_here",
      role: "admin",
      profile: {
        id: 1,
        name: "Admin User",
        username: "admin",
        bio: "System administrator and music enthusiast",
        image: "/assets/images/default-artist.svg",
        favoriteGenres: ["Rock", "Jazz", "Classical"],
        followers: 1234,
        following: 567,
        playlists: 23,
        socialLinks: {
          spotify: "spotify.com/admin",
          instagram: "instagram.com/admin",
          twitter: "twitter.com/admin"
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(mockUser);
        observer.complete();
      }, 500);
    });
  }

  updateProfile(data: Partial<User>): Observable<User> {
    // Simulate profile update with correct interface structure
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          id: 1,
          name: data.name || "Admin User",
          email: data.email || "admin@example.com",
          role: data.role || "admin",
          profile: {
            id: 1,
            name: data.name || "Admin User",
            username: data.profile?.username || "admin",
            bio: data.profile?.bio || "System administrator and music enthusiast",
            image: data.profile?.image || "/assets/images/default-artist.svg",
            favoriteGenres: data.profile?.favoriteGenres || ["Rock", "Jazz", "Classical"],
            followers: data.profile?.followers || 1234,
            following: data.profile?.following || 567,
            playlists: data.profile?.playlists || 23,
            socialLinks: data.profile?.socialLinks || {
              spotify: "spotify.com/admin",
              instagram: "instagram.com/admin",
              twitter: "twitter.com/admin"
            }
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as User);
        observer.complete();
      }, 500);
    });
  }

  // Helper function for formatting track duration
  private formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
