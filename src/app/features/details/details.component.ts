import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of, Subject, combineLatest } from 'rxjs';
import { takeUntil, switchMap, catchError, tap, map, filter } from 'rxjs/operators';
import { ActionButtonsComponent } from '@shared/components/action-buttons/action-buttons.component';
import { CardComponent } from '@shared/components/card/card.component';
import { ImageFallbackDirective } from '@shared/directives/image-fallback.directive';
import { Album, Artist, Band, Genre } from '@core/interfaces';
import { DataService } from '@core/services/data.service';

type ItemType = 'album' | 'artist' | 'band' | 'genre';
type DetailItem = Album | Artist | Band | Genre;

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [
    CommonModule,
    ActionButtonsComponent,
    RouterModule,
    NgOptimizedImage,
    ImageFallbackDirective,
    CardComponent
  ],
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {
  type: ItemType | null = null;
  item: DetailItem | null = null;
  relatedItems: DetailItem[] = [];
  isLoading = true;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  private nameCache = new Map<string, Map<number, string>>();

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {}

  ngOnInit() {
    // Combine route data and params to ensure we have both before loading
    combineLatest([
      this.route.data,
      this.route.params
    ]).pipe(
      takeUntil(this.destroy$),
      tap(([data, params]) => {
        this.type = data['type'] as ItemType;
        const slug = params['slug'];
        if (!this.type || !slug) {
          throw new Error('Missing type or slug');
        }
      }),
      switchMap(([data, params]) =>
        this.loadItem(this.type!, params['slug']).pipe(
          map(item => {
            if (!item) {
              this.error = `Failed to load ${this.type} details`;
              this.isLoading = false;
            }
            return item;
          }),
          filter(item => !!item)
        )
      ),
      catchError((error) => {
        console.error('Error loading details:', error);
        this.error = 'Failed to load details';
        this.isLoading = false;
        return of(null);
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadItem(type: ItemType, slug: string): Observable<DetailItem | null> {
    this.isLoading = true;
    this.error = null;

    // Use the resolveSlugToDetails method to fetch item details
    return this.dataService.resolveSlugToDetails<DetailItem>(type, slug).pipe(
      tap(item => {
        if (item) {
          this.item = item;
          this.isLoading = false;
          
          // Load related items based on type
          switch (type) {
            case 'album':
              this.loadAlbumArtists(item as Album);
              break;
            case 'artist':
              this.loadArtistAlbums(item as Artist);
              break;
            case 'band':
              this.loadBandAlbums(item as Band);
              break;
            case 'genre':
              this.loadGenreBands(item as Genre);
              break;
          }
        } else {
          this.error = `Failed to load ${type} details`;
          this.isLoading = false;
        }
      }),
      map(item => item || null),
      catchError((error) => {
        console.error(`Error loading ${type} details:`, error);
        this.error = `Failed to load ${type} details`;
        this.isLoading = false;
        return of(null);
      })
    );
  }

  private loadAlbumArtists(album: Album): void {
    if (album.artists && album.artists.length > 0) {
      const artistId = album.artists[0];
      this.dataService.getArtist(artistId).pipe(
        switchMap(artist =>
          artist && artist.albums
            ? this.dataService.getByIds('albums', artist.albums)
            : of([])
        ),
        tap(
          albums => this.relatedItems = albums,
          error => {
            console.error('Error loading related albums:', error);
            this.relatedItems = [];
          }
        )
      ).subscribe();
    }
  }

  private loadArtistAlbums(artist: Artist): void {
    if (artist.albums && artist.albums.length > 0) {
      this.dataService.getByIds('albums', artist.albums).pipe(
        tap(
          albums => this.relatedItems = albums,
          error => {
            console.error('Error loading artist albums:', error);
            this.relatedItems = [];
          }
        )
      ).subscribe();
    }
  }

  private loadBandAlbums(band: Band): void {
    if (band.albums && band.albums.length > 0) {
      this.dataService.getByIds('albums', band.albums).pipe(
        tap(
          albums => this.relatedItems = albums,
          error => {
            console.error('Error loading band albums:', error);
            this.relatedItems = [];
          }
        )
      ).subscribe();
    }
  }

  private loadGenreBands(genre: Genre): void {
    if (genre.bands && genre.bands.length > 0) {
      this.dataService.getByIds('bands', genre.bands).pipe(
        tap(
          bands => this.relatedItems = bands,
          error => {
            console.error('Error loading genre bands:', error);
            this.relatedItems = [];
          }
        )
      ).subscribe();
    }
  }

  private fetchName(type: 'artists' | 'bands' | 'genres', id: number): Observable<string> {
    // Check if we already have the name in cache
    const typeCache = this.nameCache.get(type) || new Map<number, string>();
    if (typeCache.has(id)) {
      return of(typeCache.get(id)!);
    }

    // If not in cache, fetch from the server
    return this.dataService.getByIds(type, [id]).pipe(
      map(items => {
        if (items.length > 0) {
          const name = items[0].name;
          typeCache.set(id, name);
          this.nameCache.set(type, typeCache);
          return name;
        }
        return `Unknown ${type.slice(0, -1)}`;
      }),
      catchError(error => {
        console.error(`Error loading ${type}:`, error);
        return of(`Unknown ${type.slice(0, -1)}`);
      })
    );
  }

  getArtistName(id: number): string {
    const cachedName = this.nameCache.get('artists')?.get(id);
    if (cachedName) return cachedName;

    // Trigger async fetch but return placeholder
    this.fetchName('artists', id).subscribe();
    return 'Loading...';
  }

  getMemberName(id: number): string {
    const cachedName = this.nameCache.get('artists')?.get(id);
    if (cachedName) return cachedName;

    // Trigger async fetch but return placeholder
    this.fetchName('artists', id).subscribe();
    return 'Loading...';
  }

  getGenreName(id: number): string {
    const cachedName = this.nameCache.get('genres')?.get(id);
    if (cachedName) return cachedName;

    // Trigger async fetch but return placeholder
    this.fetchName('genres', id).subscribe();
    return 'Loading...';
  }

  getBandName(id: number): string {
    const cachedName = this.nameCache.get('bands')?.get(id);
    if (cachedName) return cachedName;

    // Trigger async fetch but return placeholder
    this.fetchName('bands', id).subscribe();
    return 'Loading...';
  }

  getDefaultImage(): string {
    if (!this.item) return '/assets/images/default-artist.svg';

    switch (this.type) {
      case 'album':
        return '/assets/images/default-album.svg';
      case 'band':
        return '/assets/images/default-band.svg';
      case 'genre':
        return '/assets/images/default-genre.svg';
      case 'artist':
      default:
        return '/assets/images/default-artist.svg';
    }
  }

  getDisplayName(): string {
    if (!this.item) return '';
    return this.getItemName(this.item);
  }

  isAlbum(item: Album | Artist | Band | Genre): item is Album {
    return 'yearRelease' in item && 'artists' in item;
  }

  isArtist(item: Album | Artist | Band | Genre): item is Artist {
    return 'birthDate' in item && 'instruments' in item;
  }

  isBand(item: Album | Artist | Band | Genre): item is Band {
    return 'members' in item && 'formed' in item;
  }

  isGenre(item: Album | Artist | Band | Genre): item is Genre {
    return 'color' in item && 'bands' in item;
  }

  getItemName(item: Album | Artist | Band | Genre): string {
    return item.name;
  }
}
