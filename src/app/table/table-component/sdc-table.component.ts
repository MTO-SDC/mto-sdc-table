import { SdcModalComponent } from './../modal/sdc-modal.component';
import { TableProperties, ColumnWithProperties } from './table.objects';
// tslint:disable-next-line:max-line-length
import { Component, Input, Output, OnInit, ViewChild, ViewChildren, TemplateRef, QueryList, ViewContainerRef, ComponentFactory, ElementRef, AfterViewInit, EventEmitter, ComponentFactoryResolver, ComponentRef, ChangeDetectorRef } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { MdPaginator, MdSort, MdDialog } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PipeJoin } from './../pipe-join/sdc-pipe-join.pipe';
import { SdcDataSource } from './sdc-data-source';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
@Component({
    selector: 'sdc-table',
    templateUrl: './sdc-table.component.html',
    styleUrls: ['./sdc-table.component.scss']
})

export class SdcTableComponent implements OnInit {
    // References
    @ViewChildren('cdkrow', { read: ViewContainerRef }) private containers: QueryList<ViewContainerRef>;
    @ViewChild('modalRef', {read: ViewContainerRef}) modalRef: ViewContainerRef;
    @ViewChild(MdPaginator) paginator: MdPaginator = null;
    @ViewChild(MdSort) sort: MdSort;
    @ViewChild('filter') filter: ElementRef;

    // OUTPUT
    @Output() private change: EventEmitter<any> = new EventEmitter<any>();
    @Output() private buttonPress: EventEmitter<any> = new EventEmitter<any>();

    // INPUT
    // Child Component to expand
    @Input() private factory: any;
    // Data for table heading
    @Input() private columnInfo: Array<ColumnWithProperties>;
    // Table Data
    @Input() private displayObjects: Array<{[key: string]: any}> = [];
    // Table properties
    @Input() private tableProperties: TableProperties;

    // Var's
    private expandedRow: number;
    private displayedColumns: Array<string> = new Array<string>();
    private displayedColumnNames: Array<any> = new Array<any>();
    private mdTableData: SdcDataSource;
    private hideFilterInput: boolean = true;
    private uniqueKey: string = 'uniqueTableId';
    private uniqueBtnKey: string = 'uniqueBtnKey';
    private hideModal: boolean = false;
    private focusEventEmitter = new EventEmitter<boolean>();
    private hasButtonForCustomComponent: boolean = false;
    private hasInitialDisplayColumnsSpecified: boolean = false;

    constructor(public resolver: ComponentFactoryResolver, public changeDetectorRef: ChangeDetectorRef) {}

