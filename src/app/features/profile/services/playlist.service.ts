import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Playlist, PlaylistSection } from '../../../core/interfaces';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private readonly apiUrl = 'http://localhost:3000';
  private readonly defaultSections: PlaylistSection[] = [
    {
      title: 'Favorite Playlists',
      description: 'Your most loved playlists',
      playlists: []
    },
    {
      title: 'Your Playlists',
      description: 'Playlists you\'ve created',
      playlists: []
    },
    {
      title: 'Followed Playlists',
      description: 'Playlists you follow',
      playlists: []
    }
  ];

  constructor(private http: HttpClient) {}

  getPlaylistSections(userId: number): Observable<PlaylistSection[]> {
    return this.http.get<{ playlists: Playlist[] }>(`${this.apiUrl}/playlists`).pipe(
      map(data => {
        const sections = [...this.defaultSections];
        const userPlaylists = data.playlists.filter(playlist => playlist.user_id === userId);
        
        // First two playlists are favorites
        sections[0].playlists = userPlaylists.slice(0, 2);
        
        // Next two are user's playlists
        sections[1].playlists = userPlaylists.slice(2, 4);
        
        // Rest are followed playlists
        sections[2].playlists = userPlaylists.slice(4);
        
        return sections;
      })
    );
  }

  createPlaylist(playlist: Partial<Playlist>): Observable<Playlist> {
    return this.http.post<Playlist>(`${this.apiUrl}/playlists`, playlist);
  }

  updatePlaylist(playlist: Playlist): Observable<Playlist> {
    return this.http.put<Playlist>(`${this.apiUrl}/playlists/${playlist.id}`, playlist);
  }

  deletePlaylist(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/playlists/${id}`);
  }
}
