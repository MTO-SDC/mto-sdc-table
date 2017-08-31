import { EditResultComponent } from './../../edit-result-form/edit-result.component';
import { ColumnWithProperties, TableProperties } from './table.objects';
import { SdcTableComponent } from './sdc-table.component';
import { TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { SdcModalComponent } from './../modal/sdc-modal.component';
import { CdkTableModule } from '@angular/cdk/table';
import {
    MdButtonModule,
    MdCheckboxModule,
    MdTableModule,
    MdIconModule,
    MdPaginatorModule,
    MdSortModule,
    MdInputModule,
    MdDialogModule,
    MdSelectModule,
    MdDatepickerModule,
    MdNativeDateModule
} from '@angular/material';
import { NgModule, ChangeDetectorRef, ComponentFactoryResolver } from '@angular/core';
import { FocusDirective } from './../focus-directive/sdc-focus.directive';
import { HoverDirective } from './../sdc-hover-directive/sdc-hover.directive';
import { PipeJoin } from './../pipe-join/sdc-pipe-join.pipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
const faker = require('faker');

describe('SdcTableComponent', () => {
    let fixture: any;
    let component: any;

    let testColumnInfo: ColumnWithProperties[] = [
        new ColumnWithProperties({heading: 'First Name', initialDisplay: true, editable: true, sortable: true, key: 'employee.firstName', hoverable: true, filterable: false}),
        new ColumnWithProperties({heading: 'Last Name', sortable: true, key: 'employee.lastName', hoverable: true, filterable: false }),
        new ColumnWithProperties({heading: 'Address', key: 'employee.addressLine1', select: [1, 2, 3, 4, 5], filterable: false}),
        new ColumnWithProperties({heading: 'Payment Gross Amount', key: 'payment.grossAmount', pipeOptions: {currency: true}, hoverable: true, showSum: true, filterable: false}),
        new ColumnWithProperties({heading: 'Payment Net Amount', key: 'payment.netAmount', hoverable: true, showSum: { title: 'Final:' }, filterable: false}),
        new ColumnWithProperties({buttonTitle: 'More Info', button: true, openCustomComponent: true, iconBefore: 'accessibility', iconAfter: 'home'}),
        new ColumnWithProperties({buttonTitle: '', button: true, mdButton: true, iconBefore: 'home', filterable: false}),
        new ColumnWithProperties({heading: 'Total', initialDisplay: true, isSumColumn: { columnsToSum: ['payment.grossAmount', 'payment.netAmount'] }, pipeOptions: {currency: true}, sortable: true, filterable: false})
    ];
    const numberOfObjects: number = 10;
    let testDisplayObjects: Array<any> = [];
    for (let i = 0; i < numberOfObjects; i++) {
        testDisplayObjects.push({employee: {firstName: faker.name.firstName(), lastName: faker.name.lastName(), country: {code: 'MEX', population: 'some'}}, birthDate: faker.date.past(), payment: {grossAmount: faker.random.number(2000), netAmount: faker.random.number(2000)}});
    }

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SdcTableComponent,
                SdcModalComponent,
                FocusDirective,
                HoverDirective,
                PipeJoin
            ],
            imports: [
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
                MdDatepickerModule,
                MdNativeDateModule,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(SdcTableComponent);
        component = fixture.componentInstance;
    }));

    it('should create the component', async(() => {
        expect(component).toBeTruthy();
    }));

    describe('ngOnInit', () => {
        it('should loop through columnInfo and initialize a variety of variables accordingly', () => {
            const initialUniqueBtnKey = component.uniqueBtnKey;
            component.columnInfo = testColumnInfo;

            fixture.detectChanges();

            expect(component.columnInfo[5].key).toEqual(initialUniqueBtnKey);
            expect(component.columnInfo[6].key).toEqual(initialUniqueBtnKey + 'xo');
            expect(component.hasButtonForCustomComponent).toBe(true);
            expect(component.hasInitialDisplayColumnsSpecified).toBe(true);
            expect(component.displayedColumns.length).toBe(2);
            expect(component.displayedColumnNames.length).toBe(8);
            expect(component.hideFilterInput).toBe(false);
        });

        it('should create and initialize the data of a DataSource class', () => {
            component.displayObjects = testDisplayObjects;

            fixture.detectChanges();

            expect(component.mdTableData).toBeDefined();
            expect(component.mdTableData.data).toBeDefined();
        });
    });

    describe('generateDataSource', () => {
        it('should return an array of objects containing only keys specified in columnInfo', () => {
            const uniqueKey = component.uniqueKey;
            const uniqueBtnKey = component.uniqueBtnKey;
            // component.columnInfo = testColumnInfo;
            // component.displayObjects = testDisplayObjects;
            fixture.detectChanges();

            const testResult = component.generateDataSource(testDisplayObjects, testColumnInfo);

            expect(testResult).toBeDefined();
            expect(testResult.length).toBe(numberOfObjects);
            expect(testResult[0][uniqueKey]).toBe(0);
            expect(testResult[2]['employee.firstName']).toBeDefined();
        });
    });
    describe('Button and row clicks', () => {
        beforeEach(() => {
            spyOn(component, 'expandRow');
            spyOn(component, 'showModal');
        });

        describe('buttonClicked', () => {
            it('should call the appropriate function if any and emit the event.', () => {
                spyOn(component.buttonPress, 'emit');
                component.tableProperties = {accordian: true};
                component.buttonClicked(0, 0, testColumnInfo[5]);

                expect(component.expandRow).toHaveBeenCalled();
                expect(component.buttonPress.emit).toHaveBeenCalled();

                component.tableProperties = {modal: true};
                component.buttonClicked(0, 0, testColumnInfo[5]);

                expect(component.showModal).toHaveBeenCalled();
                expect(component.buttonPress.emit).toHaveBeenCalledTimes(2);
            });
        });

        describe('rowClicked', () => {
            it('should do nothing if no tableProperties', () => {
                component.rowClicked(0, 0);
                expect(component.showModal).not.toHaveBeenCalled();
                expect(component.expandRow).not.toHaveBeenCalled();
            });

            it('should do nothing if there is a button for expanding', () => {
                component.hasButtonForCustomComponent =  true;

                component.rowClicked(0, 0);
                expect(component.showModal).not.toHaveBeenCalled();
                expect(component.expandRow).not.toHaveBeenCalled();
            });

            it('should call expand row', () => {
                component.tableProperties = {accordian: true};
                component.rowClicked(0, 0);

                expect(component.expandRow).toHaveBeenCalled();
            });

            it('should call showModal', () => {
                component.tableProperties = {modal: true};
                component.rowClicked(0, 0);

                expect(component.showModal).toHaveBeenCalled();
            });
        });
    });

    describe('expandRow and showModal', () => {
        beforeEach(() => {
            component.columnInfo = testColumnInfo;
            component.displayObjects = testDisplayObjects;
            fixture.detectChanges();
        });
        describe('expandRow', () => {
            it('should close an open row', () => {
                component.expandedRow = 0;
                component.expandRow(0, 0);

                expect(component.expandedRow).toBe(null);
            });

            it('should set expandedRow', () => {
            });
        });

        describe('showModal', () => {
            it('should call createComponent on the modalRef and set hideModal to false', () => {
            });
        });

    });

    describe('pagination intitializing methods', () => {
        describe('pageSize', () => {
            it('should return length of displayObjects if tableProperties is missing', () => {
                component.displayObjects = [1, 2, 3, 4];

                expect(component.pageSize()).toBe(4);
            });

            it('should return 5 if no initial page size specified', () => {
                component.tableProperties = {pagination: {supported: true}};

                expect(component.pageSize()).toBe(5);
            });

            it('should return the number selected in tableProperties if provided', () => {
                component.tableProperties = {pagination: {supported: true, itemsPerPage: 10}};

                expect(component.pageSize()).toBe(10);
            });
        });

        describe('pageSizeOptions', () => {
            it('should return [5, 10, 25, 50] if nothing provided', () => {
                expect(component.pageSizeOptions()).toEqual([5, 10, 25, 50]);
            });

            it('should return the array selected in tableProperties if provided', () => {
                component.tableProperties = {pagination: {supported: true, pageSizeOptions: [1, 4, 14]}};

                expect(component.pageSizeOptions()).toEqual([1, 4, 14]);
            });
        });
    });

    describe('updateObjectField', () => {
        it('should return an identical object with just one field changed', () => {
            let object = {
                field1: {
                    nestedField1: 1,
                    nestedField2: {
                        nestednestedField1: 2
                    },
                    nestedField3: 3
                },
                field2: 4
            };
            object = component.updateObjectField(object, 'field1.nestedField2.nestednestedField1', 10);

            expect(object.field1.nestedField2.nestednestedField1).toBe(10);
            expect(object.field2).toBe(4);
            expect(object.field1.nestedField1).toBe(1);
        });

    });

    describe('Cell editing', () => {
        beforeEach(() => {
            component.columnInfo = testColumnInfo;
            component.displayObjects = testDisplayObjects;
            fixture.detectChanges();
            spyOn(component.change, 'emit').and.callThrough();
            spyOn(component, 'updateObjectField');
            spyOn(component.mdTableData, 'setData');
        });

        describe('cellClicked', () => {
            it('should do nothing if cell is a total cell', () => {
                component.cellClicked(component.mdTableData.data[component.mdTableData.data.length - 1], component.columnInfo[4]);
                expect(component.columnInfo[4].editing).toBeUndefined();
            });

            it('should do nothing if column is a total column', () => {
                component.cellClicked(component.mdTableData.data[0], component.columnInfo[7]);
                expect(component.columnInfo[7].editing).toBeUndefined();
            });

            it('should do nothing on non-editable cell', () => {
                component.cellClicked(component.mdTableData.data[0], component.columnInfo[1]);
                expect(component.columnInfo[1].editing).toBeUndefined();
            });

            it('should set editing variable and emit to focus directive on editable cell', () => {
                component.cellClicked(component.mdTableData.data[0], component.columnInfo[0]);
                expect(component.columnInfo[0].editing).toBe(0);
            });
        });

        describe('inlineCellValueUpdate', () => {
            it ('should call all the functions to update the cell value', () => {
                component.inlineCellValueUpdate('new value', component.mdTableData.data[0], component.columnInfo[0]);

                expect(component.change.emit).toHaveBeenCalled();
                expect(component.updateObjectField).toHaveBeenCalled();
                expect(component.mdTableData.setData).toHaveBeenCalled();
            });
        });

        describe('selectCellValueUpdate', () => {
            it ('should call all the functions to update the cell value', () => {
                component.selectCellValueUpdate('new value', component.mdTableData.data[0], component.columnInfo[2]);

                expect(component.change.emit).toHaveBeenCalled();
                expect(component.updateObjectField).toHaveBeenCalled();
                expect(component.mdTableData.setData).toHaveBeenCalled();
            });
        });

        describe('dateCellValueUpdate', () => {
            it ('should call all the functions to update the cell value', () => {
                component.dateCellValueUpdate('new value', component.mdTableData.data[0], component.columnInfo[0]);

                expect(component.change.emit).toHaveBeenCalled();
                expect(component.updateObjectField).toHaveBeenCalled();
                expect(component.mdTableData.setData).toHaveBeenCalled();
            });
        });
    });
});
