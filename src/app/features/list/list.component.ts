import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Observable, Subject, of, throwError } from 'rxjs';
import { takeUntil, catchError, finalize, tap, map } from 'rxjs/operators';

import { DataService } from '@core/services/data.service';
import { Album, Artist, Band, Genre } from '@core/interfaces';

type ListType = 'album' | 'artist' | 'band' | 'genre';
type ListItem = Album | Artist | Band | Genre;

interface ListItemWithColumns {
  [key: string]: any;
  slug: string;
}

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {
  type: ListType = 'album'; // Default to album
  filter: string | null = null;

  items: ListItemWithColumns[] = [];
  displayedColumns: string[] = [];
  filteredItems: ListItemWithColumns[] = [];
  
  isLoading = true;
  error: string | null = null;
  filterText = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;

  // Math reference for template
  Math = Math;

  private destroy$ = new Subject<void>();

  private columnConfigs: Record<ListType, string[]> = {
    album: ['name', 'artist', 'genre', 'releaseYear'],
    artist: ['name', 'genre', 'country', 'popularity'],
    band: ['name', 'genre', 'formedYear', 'members'],
    genre: ['name', 'description', 'popularity']
  };

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit() {
    // Prioritize route data for type resolution
    const typeFromRouteData = this.route.snapshot.data['type'] as ListType;
    const listTypeFromRouteData = this.route.snapshot.data['listType'] as string;

    console.group(' List Component Initialization');
    console.log('Route Data Type:', typeFromRouteData);
    console.log('Route Data List Type:', listTypeFromRouteData);
    console.log('Full Route Snapshot:', this.route.snapshot);
    console.groupEnd();

    // Resolve type with multiple strategies
    if (typeFromRouteData) {
      this.type = typeFromRouteData;
    } else if (listTypeFromRouteData) {
      // Map list types to special handling
      const listTypeMap: Record<string, ListType> = {
        'want-to-listen': 'album',
        'currently-playing': 'album',
        'listened': 'album',
        'favorites': 'album'
      };
      this.type = listTypeMap[listTypeFromRouteData] || 'album';
    } else {
      // Fallback type resolution
      const possibleTypes: ListType[] = ['album', 'artist', 'band', 'genre'];
      const urlSegments = this.router.url.split('/').filter(segment => segment);
      
      const typeFromUrl = urlSegments.find(segment => 
        ['albums', 'artists', 'bands', 'genres'].includes(segment)
      );

      if (typeFromUrl) {
        this.type = {
          'albums': 'album',
          'artists': 'artist', 
          'bands': 'band', 
          'genres': 'genre'
        }[typeFromUrl] as ListType;
      } else {
        this.type = 'album';  // Default type
      }
    }

    // Set filter for special list types
    this.filter = listTypeFromRouteData || null;

    console.group(' List Component Type Resolution');
    console.log('Resolved Type:', this.type);
    console.log('Resolved Filter:', this.filter);
    console.groupEnd();

    // Load items with comprehensive error handling
    this.loadItems()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error(' Initialization error:', error);
          this.error = `Failed to load ${this.type}s`;
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe({
        next: (items) => {
          console.log(` ${this.type}s loaded successfully:`, items);
          this.items = items;
        },
        error: (err) => {
          console.error(' Subscription error:', err);
          this.error = `Unexpected error loading ${this.type}s`;
          this.isLoading = false;
        },
        complete: () => {
          console.log(` ${this.type} loading complete`);
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Load items based on type
  private loadItems(): Observable<ListItemWithColumns[]> {
    // Determine the slug from route parameters
    const slug = this.route.snapshot.params['slug'];

    console.group('🔍 Loading List Items');
    console.log('Type:', this.type);
    console.log('Slug:', slug);
    console.log('Filter:', this.filter);
    console.groupEnd();

    // Use the fetchListItems method with comprehensive options
    return this.dataService.fetchListItems(this.type, {
      slug: slug,  // Pass the slug if available
      filter: this.filter || undefined,  // Convert null to undefined
    }).pipe(
      map(items => {
        // Transform items to ensure they have a slug and preserve original data
        return items.map(item => ({
          ...item,
          // Ensure slug is available, fallback to id or generate a fallback
          slug: item.slug || `${this.type}-${item.id}`,
          // Preserve all original item properties
          originalItem: item
        }));
      }),
      tap(items => {
        console.group('📋 List Items Loaded');
        console.log(`Loaded ${items.length} ${this.type}s`);
        console.log('Items:', items);
        console.groupEnd();
      })
    );
  }

  // Setup list with columns and data
  private setupList(items: ListItemWithColumns[]) {
    console.group('Setup List');
    console.log('Received items:', items);
    
    // Ensure items exist and is an array
    this.items = Array.isArray(items) ? items : [];
    
    // Set display columns based on type
    this.displayedColumns = this.columnConfigs[this.type] || [];
    console.log('Display columns:', this.displayedColumns);

    // Apply initial filter
    this.applyFilter(this.filterText);
    
    console.groupEnd();
  }

  // Enhanced filter method
  applyFilter(filterValue: string) {
    this.filterText = filterValue;
    
    if (!this.items || this.items.length === 0) {
      this.filteredItems = [];
      return;
    }

    // Trim and convert to lowercase
    const cleanFilter = filterValue.trim().toLowerCase();
    
    // Filter items across all columns
    this.filteredItems = this.items.filter(item => 
      this.displayedColumns.some(column => 
        item[column] && 
        item[column].toString().toLowerCase().includes(cleanFilter)
      )
    );

    console.group('Filter Applied');
    console.log('Filter value:', filterValue);
    console.log('Filtered items:', this.filteredItems);
    console.groupEnd();

    // Reset pagination
    this.currentPage = 1;
  }

  // Pagination methods
  getPaginatedItems(): ListItemWithColumns[] {
    const items = this.filteredItems.slice(
      (this.currentPage - 1) * this.itemsPerPage, 
      this.currentPage * this.itemsPerPage
    );
    console.log('Paginated items:', items);
    return items;
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredItems.length / this.itemsPerPage);
  }

  // Navigation methods
  onRowClick(item: ListItemWithColumns) {
    this.router.navigate(['/details', this.type, item.slug]);
  }

  // Pagination navigation
  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
