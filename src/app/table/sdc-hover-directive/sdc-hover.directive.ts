import {Directive, Input, EventEmitter, ElementRef, Renderer, Inject, HostListener} from '@angular/core';

@Directive({
  selector: '[hover]'
})
export class HoverDirective {
  @Input('hoverable') hoverable: { backgroundColor: string } | false;

  constructor(@Inject(ElementRef) private element: ElementRef, private renderer: Renderer) {
  }

  @HostListener('mouseenter') onMouseEnter() {
    if (this.hoverable) {
      this.element.nativeElement.style.backgroundColor = this.hoverable.backgroundColor;
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.element.nativeElement.style.backgroundColor = null;
  }
}
