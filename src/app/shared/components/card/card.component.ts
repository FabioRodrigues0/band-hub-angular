import { Component, Input, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Album, Artist, Band, Genre } from '@core/interfaces';
import { DataService } from '@core/services/data.service';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input() item!: Album | Artist | Band | Genre;
  @Input() type: 'album' | 'artist' | 'band' | 'genre' = 'album';

  private fallbackImage = 'assets/images/placeholder.jpg';
  private imageCache = new Map<string, string>();
  private artistNameCache = new Map<number, string>();

  constructor(
    private dataService: DataService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  onCardClick(): void {
    if (!this.item) return;

    // Add to recently played if it's not an album or genre
    if (!this.isAlbum(this.item) && !this.isGenre(this.item)) {
      this.dataService.addToRecentlyPlayed(this.item);
    }

    // Navigate to the details page
    if (this.isGenre(this.item)) {
      this.router.navigate(['/', 'genres', this.item.id]);
    } else if ('slug' in this.item) {
      this.router.navigate(['/', this.type + 's', this.item.slug]);
    }
  }

  getName(): string {
    if (!this.item) return '';
    return this.item.name;
  }

  getArtistName(artistId: number): string {
    const cachedName = this.artistNameCache.get(artistId);
    if (cachedName) return cachedName;

    this.dataService.getArtist(artistId).subscribe(artist => {
      if (artist) {
        this.artistNameCache.set(artistId, artist.name);
      }
    });

    return 'Loading...';
  }

  getImage(): string {
    if (!this.item) return this.getDefaultImage();
    return this.item.image || this.getDefaultImage();
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = this.getDefaultImage();
      const cacheKey = this.isGenre(this.item) ? this.item.id.toString() : this.item.slug;
      this.imageCache.set(cacheKey, this.getDefaultImage());
    }
  }

  isAlbum(item: Album | Artist | Band | Genre): item is Album {
    return 'yearRelease' in item && 'artists' in item;
  }

  isBand(item: Album | Artist | Band | Genre): item is Band {
    return 'members' in item && 'formed' in item;
  }

  isArtist(item: Album | Artist | Band | Genre): item is Artist {
    return 'birthDate' in item && 'instruments' in item;
  }

  isGenre(item: Album | Artist | Band | Genre): item is Genre {
    return 'color' in item && 'bands' in item;
  }

  getDefaultImage(): string {
    if (!this.item) return '/assets/images/default-artist.svg';

    if (this.isAlbum(this.item)) {
      return '/assets/images/default-album.svg';
    } else if (this.isBand(this.item)) {
      return '/assets/images/default-band.svg';
    } else if (this.isGenre(this.item)) {
      return '/assets/images/default-genre.svg';
    }
    return '/assets/images/default-artist.svg';
  }

  private preloadImage(): void {
    if (!isPlatformBrowser(this.platformId) || !this.item?.image) {
      return;
    }

    const img = document.createElement('img');
    img.src = this.item.image;
    img.onload = () => {
      const cacheKey = this.isGenre(this.item) ? this.item.id.toString() : this.item.slug;
      this.imageCache.set(cacheKey, this.item.image!);
    };
    img.onerror = () => {
      const cacheKey = this.isGenre(this.item) ? this.item.id.toString() : this.item.slug;
      this.imageCache.set(cacheKey, this.fallbackImage);
    };
  }
}
