import { ButtonOptions } from './../table-component/table.objects';
import {Component, Output, EventEmitter, ViewChild, ElementRef, Input} from '@angular/core';

@Component({
    selector: 'sdc-file-input',
    templateUrl: './file-input.component.html',
    styleUrls: ['./file-input.component.scss']
})

export class SdcFileInputComponent {
    @Input() accept: string;
    @Input() buttonOptions: ButtonOptions;
    @Output() onFileSelect: EventEmitter<File> = new EventEmitter();

    @ViewChild('fileInput') hiddenFileInputElement: ElementRef;

    private files: File;

    private onNativeInputFileSelect(evt: any): void {
      // this.files = evt.srcElement.files;
      // console.log(evt);
      this.onFileSelect.emit(evt);
    }

    private selectFile(): void {
        this.hiddenFileInputElement.nativeElement.click();
    }
}
