import { Component, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ActionButtonsComponent } from '@shared/components/action-buttons/action-buttons.component';
import { CardComponent } from '@shared/components/card/card.component';
import { ImageFallbackDirective } from '@shared/directives/image-fallback.directive';
import { Album, Artist, Band, Genre } from '@core/interfaces';
import { DataService } from '@core/services/data.service';

type ItemType = 'album' | 'artist' | 'band' | 'genre';

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
export class DetailsComponent implements OnInit {
  type: ItemType | null = null;
  item: Album | Artist | Band | Genre | null = null;
  relatedItems: Album[] = [];
  isLoading = true;
  error: string | null = null;

  private artistNames = new Map<number, string>();
  private memberNames = new Map<number, string>();
  private genreNames = new Map<number, string>();
  private bandNames = new Map<number, string>();

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {}

  ngOnInit() {
    // Get type and slug from route data and params
    this.route.data.subscribe(data => {
      this.type = data['type'] as ItemType;
    });

    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadItem(slug);
      }
    });
  }

  private loadItem(slug: string) {
    this.isLoading = true;
    this.error = null;

    switch (this.type) {
      case 'album':
        this.loadAlbumDetails(slug);
        break;
      case 'artist':
        this.loadArtist(slug);
        break;
      case 'band':
        this.loadBandDetails(slug);
        break;
      case 'genre':
        this.loadGenre(slug);
        break;
    }
  }

  private loadAlbumDetails(slug: string): void {
    this.dataService.getAlbumBySlug(slug).subscribe({
      next: (album: Album) => {
        this.item = album;
        this.isLoading = false;
        this.loadAlbumArtists(album);
      },
      error: (error) => {
        console.error('Error loading album:', error);
        this.error = 'Failed to load album details';
        this.isLoading = false;
      }
    });
  }

  private loadAlbumArtists(album: Album): void {
    if (album.artists && album.artists.length > 0) {
      // Load the first artist's albums for related items
      const artistId = album.artists[0];
      this.dataService.getByIds('artists', [artistId]).subscribe(
        (artists: Artist[]) => {
          if (artists.length > 0) {
            const artist = artists[0];
            this.dataService.getByIds('albums', artist.albums || []).subscribe(
              albums => this.relatedItems = albums,
              error => {
                console.error('Error loading related albums:', error);
                this.relatedItems = [];
              }
            );
          }
        },
        error => {
          console.error('Error loading artist:', error);
          this.relatedItems = [];
        }
      );
    }
  }

  private loadArtist(slug: string): void {
    this.dataService.getBySlug('artists', slug).subscribe({
      next: (artist: Artist) => {
        this.item = artist;
        this.isLoading = false;
        // Load artist's albums
        this.dataService.getByIds('albums', artist.albums || []).subscribe(
          albums => this.relatedItems = albums,
          error => {
            console.error('Error loading artist albums:', error);
            this.relatedItems = [];
          }
        );
      },
      error: (error) => {
        console.error('Error loading artist:', error);
        this.error = 'Failed to load artist details';
        this.isLoading = false;
      }
    });
  }

  private loadBandDetails(slug: string): void {
    this.dataService.getBySlug('bands', slug).subscribe({
      next: (band: Band) => {
        this.item = band;
        this.isLoading = false;
        // Load band's albums
        this.dataService.getByIds('albums', band.albums || []).subscribe(
          albums => this.relatedItems = albums,
          error => {
            console.error('Error loading band albums:', error);
            this.relatedItems = [];
          }
        );
      },
      error: (error) => {
        console.error('Error loading band:', error);
        this.error = 'Failed to load band details';
        this.isLoading = false;
      }
    });
  }

  private loadGenre(slug: string): void {
    const id = parseInt(slug, 10);
    if (isNaN(id)) {
      this.error = 'Failed to load genre details';
      return;
    }

    this.isLoading = true;
    this.dataService.getBySlug('genres', id.toString()).subscribe({
      next: (genre: Genre) => {
        this.item = genre;
        this.isLoading = false;

        // Load related bands for this genre
        this.dataService.getByIds('bands', genre.bands || []).subscribe(
          bands => this.relatedItems = bands,
          error => {
            console.error('Error loading genre bands:', error);
            this.relatedItems = [];
          }
        );
      },
      error: (error) => {
        console.error('Error loading genre:', error);
        this.isLoading = false;
        this.error = 'Failed to load genre details';
      }
    });
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

  getArtistName(id: number): string {
    if (!this.artistNames.has(id)) {
      this.dataService.getByIds('artists', [id]).subscribe(
        artists => {
          if (artists.length > 0) {
            this.artistNames.set(id, artists[0].name);
          }
        },
        error => console.error('Error loading artist name:', error)
      );
      return 'Loading...';
    }
    return this.artistNames.get(id) || 'Unknown Artist';
  }

  getMemberName(id: number): string {
    if (!this.memberNames.has(id)) {
      this.dataService.getByIds('artists', [id]).subscribe(
        artists => {
          if (artists.length > 0) {
            this.memberNames.set(id, artists[0].name);
          }
        },
        error => console.error('Error loading member name:', error)
      );
      return 'Loading...';
    }
    return this.memberNames.get(id) || 'Unknown Member';
  }

  getGenreName(id: number): string {
    if (!this.genreNames.has(id)) {
      this.dataService.getByIds('genres', [id]).subscribe(
        genres => {
          if (genres.length > 0) {
            this.genreNames.set(id, genres[0].name);
          }
        },
        error => console.error('Error loading genre name:', error)
      );
      return 'Loading...';
    }
    return this.genreNames.get(id) || 'Unknown Genre';
  }

  getBandName(id: number): string {
    if (!this.bandNames.has(id)) {
      this.dataService.getByIds('bands', [id]).subscribe(
        bands => {
          if (bands.length > 0) {
            this.bandNames.set(id, bands[0].name);
          }
        },
        error => console.error('Error loading band name:', error)
      );
      return 'Loading...';
    }
    return this.bandNames.get(id) || 'Unknown Band';
  }
}
