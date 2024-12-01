import { FormControl } from '@angular/forms';

// Base interface for common properties
interface BaseEntity {
  id: number;
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

// User related interfaces
interface UserProfile {
  id: number;
  name: string;
  username: string;
  bio: string;
  image: string;
  favoriteGenres: string[];
  followers: number;
  following: number;
  playlists: number;
  socialLinks: {
    spotify?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: string;
  profile: UserProfile;
  createdAt: string;
  updatedAt: string;
}

// Music related interfaces
export interface Artist extends BaseEntity {
  birthDate: string;
  instruments: string[];
  bands: number[];
  albums: number[];
  genres: string[];
}

export interface Album extends BaseEntity {
  yearRelease: number;
  releaseDate: string;
  artists: number[];
  tracks: number[];
  genres: string[];
  coverImage: string;
  band?: {
    id: number;
    name: string;
    image?: string;
  };
}

export interface Track extends BaseEntity {
  duration: number;
  audioUrl: string;
  artists: number[];
  genres: string[];
  album?: {
    id: number;
    name: string;
    image?: string;
  };
  slug: string;
  description: string;
}

export interface Band extends BaseEntity {
  formed: number;
  members: {
    id: number;
    name: string;
    image?: string;
    genres: string[];
    description: string;
    slug: string;
    instruments: string[];
  }[];
  genres: string[];
  albums: number[];
}

export interface Genre extends BaseEntity {
  color: string;
  bands: number[];
}

export interface Playlist extends BaseEntity {
  user_id: number;
  tracks: number[];
  description?: string;
}

// Response interfaces
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
