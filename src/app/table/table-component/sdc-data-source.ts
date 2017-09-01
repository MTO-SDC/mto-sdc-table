import { SdcModalComponent } from './../modal/sdc-modal.component';
import { TableProperties, ColumnWithProperties } from './table.objects';
// tslint:disable-next-line:max-line-length
import { TemplateRef, ComponentFactory, ChangeDetectorRef } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { MdPaginator, MdSort} from '@angular/material';
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


/**
 * Data source to provide what data should be rendered in the table. The observable provided
 * in connect should emit exactly the data that should be rendered by the table. If the data is
 * altered, the observable should emit that new set of data on the stream. In our case here,
 * we return a stream that contains only one set of data that doesn't change.
 */
export class SdcDataSource extends DataSource<any> {
    /** Stream that emits whenever the data has been modified. */
    dataChange: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
    get data(): any[] { return this.dataChange.value; }

    // public data: any;
    public tableLength: number = 0;
    filterChange = new BehaviorSubject('');
    get filter(): string { return this.filterChange.value; }
    set filter(filter: string) { this.filterChange.next(filter); }

    private columnDataArray: ColumnWithProperties[];

    constructor(private paginator: MdPaginator, private sort: MdSort, public changeDetectorRef: ChangeDetectorRef, private columnDataArrayInput: ColumnWithProperties[]) {
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
 