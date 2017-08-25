import { Component, ComponentFactoryResolver } from '@angular/core';

@Component({
  selector: 'sdc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public factory: any;
    public headings = [
        {heading: 'First Name', sortable: true, filterable: true, key: 'employee.firstName', hoverable: {backgroundColor: '#CCC'}},
        {heading: 'Last Name', sortable: true, filterable: true, key: 'employee.lastName', hoverable: {backgroundColor: '#CCC'} },
        {heading: 'Address', key: 'employee.addressLine1', hoverable: {backgroundColor: '#CCC'}}, // , select: {options: [1, 2, 3, 4, 5]
        {heading: 'Payment Gross Amount', key: 'payment.grossAmount', pipeOptions: {currency: true, custom: (value) => value * 10}, hoverable: {backgroundColor: '#CCC'}},
        {buttonTitle: 'More Info', button: true, openCustomComponent: true, iconBefore: 'accessibility', iconAfter: 'home'},
        {buttonTitle: '', button: true, mdButton: true, iconBefore: 'home'}
    ];
    public headingsBasic = [
        {heading: 'First Name', key: 'employee.firstName'},
        {heading: 'Last Name', key: 'employee.lastName' },
        {heading: 'Address', key: 'employee.addressLine1'},
        {heading: 'Postal Code', key: 'employee.postalCode'}
    ];
    public data: any[] = new Array<any>();
    private tableProperties = {
        accordian: true,
        // modal: true,
        inlineEditing: true,
        pagination: {
            supported: true,
            itemsPerPage: 4,
            pageSizeOptions: [4, 8, 16, 32, 2000]
        },
        maxHeight: 700,
        elevation: 'mat-elevation-z2'
    };
    private tablePropertiesNoPagination = {
        pagination: {
            supported: false,
        },
        maxHeight: 500,
    };
    constructor(private resolver: ComponentFactoryResolver) {
        // tslint:disable-next-line:forin
        for (let i = 0; i < 5; i++) {
            // this.data.push(TestObjectsService.getTestResult());
            this.data.push({employee: {firstName: 'mark', lastName: 'joaquim', addressLine1: 'addr'}, payment: {grossAmount: 1337}});
        }

        // this.factory = this.resolver.resolveComponentFactory(EditResultComponent);
    }

    changeEvent(event) {
        console.log(event);
        this.data[event.index] = event.data;
    }

    buttonPressHandler(event) {
    }
}
