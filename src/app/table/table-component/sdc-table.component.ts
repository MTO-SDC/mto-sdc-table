import { SdcModalComponent } from './../modal/sdc-modal.component';
import { TableProperties, ColumnData } from './table.objects';
// tslint:disable-next-line:max-line-length
import { Component, Input, Output, OnInit, ViewChild, ViewChildren, TemplateRef, QueryList, ViewContainerRef, ComponentFactory, ElementRef, AfterViewInit, EventEmitter, ComponentFactoryResolver, ComponentRef, ChangeDetectorRef } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { MdPaginator, MdSort, MdDialog } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PipeJoin } from './../pipe-join/sdc-pipe-join.pipe';
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
    styleUrls: ['./sdc-table.component.css']
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
    @Input() private columnInfo: Array<ColumnData>;
    // Table Data
    @Input() private displayObjects: Array<{[key: string]: any}>;
    // Table properties
    @Input() private tableProperties: TableProperties;

    // Var's
    private expandedRow: number;
    private filterable: Array<string> = new Array<string>();
    private displayedColumns: Array<string> = new Array<string>();
    private mdTableData: ExampleDataSource;
    private hideFilterInput: boolean = true;
    private uniqueKey: string = 'uniqueTableId';
    private uniqueBtnKey: string = 'uniqueBtnKey';
    private hideModal: boolean = false;
    private focusEventEmitter = new EventEmitter<boolean>();
    private hasButtonForCustomComponent: boolean = false;

    constructor(public resolver: ComponentFactoryResolver, public changeDetectorRef: ChangeDetectorRef) {}

    // OnInit
    public ngOnInit(): void {
        console.log(this.paginator);
        if (this.columnInfo) {
            this.columnInfo.forEach(column => {
                if (!column.key) {
                    column.key = this.uniqueBtnKey;
                    this.uniqueBtnKey += 'xo';
                }

                if(column.openCustomComponent){
                    this.hasButtonForCustomComponent = true;
                }

                this.displayedColumns.push(column.key);
                if (column.filterable) {
                    this.hideFilterInput = false;
                    this.filterable.push(column.key);
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

        this.mdTableData = new ExampleDataSource(this.paginator, this.sort, this.changeDetectorRef);
        this.mdTableData.setData(this.generateDataSource(this.displayObjects, this.columnInfo));
        this.mdTableData.setFilterable(this.filterable);

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
     * @param {Array<ColumnData>} columnInfoArray
     */
    private generateDataSource(objArray: Array<{[key: string]: any}>, columnInfoArray: Array<ColumnData>): Array<{[key: string]: any}> {
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
                    field[splitkeys[j]] ? field =  field[splitkeys[j]] : field = 'undefined';
                }
                processedObject[column.key] = field;
            });
            processedArray.push(processedObject);
        }
        return processedArray;
    }

    buttonClicked(i: number, objId: number, column: ColumnData) {
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

    private cellClicked(row: any, column: ColumnData): void {
        if (!column.button && ((this.tableProperties && this.tableProperties.inlineEditing) || column.editable)) {
            column.editing = row[this.uniqueKey];
            setTimeout(() => { this.focusEventEmitter.emit(true); }, 0);
        }
    }

    private cellBlurred(updateValue: any, row: any, column: ColumnData): void {
        column.editing = null;
        this.change.emit({
            data: this.updateObjectField(this.displayObjects[row[this.uniqueKey]], column.key, updateValue),
            index: row[this.uniqueKey]
        });
        this.mdTableData.setData(this.generateDataSource(this.displayObjects, this.columnInfo));
    }
}

/**
 * Data source to provide what data should be rendered in the table. The observable provided
 * in connect should emit exactly the data that should be rendered by the table. If the data is
 * altered, the observable should emit that new set of data on the stream. In our case here,
 * we return a stream that contains only one set of data that doesn't change.
 */
export class ExampleDataSource extends DataSource<any> {

    /** Stream that emits whenever the data has been modified. */
    dataChange: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
    get data(): any[] { return this.dataChange.value; }

    // public data: any;
    public tableLength: number = 0;
    private filterable: Array<string>;
    filterChange = new BehaviorSubject('');
    get filter(): string { return this.filterChange.value; }
    set filter(filter: string) { this.filterChange.next(filter); }

    constructor(private paginator: MdPaginator, private sort: MdSort, public changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    setData(data) {
        this.dataChange.next(data);
        this.changeDetectorRef.detectChanges();
    }

    setFilterable(filterable) {
        this.filterable = filterable;
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<Element[] | any[]> {
         const displayDataChanges = [
            this.dataChange,
            this.paginator ? this.paginator.page : Observable.of(null),
            this.sort.mdSortChange,
            this.filterChange
        ];

        return Observable.merge(...displayDataChanges).map(() => {
            let returnValue = this.getSortedData().filter((item) => {
                let searchStr: string = '';
                // tslint:disable-next-line:forin
                for (let key in item) {
                    if (this.filterable && this.filterable.indexOf(key) !== -1) {
                        searchStr += ('' + item[key]).toLowerCase();
                    }
                }
                return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
            });
            this.tableLength = returnValue.length;
            if (this.paginator) {
                returnValue = returnValue.splice(this.paginator.pageIndex * this.paginator.pageSize, this.paginator.pageSize);
            }
            return returnValue;
        });
    }

    disconnect() {}

    /** Returns a sorted copy of the database data. */
    getSortedData(): any[] {
        const data = this.data.slice();
        if (!this.sort.active || this.sort.direction === '') { return data; }

        return data.sort((a, b) => {
            let propertyA: number|string = '';
            let propertyB: number|string = '';

            [propertyA, propertyB] = [a[this.sort.active], b[this.sort.active]];

            let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
        });
    }
}
