import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appImageFallback]',
  standalone: true
})
export class ImageFallbackDirective {
  @Input() appImageFallback: string = '/assets/images/default-avatar.png';
  private hasError = false;

  constructor(private el: ElementRef) {}

  @HostListener('error')
  onError() {
    if (!this.hasError) {
      this.hasError = true;
      const imgElement = this.el.nativeElement as HTMLImageElement;
      imgElement.src = this.appImageFallback;
    }
  }
}
