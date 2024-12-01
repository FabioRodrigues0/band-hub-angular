# Band Hub Angular Project

## Project Overview
A modern web application for managing and discovering music, bands, artists, and playlists.

## Technical Stack
- Angular (Latest)
- TypeScript
- RxJS
- Tailwind CSS

## Project Structure
```
src/
├── app/
│   ├── core/               # Core functionality
│   │   ├── interfaces/     # Shared interfaces
│   │   ├── services/      # Global services
│   │   └── layout/        # Layout components
│   ├── shared/            # Shared features
│   │   └── components/    # Reusable components
│   └── features/          # Main features or pages
│       ├── home/
│       ├── list/
│       ├── details/
│       └── profile/
```

## Requirements

### 1. User Profile
- [ ] User avatar and name must be visible on all pages
- [ ] Users should be able to modify their profile data
- [ ] Users should be able to change or remove their profile picture URL
  - [ ] If no profile picture is set, display a colored background with the user's first name initial

### 2. Music Lists
- [ ] Homepage should display a list of all music items
- [ ] Users should be able to search by title (API supports attribute search)
- [ ] Users should be able to filter music by platform and genre
  - API provides an object listing all platforms and genres
  - API supports attribute-based filtering
- [ ] Users should be able to sort the list:
  - Alphabetically by title
  - By release date
  - API supports attribute-based sorting
- [ ] Selecting an item from the list should display its details

### 3. User Collections
- [ ] Each profile has 4 custom lists where users can add, remove, and move their music:
  - Listen Later
  - Currently Listening
  - Listened
  - Completed
- [ ] Users should be able to access each list and view their contents
- [ ] On the music details page, users should be able to:
  - [ ] See if the item is already in a list
  - [ ] Add the item to a list
  - [ ] Move the item between lists

### 4. Layout Requirements
- [ ] Application must have a dynamic and intuitive layout
  - [ ] Can use styling libraries like Bootstrap, Tailwind, or Angular Material
  - [ ] **NOT ALLOWED** to use templates/themes
- [ ] Develop and implement a visual identity for the application
- [ ] Show feedback messages/notifications for all API actions (success or failure)

## Key Features
- Modern, responsive UI
- Type-safe components and services
- Efficient data caching
- Reactive state management
- Path aliases for clean imports

## Entity Types
- Bands
- Artists
- Albums
- Genres
- Tracks
- Playlists
- Users

## Development Guidelines
1. Use path aliases (@core, @shared) for imports
2. Extend BaseEntity for all entity interfaces
3. Implement type guards for type safety
4. Use reactive patterns with RxJS
5. Follow Angular best practices
6. Write comprehensive tests

## Configuration
- Path aliases in tsconfig.json
- Tailwind configuration
- Environment-specific settings

## Getting Started
1. Clone repository
2. Install dependencies: `npm install`
3. Start development server: `ng serve`
4. Run tests: `ng test`

## Best Practices
- Keep components small and focused
- Use TypeScript features for type safety
- Follow Angular style guide
- Write unit tests for components
- Document complex logic
- Use proper error handling
