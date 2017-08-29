import {Directive, Input, EventEmitter, ElementRef, Renderer2, Inject, HostListener} from '@angular/core';

@Directive({
  selector: '[hover]'
})
export class HoverDirective {
  @Input('hoverable') hoverable: { backgroundColor: string } | boolean;

  constructor(@Inject(ElementRef) private element: ElementRef, private renderer: Renderer2) {
  }

  @HostListener('mouseenter') onMouseEnter() {
    if (this.hoverable) {
      if (this.hoverable['backgroundColor']) {
        this.element.nativeElement.style.backgroundColor = this.hoverable['backgroundColor'];
      }else {
        this.renderer.addClass(this.element.nativeElement, 'default-hover-background-color');
      }
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (this.hoverable) {
      if (this.hoverable['backgroundColor']) {
        this.element.nativeElement.style.backgroundColor = null;
      }else {
        this.renderer.removeClass(this.element.nativeElement, 'default-hover-background-color');
      }
    }
  }
}
