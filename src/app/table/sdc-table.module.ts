import { SdcModalComponent } from './modal/sdc-modal.component';
import { CdkTableModule } from '@angular/cdk/table';
import { SdcTableComponent } from './table-component/sdc-table.component';
import { CommonModule } from '@angular/common';
import {
    MdButtonModule,
    MdCheckboxModule,
    MdTableModule,
    MdIconModule,
    MdPaginatorModule,
    MdSortModule,
    MdInputModule,
    MdDialogModule,
    MdSelectModule
} from '@angular/material';
import { NgModule } from '@angular/core';
import { FocusDirective } from './focus-directive/sdc-focus.directive';
import { PipeJoin } from './pipe-join/sdc-pipe-join.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    entryComponents: [SdcModalComponent],
    declarations: [
        SdcTableComponent,
        SdcModalComponent,
        FocusDirective,
        PipeJoin
    ],
    imports: [
        CommonModule,
        BrowserAnimationsModule,
        CdkTableModule,
        MdTableModule,
        MdButtonModule,
        MdCheckboxModule,
        MdPaginatorModule,
        MdSortModule,
        MdIconModule,
        MdInputModule,
        MdDialogModule,
        MdSelectModule,
    ],
    providers: [],
    exports: [
        SdcTableComponent
    ]
})

export class SdcTableModule {}
