import { TableProperties, ColumnData } from './table/table-component/table.objects';
import { Component, ComponentFactoryResolver } from '@angular/core';
const faker = require('faker');

@Component({
  selector: 'sdc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public factory: any;
    public headings = [
        {heading: 'First Name', sortable: true, filterable: true, key: 'employee.firstName'},
        {heading: 'Last Name', sortable: true, filterable: true, key: 'employee.lastName' },
        {
            heading: 'Country', key: 'employee.country', sortable: true, filterable: true,
            select: [
                {value: {code: 'CAN', population: 'lots'}, view: 'Canada'},
                {value: {code: 'USA', population: 'more'}, view: 'United States'},
                {value: {code: 'PHI', population: '10'}, view: 'Phillipines'},
                {value: {code: 'MEX', population: 'some'}, view: 'Mexico'}
            ]
        },
        // tslint:disable-next-line:max-line-length
        {heading: 'Payment Gross Amount', key: 'payment.grossAmount', pipeOptions: {currency: true, custom: (value) => value * 10}, hoverable: {backgroundColor: '#CCC'}},
        {buttonTitle: 'More Info', button: true, modalOrDropdown: true, iconBefore: 'accessibility', iconAfter: 'home'},
        {buttonTitle: '', button: true, mdButton: true, iconBefore: 'home'}
    ];
    public headingsBasic = [
        {heading: 'First Name', key: 'employee.firstName'},
        {heading: 'Last Name', key: 'employee.lastName' },
        {heading: 'Address', key: 'employee.addressLine1'},
        {heading: 'Postal Code', key: 'employee.postalCode'}
    ];
    public data: any[] = new Array<any>();
    private tableProperties: TableProperties = {
        // accordian: true,
        // modal: true,
        // inlineEditing: true,
        pagination: {
            supported: true,
            itemsPerPage: 4,
            pageSizeOptions: [4, 8, 16, 32, 2000]
        },
        maxHeight: 700,
        elevation: 'mat-elevation-z2',
        export: {
            toExcel: true,
            buttonOptions: {
                text: 'Export to .XLSX',
                icon: 'snooze',
                showIcon: true,
                showText: true,
                position: 'bottom-right',
                type: 'md-raised-button'
            }
        }
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
            // tslint:disable-next-line:max-line-length
            this.data.push({employee: {firstName: faker.name.firstName(), lastName: faker.name.lastName(), country: {code: 'MEX', population: 'some'}}, payment: {grossAmount: faker.random.number(2000)}});
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
