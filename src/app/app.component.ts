import { EditResultComponent } from './edit-result-form/edit-result.component';
import { ColumnWithProperties } from './table/table-component/table.objects';
import { Component, ComponentFactoryResolver } from '@angular/core';
const faker = require('faker');

@Component({
  selector: 'sdc-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public factory: any;
    public columns: ColumnWithProperties[] = [
        new ColumnWithProperties({heading: 'First Name', initialDisplay: true, sortable: true, key: 'employee.firstName', hoverable: true, filterable: false}),
        new ColumnWithProperties({heading: 'Last Name', sortable: true, key: 'employee.lastName', hoverable: true, filterable: false }),
        new ColumnWithProperties({heading: 'Address', key: 'employee.addressLine1', select: [1, 2, 3, 4, 5], filterable: false}),
        new ColumnWithProperties({heading: 'Payment Gross Amount', key: 'payment.grossAmount', pipeOptions: {currency: true}, hoverable: true, showSum: true, filterable: false}),
        new ColumnWithProperties({heading: 'Payment Net Amount', key: 'payment.netAmount', hoverable: true, showSum: { title: 'Final:' }, filterable: false}),
        new ColumnWithProperties({buttonTitle: 'More Info', button: true, openCustomComponent: true, iconBefore: 'accessibility', iconAfter: 'home'}),
        new ColumnWithProperties({buttonTitle: '', button: true, mdButton: true, iconBefore: 'home', filterable: false}),
        new ColumnWithProperties({heading: 'Total', initialDisplay: true, isSumColumn: { columnsToSum: ['payment.grossAmount', 'payment.netAmount'] }, pipeOptions: {currency: true}, sortable: true, filterable: false})
    ];
    public columnsBasic = [
        {heading: 'First Name', key: 'employee.firstName'},
        {heading: 'Last Name', key: 'employee.lastName' },
        {heading: 'Address', key: 'employee.addressLine1'},
        {heading: 'Postal Code', key: 'employee.postalCode'}
    ];
    public data: any[] = new Array<any>();
    private tableProperties = {
        selectColumnsToDisplay: true,
        accordian: true,
        // modal: true,
        // inlineEditing: true,
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
            this.data.push({employee: {firstName: faker.name.firstName(), lastName: faker.name.lastName(), country: {code: 'MEX', population: 'some'}}, birthDate: faker.date.past(), payment: {grossAmount: faker.random.number(2000), netAmount: faker.random.number(2000)}});
        }
        this.factory = this.resolver.resolveComponentFactory(EditResultComponent);
    }

    changeEvent(event) {
        console.log(event);
        this.data[event.index] = event.data;
    }

    buttonPressHandler(event) {
    }
}
