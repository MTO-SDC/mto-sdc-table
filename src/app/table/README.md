# __SDC Table__

##### SDC Table is a versatile table module made with Angular Material's md-table for Angular ^4.3.5. Please read the README for help.

##### PLEASE NOTE: This is still in early beta and a lot of works needs to be done (github link coming soon)

## List of Supported Features
All features are optional.
* dynamic table generation
* inline editing
* modals**
* accordian style dropdowns**
* table sorting (can specify which columns are sortable)
* table filtering
* pagination
* table buttons
* pipes

**The modals and accordian drowpdown features must be given a component to load. Must be passed in in the form of a ComponentFactory.

## Getting Started

### Install
``` npm install sdc-table ```

* Dependencies: 
	* "@angular/animations": "^4.3.5"
	* "@angular/core": "^4.3.5"
	* "@angular/common": "^4.3.5"
	* "@angular/cdk": "github:angular/cdk-builds"
	* "@angular/material": "github:angular/material2-builds"
	* "hammerjs": "^2.0.8"
	* "rxjs": "^5.4.3"
	* "zone.js": "^0.8.16"
### Instructions
Import SdcTableModule into your application module file (usually app.module.ts)
```javascript 
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app.routing.module';
import { LOCALE_ID } from '@angular/core';
import 'hammerjs';

import { SdcTableModule } from 'sdc-table.module'; // SDC-Table

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        AppRoutingModule,
        SdcTableModule,
    ],
    providers: [
        { provide: LOCALE_ID, useValue: "en-CA" }
    ],
    bootstrap: [AppComponent]
})

export class AppModule {}
```

Import the SdcTableComponent within the component that will use it:
``` import { SdcTableComponent } from 'sdc-table.component'; ```
``` import { ColumnWithProperties } from 'table.objects'; ``` (INCORRECT, UPDATE ME)

The selector is: ``` <sdc-table><sdc-table> ```

### Inputs

The SdcTableComponent takes the following inputs:

```javascript
// Pass in the component factory of the child component you wish to render in dropdowns/modals
@Input() private factory: any;
// Information for columns
@Input() private columnInfo: Array<ColumnWithProperties>;
// Table Data Objects for display (i.e. the thing you want displayed)
@Input() private displayObjects: Array<{[key: string]: any}>;
// Table properties
@Input() private tableProperties: TableProperties;

```

The ColumnWithProperties object contains all the information needed to display the appropriate fields within the table. The table properties object used to define table behaviour.

__PLEASE NOTE:__ The SdcTableComponent will accept any kind of object, no matter how nested or complex as long as the appropriate keys are referenced within the Array of ColumnWithProperties objects.

Object Reference: 
```javascript
export class TableProperties {
    accordian?: boolean;
    modal?: boolean;
    pagination?: {
        supported: boolean,
        itemsPerPage?: number,
        pageSizeOptions?: Array<number>
    };
    tableStyles?: { // NOTE: NOT implemented fully
      table?: Array<string>;
      row?: Array<string>;
      filter?:  Array<string>; 
      pagination?: Array<string>;
    };
    events?: { // NOTE: NOT implemented fully
      emitEvents?: boolean;
      emitCellClick?: boolean;
      emitRowClick?: boolean;
      emitHeaderCellClick?: boolean;
      emitHeaderClick?: boolean;
      emitPageClick?: boolean;
      emitPaginationClick?: boolean;
      emitFilterClick?: boolean;
    };
    maxHeight?: number;
    elevation?: boolean;
    modalOptions?: ModalOptions;
    inlineEditing?: boolean;
}

export class ColumnWithProperties {
    public heading: string; // The table column heading to be displayed
    public sortable?: boolean; // If this column is sortable
    public filterable?: boolean;
    public editable?: boolean; // If inline editing is enabled
    public editing?: number;
    public pipeOptions?: {
        custom?: any;
        upperCase?: boolean; 
        lowerCase?: boolean; // should column be in lowercase
        currency?: {param1: string, param2: boolean, param3: string} | boolean;
        date?: {param1: string} | boolean;
        percent?: {param1: string} | boolean;
    };
    public select?: Array<{value?: any, view: string}>; // if cells should be dropdown selectors put the options and corresponding values here
    // Button options
    public button?: boolean; 
    public mdButton?: boolean;
    public mdRaisedButton?: boolean;
    public mdFab: boolean?;
    public mdMiniFab?: boolean;
    public key?: string; // The key within the object that the column is to display
    public datepicker?: boolean; // is cell a date object that should have a datepicker
    public minDate?: Date; // minimum date selectable
    public maxDate?: Date; // maximum date selectable
}

export class ModalOptions {
    styles?: {
        background?: {
            rgbaColor?: string;
        };
        dialog?: {
            rgbaColor?: string;
            width?: string;
            top?: string;
            left?: string;
            boxShadow?: string;
        };
    };
}
```

__PLEASE NOTE:__ ColumnWithProperties.key is a very important property. Please populate it with the key-path to the value you would like displayed. For example, if you pass in an array of Car objects and want to a column to display the data found int Car.engine.parts.piston ColumnWithProperties.key should be populated with 'engine.parts.piston' NOTE THAT Car is omitted! Giving it the value of 'piston' will only display Car.piston values if they exist. If this key is left blank every single key:value within the object will be displayed.

### Outputs
Work is being completed on outputing more events, currently only two event is returned, the updated object and the index at which it is located, a button click event.

```javascript
@Output() private change: EventEmitter<any> = new EventEmitter<any>();
@Output() private buttonPress: EventEmitter<any> = new EventEmitter<any>();
```

## Usage

### Using the Accordian Dropdown/Modals

The component to expand must be included in the entry components of the module you are working in so that you can build a factory for it and pass that to sdc-table. sdc-table CANNOT accept a component reference on it's own. A factory must be passed in using a component resolver.

Ex:
```javascript
// Within the parent component have this:
constructor(private resolver: ComponentFactoryResolver){}
this.factory = this.resolver.resolveComponentFactory(ComponentYouWantToDisplayInDropDownOrModal);
// Then pass the factory to sdc-table such as: <sdc-table [factory]="factory"><sdc-table>
```


### Changes in Dropdowns/Modals/In-line Editing

changes will be emitted to change in the following object
```
{
    data: Object    // your updated objects
    index: numebr   // index in the input array that was edited
}
```

### Using Select dropdowns in cells

To bind a property of the row object to an md-select style select menu simply format the ColumnData object that you want to appear as a select component like the following
```javascript
ColumnData {
    heading: "Country", // heading title as per usual
    key: "user.country", // key in the object to reflect
    select: [ // array of options to display, can take multiple forms
        {value: {name: 'Canada', abbreviation: 'CAN', population: 36000000}, view: 'Canada'}, // display the option 'Canada' but update object.user.country to the object in value
        {value: {name: 'United States of America', abbreviation: 'USA', population: 326000000}, view: 'United States'}
    ]
}
```

__Note:__ if you don't need a more complex object to be bound to the field than just a string or number you can simply make select an array of strings and every thing will work as expected.

```javascript
ColumnData {
    heading: "Country",
    key: "user.countryString",
    select: ['Canada', 'United States']
}
```

## Authors

* **Mark Joaquim** - *Initial work*
* **Robert Skakic** - *Initial work*
* **Lukas Rossi** - *Initial work*

__Questions/Comments/Concerns/Advice/Ideas/Bored?__ \
Please email: sdc.table@gmail.com