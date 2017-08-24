import { SdcTableModule } from './table/sdc-table.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SdcTableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
