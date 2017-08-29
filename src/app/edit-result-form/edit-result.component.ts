import { Component, Input, Output, EventEmitter, OnInit, AfterContentInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CookieService } from 'angular2-cookie/core';
import { Router } from '@angular/router';

@Component({
    selector: 'edit-result',
    template: require('./edit-result.component.html'),
    styles: [require('./edit-result.component.css')]
})

export class EditResultComponent {
    @Input() data: any; // Result;
    @Output() private close: EventEmitter<any> = new EventEmitter<any>();
    @Output() private change: EventEmitter<any> = new EventEmitter<any>();
    
    // List of all table records which includes the form groups

    constructor() {}

}