    // OnInit
    public ngOnInit(): void {
        if (this.columnInfo) {
            this.columnInfo.forEach(column => {
                if (!column.key) {
                    column.key = this.uniqueBtnKey;
                    this.uniqueBtnKey += 'xo';
                }

                if (column.openCustomComponent) {
                    this.hasButtonForCustomComponent = true;
                }

                if (!this.hasInitialDisplayColumnsSpecified) {
                    if (column.initialDisplay !== undefined) {
                        this.hasInitialDisplayColumnsSpecified = true;
                        this.displayedColumns = [];
                        column.initialDisplay ? this.displayedColumns.push(column.key) : null;
                    } else {
                        this.displayedColumns.push(column.key);
                    }
                } else {
                    column.initialDisplay ? this.displayedColumns.push(column.key) : null;
                }
                this.displayedColumnNames.push({view: column.heading ? column.heading : column.buttonTitle ? column.buttonTitle : 'Column ' + this.columnInfo.indexOf(column), value: column.key});

                if (column.filterable) {
                    this.hideFilterInput = false;
                }
            });
        } else if (this.displayObjects.length > 0) {
            this.columnInfo = [];
            // tslint:disable-next-line:forin
            for (let key in this.displayObjects[0]) {
                this.displayedColumns.push(key);
                this.columnInfo.push({heading: key, key: key});
            }
        }

        this.mdTableData = new SdcDataSource(this.paginator, this.sort, this.changeDetectorRef, this.columnInfo);
        this.mdTableData.setData(this.generateDataSource(this.displayObjects, this.columnInfo));

        Observable.fromEvent(this.filter.nativeElement, 'keyup')
            .debounceTime(150)
            .distinctUntilChanged()
            .subscribe(() => {
            if (!this.mdTableData) { return; }
            this.mdTableData.filter = this.filter.nativeElement.value;
        });
    }
    /**
     * Function to generate the appropriate DataSource objects for the table
     * @param {Array<{[key: string]: any}} objArray
     * @param {Array<ColumnWithProperties>} columnInfoArray
     */
    private generateDataSource(objArray: Array<{[key: string]: any}>, columnInfoArray: Array<ColumnWithProperties>): Array<{[key: string]: any}> {
        let processedArray: Array<{[key: string]: any}> = new Array<{[key: string]: any}>();
        // fill the processed array with objects based on their submitted ones and the desired columnInfo
        for ( let i = 0; i < objArray.length; i++ ) {
            let field: any;
            let processedObject: {[key: string]: any} = {};
            processedObject[this.uniqueKey] = i; // give each object a unique field with our unique key for row expanding

            columnInfoArray.forEach(column => {
                let splitkeys: Array<string> = new Array<string>();

                column.key.includes('.') ? splitkeys = column.key.split('.') : splitkeys.push(column.key);

                field = objArray[i];

                // find the value desired for each object using the column keys.
                for ( let j = 0; j < splitkeys.length; j++ ) {
                    field[splitkeys[j]] ? field =  field[splitkeys[j]] : field = undefined;
                }

                if (column.select && column.select[0].view && column.select[0].value) {
                    for (const option of column.select) {
                        if (JSON.stringify(option.value) === JSON.stringify(field)) {
                            processedObject[column.key] = option.view;
                            break;
                        }
                    }
                } else {
                    processedObject[column.key] = field;
                }
            });
            processedArray.push(processedObject);
        }
        return processedArray;
    }

    buttonClicked(i: number, objId: number, column: ColumnWithProperties) {
        if (this.tableProperties && column.openCustomComponent) {
            if (this.tableProperties.accordian) {
                this.expandRow(i, objId);
            } else if (this.tableProperties.modal) {
                this.showModal(i, objId);
            }
        }
        this.buttonPress.emit({data: this.displayObjects[objId], index: objId});
    }

    /**
     * Function to direct flow for functionality on row click
     * @param {number} i : index of row clicked
     * @param {number} objId : unique id of object in rows.
     */
    private rowClicked(i: number, objId: number): void {
        if (this.tableProperties && !this.hasButtonForCustomComponent) {
            if (this.tableProperties.accordian) {
                this.expandRow(i, objId);
            } else if (this.tableProperties.modal) {
                this.showModal(i, objId);
            }
        }

    }

    /**
     * Function to display a dropped down containing a components information at the appropriate location within the table.
     * @param {number} i
     * @param {number} objId
     */
    private expandRow(i: number, objId: number): void {
        console.log(this.factory, this.containers.toArray());
        // Set i equal to the appropriate index of the corresponding container that was clicked
        // NOTE: this is needed, when the table is sorted this.contianers is mixed up which leads to dropdowns opening in incorrect places
        let containerArray = this.containers.toArray();
        let x: number = i;
        containerArray.forEach((container, index) => {
            if ( +container.element.nativeElement.id === x) {
                i = index;
            }
        });
        let container = containerArray[i];

        // Remove the collapsible row on other row click
        if ( this.expandedRow != null ) { containerArray[this.expandedRow].clear(); }

        if ( this.expandedRow === i ) {
            this.expandedRow = null;
        } else { // Generate and display the appropriate component within the dropped row

            // Build the component
            let messageComponent = container.createComponent(this.factory);
            messageComponent.instance['data'] = this.displayObjects[objId];
            messageComponent.instance['change'].subscribe(change => {
                this.change.emit({data: change, index: objId});
                this.mdTableData.setData(this.generateDataSource(this.displayObjects, this.columnInfo));
            });
            this.expandedRow = i;
        }
    }

    /**
     * Function to get the current DataSource objects array. Changes with view edit.
     */
    // private async getCurrentDataAtPosition() {
    //     let x;
    //     await this.mdTableData.connect().subscribe(
    //         data => x = data
    //     );
    //     return x;
    // }

