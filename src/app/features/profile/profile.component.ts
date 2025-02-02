import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

import { User, Playlist } from '@core/interfaces';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    DragDropModule
  ]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isEditing = false;
  isLoading = false;
  error: string | null = null;
  form: FormGroup;

  playlistSections = [
    {
      id: 'want-to-listen',
      title: 'Want to Listen',
      description: 'Tracks you want to explore',
      playlists: [] as Playlist[]
    },
    {
      id: 'currently-listening',
      title: 'Currently Listening',
      description: 'Tracks you are currently enjoying',
      playlists: [] as Playlist[]
    },
    {
      id: 'already-listened',
      title: 'Already Listened',
      description: 'Tracks you have completed',
      playlists: [] as Playlist[]
    }
  ];

  constructor(
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      bio: [''],
      favoriteGenres: [''],
      tracks: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.error = null;
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.user = user;
        if (user) {
          this.form.patchValue({
            name: user.profile.name || '',
            email: user.email || '',
            username: user.profile.username || '',
            bio: user.profile.bio || '',
            favoriteGenres: user.profile.favoriteGenres?.join(', ') || '',
            tracks: user.profile.playlists,
          });
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load profile';
        this.isLoading = false;
        console.error('Error loading profile:', err);
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.user) {
      // Reset form when closing
      this.form.patchValue({
        name: this.user.profile.name || '',
        email: this.user.email || '',
        username: this.user.profile.username || '',
        bio: this.user.profile.bio || '',
        favoriteGenres: this.user.profile.favoriteGenres?.join(', ') || ''
      });
    }
  }

  onSubmit(): void {
    if (this.form.valid && this.user) {
      this.isLoading = true;
      this.error = null;

      const updatedUser: Partial<User> = {
        ...this.user,
        email: this.form.value.email,
        profile: {
          ...this.user.profile,
          name: this.form.value.name,
          username: this.form.value.username,
          bio: this.form.value.bio,
          favoriteGenres: this.form.value.favoriteGenres.split(',').map((g: string) => g.trim()).filter(Boolean)
        }
      };

      this.authService.updateUser(updatedUser).subscribe({
        next: () => {
          this.isLoading = false;
          this.toggleEdit();
        },
        error: (err) => {
          this.error = 'Failed to update profile';
          this.isLoading = false;
          console.error('Error updating profile:', err);
        }
      });
    }
  }

  getProfileName(): string {
    return this.user?.profile?.name || '';
  }

  getProfileUsername(): string {
    return this.user?.profile?.username || '';
  }

  getProfileBio(): string {
    return this.user?.profile?.bio || '';
  }

  getFollowers(): number {
    return this.user?.profile?.followers || 0;
  }

  getFollowing(): number {
    return this.user?.profile?.following || 0;
  }

  getPlaylists(): number {
    return this.user?.profile?.playlists || 0;
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(word => word[0].toUpperCase()).join('');
  }

  drop(event: any) {
    if (event.previousContainer === event.container) {
      // Reorder within the same section
      moveItemInArray(
        event.container.data, 
        event.previousIndex, 
        event.currentIndex
      );
    } else {
      // Move between sections
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  createPlaylist(sectionId: string) {
    const section = this.playlistSections.find(s => s.id === sectionId);
    if (section) {
      const newPlaylist: Playlist = {
        id: Date.now(), // Temporary unique ID
        user_id: this.user?.id || 0,
        tracks: [],
        name: `New Playlist in ${section.title}`,
        description: 'A new playlist to explore',
        slug: `new-playlist-${Date.now()}`,
        image: 'assets/images/default-playlist.png'
      };
      section.playlists.push(newPlaylist);
    }
  }

  movePlaylist(playlist: any, fromSectionId: string, toSectionId: string) {
    // Find the source and destination sections
    const fromSection = this.playlistSections.find(section => section.id === fromSectionId);
    const toSection = this.playlistSections.find(section => section.id === toSectionId);

    if (fromSection && toSection) {
      // Remove playlist from source section
      const playlistIndex = fromSection.playlists.findIndex(p => p.id === playlist.id);
      if (playlistIndex !== -1) {
        fromSection.playlists.splice(playlistIndex, 1);
        
        // Add playlist to destination section
        toSection.playlists.push(playlist);
      }
    }
  }
}
