import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { DataService } from '@core/services/data.service';
import { User, Playlist } from '@core/interfaces';
import { DrawerComponent } from '@app/shared/components/drawer/drawer.component';
import { FormFieldComponent } from '@app/shared/components/form-field/form-field.component';

interface PlaylistSection {
  title: string;
  playlists: Playlist[];
  description: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DrawerComponent,
    FormFieldComponent
  ]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isLoading = false;
  error: string | null = null;
  drawerOpen = false;
  imageUploading = false;
  maxImageSize = 5 * 1024 * 1024; // 5MB

  playlistSections: PlaylistSection[] = [
    {
      title: 'Listen Later',
      playlists: [],
      description: 'Tracks you want to listen to later'
    },
    {
      title: 'Liked Songs',
      playlists: [],
      description: 'Your favorite tracks'
    },
    {
      title: 'Recently Played',
      playlists: [],
      description: 'Recently played tracks'
    }
  ];

  profileForm!: FormGroup;

  constructor(
    private dataService: DataService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadUserProfile();
  }

  private initializeForm(): void {
    this.profileForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern('^[a-zA-Z0-9_-]*$')]],
      email: ['', [Validators.required, Validators.email]],
      bio: ['', [Validators.maxLength(500)]],
      favoriteGenres: ['', [Validators.maxLength(200)]]
    });
  }

  private loadUserProfile(): void {
    this.isLoading = true;
    this.error = null;

    this.dataService.getProfile().subscribe({
      next: (user) => {
        this.user = {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          bio: user.bio || '',
          image: user.image,
          followers: user.followers || 0,
          following: user.following || 0,
          playlists: user.playlists || 0,
          favoriteGenres: user.favoriteGenres || []
        };
        this.updateFormWithUserData();
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Failed to load profile. Please try again later.';
        this.isLoading = false;
        console.error('Profile load error:', error);
      }
    });
  }

  private updateFormWithUserData(): void {
    if (this.user) {
      this.profileForm.patchValue({
        name: this.user.name,
        username: this.user.username,
        email: this.user.email,
        bio: this.user.bio || '',
        favoriteGenres: (this.user.favoriteGenres || []).join(', ')
      });
    }
  }

  updateProfileImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (file.size > this.maxImageSize) {
      this.error = 'Image size must be less than 5MB';
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.error = 'Please upload an image file';
      return;
    }

    this.imageUploading = true;
    this.error = null;

    // In a real application, you would use DataService to upload the image
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (this.user && e.target?.result) {
        this.user.image = e.target.result as string;
        this.imageUploading = false;
      }
    };
    reader.onerror = () => {
      this.error = 'Failed to upload image. Please try again.';
      this.imageUploading = false;
    };
    reader.readAsDataURL(file);
  }

  removeProfileImage(): void {
    if (this.user) {
      this.user.image = undefined;
      // In a real application, call DataService to remove the image
    }
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/default-profile.png';
  }

  getInitials(): string {
    if (!this.user?.name) return '';
    return this.user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  openEditDrawer(): void {
    this.drawerOpen = true;
    this.error = null;
  }

  closeEditDrawer(): void {
    this.drawerOpen = false;
    this.error = null;
    if (this.user) {
      this.updateFormWithUserData(); // Reset form to current user data
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.error = null;
      const formData = this.profileForm.value;

      // Convert comma-separated genres string to array and clean it
      formData.favoriteGenres = formData.favoriteGenres
        .split(',')
        .map((genre: string) => genre.trim())
        .filter((genre: string) => genre.length > 0);

      // In a real application, you would use DataService to update the profile
      setTimeout(() => {
        try {
          this.user = {
            ...this.user!,
            ...formData
          };
          this.isLoading = false;
          this.closeEditDrawer();
        } catch (error) {
          this.error = 'Failed to save profile. Please try again.';
          this.isLoading = false;
          console.error('Profile save error:', error);
        }
      }, 1000);
    } else {
      this.error = 'Please fix the errors in the form before submitting.';
    }
  }

  getFormErrorMessage(controlName: string): ValidationErrors | null {
    const control = this.profileForm.get(controlName);
    if (!control || !control.errors) return null;

    const errors: ValidationErrors = {};
    const controlErrors = control.errors;

    if (controlErrors['required']) errors['required'] = true;
    if (controlErrors['email']) errors['email'] = true;
    if (controlErrors['minlength']) errors['minlength'] = controlErrors['minlength'];
    if (controlErrors['maxlength']) errors['maxlength'] = controlErrors['maxlength'];
    if (controlErrors['pattern']) errors['pattern'] = true;

    return Object.keys(errors).length > 0 ? errors : null;
  }

  createPlaylist(sectionTitle: string): void {
    const section = this.playlistSections.find(s => s.title === sectionTitle);
    if (!section) return;

    // In a real application, you would use a service to create the playlist
    const newPlaylist: Playlist = {
      id: Math.floor(Math.random() * 1000), // This would come from the backend
      title: `New Playlist`,
      description: '',
      userId: this.user?.id || 0,
      tracks: [],
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    section.playlists.push(newPlaylist);
  }
}
