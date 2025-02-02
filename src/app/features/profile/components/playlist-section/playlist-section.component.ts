import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { PlaylistSection, Track } from '../../../../core/interfaces';

@Component({
  selector: 'app-playlist-section',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './playlist-section.component.html',
  styleUrls: ['./playlist-section.component.scss']
})
export class PlaylistSectionComponent {
  @Input() section!: PlaylistSection;

  onDrop(event: CdkDragDrop<Track[]>) {
    if (event.previousContainer === event.container) {
      const tracks = event.container.data;
      const [removed] = tracks.splice(event.previousIndex, 1);
      tracks.splice(event.currentIndex, 0, removed);
    } else {
      const targetData = [...event.container.data];
      const sourceData = [...event.previousContainer.data];
      const [removed] = sourceData.splice(event.previousIndex, 1);
      targetData.splice(event.currentIndex, 0, removed);
      event.previousContainer.data = sourceData;
      event.container.data = targetData;
    }
  }
}
