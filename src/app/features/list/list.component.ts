import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CardComponent } from '@shared/components/card/card.component';
import { DataService } from '@core/services/data.service';
import { Album, Artist, Band, Genre } from '@core/interfaces';
import { Observable } from 'rxjs';

type ItemType = 'album' | 'artist' | 'band' | 'genre';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8 text-zinc-100">{{ getTitle() }}</h1>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <app-card
          *ngFor="let item of items$ | async"
          [item]="item"
          [type]="type || 'album'"
        ></app-card>
      </div>
    </div>
  `,
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  type: ItemType | null = null;
  items$: Observable<(Album | Artist | Band | Genre)[]> | null = null;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.type = data['type'] as ItemType;
      this.loadItems();
    });
  }

  private loadItems() {
    if (!this.type) return;

    switch (this.type) {
      case 'album':
        this.items$ = this.dataService.getAlbums();
        break;
      case 'artist':
        this.items$ = this.dataService.getArtists();
        break;
      case 'band':
        this.items$ = this.dataService.getBands();
        break;
      case 'genre':
        this.items$ = this.dataService.getGenres();
        break;
    }
  }

  getTitle(): string {
    if (!this.type) return '';
    return this.type.charAt(0).toUpperCase() + this.type.slice(1) + 's';
  }
}
