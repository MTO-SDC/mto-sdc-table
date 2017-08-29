import { EditResultComponent } from './edit-result-form/edit-result.component';
import { SdcTableModule } from './table/sdc-table.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';

@NgModule({
  entryComponents: [EditResultComponent],
  declarations: [
    AppComponent,
    EditResultComponent
  ],
  imports: [
    BrowserModule,
    SdcTableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
