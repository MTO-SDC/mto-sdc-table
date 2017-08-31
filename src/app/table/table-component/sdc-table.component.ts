import { SdcModalComponent } from './../modal/sdc-modal.component';
import { TableProperties, ColumnWithProperties } from './table.objects';
// tslint:disable-next-line:max-line-length
import { Component, Input, Output, OnInit, ViewChild, ViewChildren, TemplateRef, QueryList, ViewContainerRef, ComponentFactory, ElementRef, AfterViewInit, EventEmitter, ComponentFactoryResolver, ComponentRef, ChangeDetectorRef } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { MdPaginator, MdSort, MdDialog } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PipeJoin } from './../pipe-join/sdc-pipe-join.pipe';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';

type AOA = Array<Array<any>>;

function s2ab(s: string): ArrayBuffer {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; i++) {
        // tslint:disable-next-line:no-bitwise
        view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
}

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
    @ViewChild('inputFile') hiddenFileInputElement: ElementRef;

    // OUTPUT
    @Output() private change: EventEmitter<any> = new EventEmitter<any>();
    @Output() private buttonPress: EventEmitter<any> = new EventEmitter<any>();

    // INPUT
    // Child Component to expand
    @Input() private factory: any;
    // Data for table heading
    @Input() private columnInfo: Array<ColumnWithProperties>;
    // Table Data
    @Input() private displayObjects: Array<{[key: string]: any}>;
    // Table properties
    @Input() private tableProperties: TableProperties;

    // Var's
    private expandedRow: number;
    private displayedColumns: Array<string> = new Array<string>();
    private mdTableData: ExampleDataSource;
    private hideFilterInput: boolean = true;
    private uniqueKey: string = 'uniqueTableId';
    private uniqueBtnKey: string = 'uniqueBtnKey';
    private hideModal: boolean = false;
    private focusEventEmitter = new EventEmitter<boolean>();
    private hasButtonForCustomComponent: boolean = false;
    private wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary'};
    private displayedData: Array<{[key: string]: any}>;
    private data: AOA = [['E', 'R', 'R', 'O', 'R'], [1, 2, 3, 'File', 'Generated', 'Incorrectly']];
    private file: File;

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

                this.displayedColumns.push(column.key);

                if (column.filterable) {
                    this.hideFilterInput = false;
                }
            });
        } else if (this.displayObjects.length > 0) {
            this.columnInfo = [];
            // tslint:disable-next-line:forin
            for (const key in this.displayObjects[0]) {
                this.displayedColumns.push(key);
                this.columnInfo.push({heading: key, key: key});
            }
        }

        this.mdTableData = new ExampleDataSource(this.paginator, this.sort, this.changeDetectorRef, this.columnInfo);
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
    // tslint:disable-next-line:max-line-length
    private generateDataSource(objArray: Array<{[key: string]: any}>, columnInfoArray: Array<ColumnWithProperties>): Array<{[key: string]: any}> {
        const processedArray: Array<{[key: string]: any}> = new Array<{[key: string]: any}>();
        // fill the processed array with objects based on their submitted ones and the desired columnInfo
        for ( let i = 0; i < objArray.length; i++ ) {
            let field: any;
            const processedObject: {[key: string]: any} = {};
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
        this.displayedData = processedArray;
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
        // Set i equal to the appropriate index of the corresponding container that was clicked
        // NOTE: this is needed, when the table is sorted this.contianers is mixed up which leads to dropdowns opening in incorrect places
        const containerArray = this.containers.toArray();
        const x: number = i;
        containerArray.forEach((container, index) => {
            if ( +container.element.nativeElement.id === x) {
                i = index;
            }
        });
        const container = containerArray[i];

        // Remove the collapsible row on other row click
        if ( this.expandedRow != null ) { containerArray[this.expandedRow].clear(); }

        if ( this.expandedRow === i ) {
            this.expandedRow = null;
        } else { // Generate and display the appropriate component within the dropped row

            // Build the component
            const messageComponent = container.createComponent(this.factory);
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
        const modalComponent: ComponentRef<SdcModalComponent> = this.modalRef.createComponent(this.resolver.resolveComponentFactory(SdcModalComponent));
        modalComponent.instance['componentFactory'] = this.factory;
        modalComponent.instance['objectToPassToComponent'] = this.displayObjects[objId];
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
        const objectToUpdate: Array<any> = [object];
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
        if (!row.__sumRow && !column.isSumColumn && !column.button && (
            (this.tableProperties && this.tableProperties.inlineEditing) || column.editable)
            ) {
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

    /**
     * Function to export tableInformation to excel
     */
    private exportTable(): void {
        // generate the date to export to excel
        this.data = this.generateAOA();
        // generate the worksheet
        const ws = XLSX.utils.aoa_to_sheet(this.data);

        // generate teh workbook and add the worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

        // Save to file
        const wbout = XLSX.write(wb, this.wopts);

        // Check that the filename is appropriately passed
        let checkedFileName: string = this.tableProperties.IOOptions.fileName;
        if (checkedFileName) {
            const splitName: Array<string> = checkedFileName.split('.');
            if (splitName[splitName.length] !== 'xlsx') {
                checkedFileName = checkedFileName + '.xlsx';
            }
        } else {
            const date = new Date();
            // tslint:disable-next-line:max-line-length
            checkedFileName =  'Output-' + date.getDay() + '-' + date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear() + '-' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + '.xlsx';
        }
        const fileName = checkedFileName;

        console.log(fileName);
        saveAs(new Blob([s2ab(wbout)]), fileName);
    }

    /**
     * Function to generate the Array of Arrays that XLSX requires to create an excel sheet
     */
    private generateAOA(): AOA {
        const AoA: AOA = new Array<Array<any>>();
        const headingsArray: Array<any> = new Array<any>();

        this.displayedData.forEach((object, index) => {
            const singularArray: Array<any> = new Array<any>();
            let counter = 0;
            // tslint:disable-next-line:forin
            for (const key in object) {
                // get the appropriate table headings
                if (index === 0 && counter === 0) {
                    this.columnInfo.forEach(colInfo => {
                        headingsArray.push(colInfo.heading);
                    });
                }
                if (counter !== 0) {
                    singularArray.push(object[key]);
                }
                counter++;
            }
            if (index === 0) {
                AoA.push(headingsArray);
            }
            AoA.push(singularArray);
        });
        return AoA;
    }

    /**
     * Function to trigger the hidden file input tags click event
     */
    private async inputFile(evt: any) {
        const target: DataTransfer = <DataTransfer>(evt.target);

        if (+target.files.length !== 1) { throw new Error('Cannot upload multiple files on the entry'); }

        const reader = new FileReader();

        reader.onload = (e: any) => {
            // Read the workbook
            const bstr = e.target.result;
            const wb = XLSX.read(bstr, {type: 'binary'});
            // Get the first sheet
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            // Save the data
            this.data = <AOA>(XLSX.utils.sheet_to_json(ws, {header: 1}));
            console.log(this.data);
            // Generate the displayObjects
            this.getDisplayObjectsFromExcel(this.data);
        };
        const file = evt.target.files;
        reader.readAsBinaryString(file[0]);
    }

    private getDisplayObjectsFromExcel(data: AOA): void {
        let headers: Array<string> = null;
        const keys: Array<string> =  new Array<string>();
        const generatedObjects: Array<{[key: string]: any}> = new Array<{[key: string]: any}>();
        // TODO: NEED TO GENERATE TABLE HEADINGS OBJECT AND TABLE PROPERTIES OBJECT
        if (this.tableProperties.IOOptions.headers) {
            headers = data[0];
            data.shift();
            // Replace all the spaces in the headers with . seperated keys for the object.
            headers.forEach((header, index) => {
                const key: string = header.replace(/ /g, '.');

                // generatedObjects.push({});
                // generatedObjectsheader.replace(/ /g, '.'));
            });


        } else {
            // TODO: Build object without header
            // TODO: Build fake keys
        }

        this.mdTableData.setData(data);
    }

    private dateCellValueUpdate(updateValue: any, row, column: ColumnWithProperties): void {
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
    filterChange = new BehaviorSubject('');
    get filter(): string { return this.filterChange.value; }
    set filter(filter: string) { this.filterChange.next(filter); }

    private columnDataArray: ColumnWithProperties[];

    constructor(
        private paginator: MdPaginator,
        private sort: MdSort,
        public changeDetectorRef: ChangeDetectorRef,
        private columnDataArrayInput: ColumnWithProperties[]) {
        super();
        this.columnDataArray = columnDataArrayInput;
    }

    setData(data) {
        this.dataChange.next(data);
        this.changeDetectorRef.detectChanges();
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
            const columnSums = {};
            let updatedTableRows = this.getSortedData().filter((item) => {
                if (this.filter === '') {
                    return true;
                }

                for (const key in item) {
                    if (item.hasOwnProperty(key)) {
                        const columnSettings: ColumnWithProperties = this.columnDataArray.filter(currentItem => currentItem.key === key)[0];

                        if (columnSettings && columnSettings.filterable) {

                            if (('' + item[key]).toLowerCase().indexOf(this.filter.toLowerCase()) !== -1) {
                                return true;
                            }

                            // Also filter by the value after the pipe
                            if (columnSettings.pipeOptions) {
                                const resultAfterPipe = new PipeJoin().transform(item[key], columnSettings.pipeOptions);

                                if (resultAfterPipe.toLowerCase().indexOf(this.filter.toLowerCase()) !== -1) {
                                    return true;
                                }
                            }

                        }
                    }
                }

                return false;
            });

            for (const updatedTableRow of updatedTableRows) {
                for (const rowKey in updatedTableRow) {
                    if (updatedTableRow.hasOwnProperty(rowKey)) {
                        // COLUMN SUM: Add this number to the sum
                        const columnSettings: ColumnWithProperties = this.columnDataArray.filter(item => item.key === rowKey)[0];
                        if (columnSettings && columnSettings.showSum) {
                            columnSums[columnSettings.key] = columnSums[columnSettings.key] || 0; // Initialize to 0 if necessary
                            columnSums[columnSettings.key] += Number(updatedTableRow[rowKey]);
                        }

                        // ROW SUM: Sum all specified columns
                        if (columnSettings && columnSettings.isSumColumn) {
                            updatedTableRow[rowKey] = 0;
                            for (const columnToSum of columnSettings.isSumColumn.columnsToSum) {
                                updatedTableRow[rowKey] += Number(updatedTableRow[columnToSum]);
                            }
                        }
                    }
                }
            }

            this.tableLength = updatedTableRows.length;
            if (this.paginator) {
                updatedTableRows = updatedTableRows.splice(this.paginator.pageIndex * this.paginator.pageSize, this.paginator.pageSize);
            }

            // At least one COLUMN sum, so add a new row to the table
            if (Object.keys(columnSums).length > 0) {
                columnSums['__sumRow'] = true;
                updatedTableRows.push(columnSums);
            }

            return updatedTableRows;
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

            const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
            const valueB = isNaN(+propertyB) ? propertyB : +propertyB;

            return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
        });
    }
}
