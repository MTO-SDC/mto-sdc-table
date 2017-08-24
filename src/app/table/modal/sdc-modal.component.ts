import { ModalOptions } from './../table-component/table.objects';
// tslint:disable-next-line:max-line-length
import { Component, ViewChild, ViewContainerRef, Input, Output, EventEmitter, ElementRef, AfterContentInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'sdc-modal',
  templateUrl: './sdc-modal.component.html',
  styleUrls: ['./sdc-modal.component.css']
})

export class SdcModalComponent implements AfterContentInit {
  @ViewChild('container', { read: ViewContainerRef }) private container: ViewContainerRef;
  @Input() private componentFactory: any;
  @Input() private modalSettings: ModalOptions = {
    styles: {
      background: {
        rgbaColor: 'rgba(106, 108, 112, 0.7)'
      },
      dialog: {
        rgbaColor: 'rgba(255, 255, 255, 1)',
        width: '85%',
        boxShadow: '4px 4px 80px #000',
        top: '50%',
        left: '50%',
      }
    }
  };
  @Input() private objectToPassToComponent: any;
  @Input() private hideModal: boolean;
  @Output() private change: EventEmitter<any> =  new EventEmitter<any>();

  constructor( private element: ElementRef ) {}

  public ngAfterContentInit(): void {
    if (this.componentFactory !== undefined && this.componentFactory !== null) {
      let messageComponent = this.container.createComponent(this.componentFactory);
      if (this.objectToPassToComponent) {
        messageComponent.instance['data'] = this.objectToPassToComponent;
      }
      messageComponent.instance['change'].subscribe(change => {
        this.change.emit({data: change});
      });
      messageComponent.instance['close'].subscribe(() => {
        this.closeModal();
      });
    } else {
      // tslint:disable-next-line:max-line-length
      console.log('Error loading component. Please make sure you are appropriately passing the component factory and not the component itself.');
    }
  }

  private closeModal(): void {
    this.hideModal = true;
    this.container.clear()  ;
  }

}
