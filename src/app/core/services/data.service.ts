import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { 
  Album, 
  Artist, 
  Band, 
  User, 
  Genre 
} from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3001';

  constructor(private http: HttpClient) {}

  // Generic error handler for HTTP requests
  private handleError<T>(operation = 'operation', defaultValue?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // Log detailed error information
      if (error.error instanceof ErrorEvent) {
        console.error('Client-side error:', error.error.message);
      } else {
        console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${error.error}`
        );
      }

      // Return default value or throw error
      return defaultValue !== undefined 
        ? of(defaultValue) 
        : throwError(() => new Error(`${operation} failed`));
    };
  }

  // Music List Queries with simplified parameters
  fetchItems(
    type: string, 
    options: {
      search?: string;
      filter?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      page?: number;
      pageSize?: number;
    } = {}
  ): Observable<any[]> {
    let params = new HttpParams();

    // Add search parameter
    if (options.search) {
      params = params.set('search', options.search);
    }

    // Add filter parameter
    if (options.filter) {
      params = params.set('filter', options.filter);
    }

    // Add sorting parameters
    if (options.sortBy) {
      params = params.set('sortBy', options.sortBy);
      params = params.set('sortOrder', options.sortOrder || 'asc');
    }

    // Add pagination parameters
    if (options.page !== undefined) {
      params = params.set('page', options.page.toString());
    }
    if (options.pageSize !== undefined) {
      params = params.set('pageSize', options.pageSize.toString());
    }

    // Fetch list items
    return this.http.get<any[]>(`${this.apiUrl}/${type}`, { params }).pipe(
      catchError(this.handleError<any[]>(`fetch ${type}`, []))
    );
  }

  // Specific fetch methods
  getArtistById(id: number): Observable<Artist> {
    return this.http.get<Artist>(`${this.apiUrl}/artists/${id}`).pipe(
      map(artist => {
        const { birthDate, instruments, ...rest } = artist;
        return rest;
      }),
      catchError(this.handleError<Artist>('getArtistById', {
        id: 0,
        name: 'Unknown Artist',
        genres: [],
        bands: [],
        albums: []
      }))
    );
  }

  getArtist(artistId: number): Observable<Artist> {
    return this.getArtistById(artistId);
  }

  getAlbumById(id: number): Observable<Album> {
    return this.http.get<Album>(`${this.apiUrl}/albums/${id}`).pipe(
      catchError(this.handleError<Album>('getAlbumById', {
        id: 0,
        title: 'Unknown Album',
        genres: [],
        artists: [],
        tracks: []
      }))
    );
  }

  getBandById(id: number): Observable<Band> {
    return this.http.get<Band>(`${this.apiUrl}/bands/${id}`).pipe(
      catchError(this.handleError<Band>('getBandById', {
        id: 0,
        name: 'Unknown Band',
        genres: [],
        members: [],
        albums: []
      }))
    );
  }

  // Slug resolution
  getBySlug(type: string, slug: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${type}/slug/${slug}`).pipe(
      catchError(this.handleError(`get${type}BySlug`))
    );
  }

  // Genres
  getGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${this.apiUrl}/genres`).pipe(
      catchError(this.handleError<Genre[]>('getGenres', []))
    );
  }
}