    private pageSize(): number {
        if (this.tableProperties && this.tableProperties.pagination && this.tableProperties.pagination.supported) {
            if (this.tableProperties.pagination.itemsPerPage) {
                return this.tableProperties.pagination.itemsPerPage;
            } else {
                return 5;
            }
        } else {
            return this.displayObjects.length;
        }
    }

    private pageSizeOptions(): Array<number> {
        if (this.tableProperties
            && this.tableProperties.pagination
            && this.tableProperties.pagination.supported
            && this.tableProperties.pagination.pageSizeOptions) {
            return this.tableProperties.pagination.pageSizeOptions;
        } else {
            return [5, 10, 25, 50];
        }
    }

    /**
     * Function to generate the modal component and insert it into the appropraite container.
     * @param {number} i
     * @param {number} objId
     */
    private showModal(i: number, objId: number): void {
        // tslint:disable-next-line:max-line-length
        let modalComponent: ComponentRef<SdcModalComponent> = this.modalRef.createComponent(this.resolver.resolveComponentFactory(SdcModalComponent));
        modalComponent.instance['componentFactory'] = this.factory;
        modalComponent.instance['objectToPassToComponent'] = this.displayObjects[objId];
        modalComponent.instance['ng-content'] = 'HELLOEHELJELEJLEJ';
        modalComponent.instance['change'].subscribe(change => {
            this.change.emit({data: change.data, index: objId});
            this.mdTableData.setData(this.generateDataSource(this.displayObjects, this.columnInfo));
        });

        this.hideModal = false;
    }

    /**
     * Function to update the appropriate inline value;
     * @param {{[key: string]: any}} object
     * @param {string} key
     * @param {any} value
     */
    private updateObjectField(object: any, key: string, value: any): any {
        let splitkeys = [];
        let objectToUpdate: Array<any> = [object];
        key.includes('.') ? splitkeys = key.split('.') : splitkeys.push(key);

        for (let i = 0; i < splitkeys.length; i++) {
            objectToUpdate.push(objectToUpdate[i][splitkeys[i]]);
        }
        objectToUpdate[objectToUpdate.length - 1] = value;
        for (let i = objectToUpdate.length - 2; i >= 0; i--) {
            objectToUpdate[i][splitkeys[i]] = objectToUpdate[i + 1];
        }
        return objectToUpdate[0];
    }

    private cellClicked(row: any, column: ColumnWithProperties): void {
        if (!row.__sumRow && !column.isSumColumn && !column.button && ((this.tableProperties && this.tableProperties.inlineEditing) || column.editable)) {
            column.editing = row[this.uniqueKey];
            setTimeout(() => { this.focusEventEmitter.emit(true); }, 0);
        }
    }

    private inlineCellValueUpdate(updateValue: any, row: any, column: ColumnWithProperties): void {
        column.editing = null;
        this.change.emit({
            data: this.updateObjectField(this.displayObjects[row[this.uniqueKey]], column.key, updateValue),
            index: row[this.uniqueKey]
        });
        this.mdTableData.setData(this.generateDataSource(this.displayObjects, this.columnInfo));
    }

    private selectCellValueUpdate(updateValue: any, row: any, column: ColumnWithProperties): void {
        for (const option of column.select) {
            if (option.value && updateValue === option.view) {
                updateValue = option.value;
                break;
            }
        }
        this.change.emit({
            data: this.updateObjectField(this.displayObjects[row[this.uniqueKey]], column.key, updateValue),
            index: row[this.uniqueKey]
        });
        this.mdTableData.setData(this.generateDataSource(this.displayObjects, this.columnInfo));
    }

    private dateCellValueUpdate(updateValue: any, row, column: ColumnWithProperties): void {
        this.change.emit({
            data: this.updateObjectField(this.displayObjects[row[this.uniqueKey]], column.key, updateValue),
            index: row[this.uniqueKey]
        });
        this.mdTableData.setData(this.generateDataSource(this.displayObjects, this.columnInfo));
    }

    private updateVisibleColumns(selectedColumnsArray): void {
        this.displayedColumns = selectedColumnsArray;
    }
}
