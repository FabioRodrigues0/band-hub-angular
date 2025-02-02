import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Album, Artist, Band, Genre } from '@core/interfaces';
import { DataService } from '@core/services/data.service';

@Component({
  selector: 'app-action-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './action-buttons.component.html',
  styleUrls: ['./action-buttons.component.scss']
})
export class ActionButtonsComponent {
  @Input() item!: Album | Artist | Band | Genre;
  @Input() type: 'album' | 'artist' | 'band' | 'genre' = 'album';

  constructor(private dataService: DataService) {}

  onPlayClick(): void {
    // Implement play functionality
    console.log('Play clicked:', this.item);
  }

  onAddToPlaylistClick(): void {
    // Implement add to playlist functionality
    console.log('Add to playlist clicked:', this.item);
  }

  onShareClick(): void {
    // Implement share functionality
    console.log('Share clicked:', this.item);
  }

  onFollowClick(): void {
    // Implement follow functionality
    console.log('Follow clicked:', this.item);
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
}
