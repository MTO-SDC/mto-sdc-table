export class TableProperties {
    accordian?: boolean;
    modal?: boolean;
    pagination?: {
        supported: boolean,
        itemsPerPage?: number,
        pageSizeOptions?: Array<number>
    };
    tableStyles?: {
      table?: Array<string>;    // Array of table styles
      row?: Array<string>;      // Array of row styles
      filter?:  Array<string>;  // Array of filter input tag styles
      pagination?: Array<string>;
    };
    events?: {
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

export class ColumnData {
    public heading?: string;
    public sortable?: boolean;
    public filterable?: boolean;
    public editable?: boolean;
    public editing?: number;
    public pipeOptions?: {
        custom?: any;
        upperCase?: boolean;
        lowerCase?: boolean;
        currency?: {param1?: string, param2?: boolean, param3?: string} | boolean;
        date?: {param1?: string} | boolean;
        percent?: {param1?: string} | boolean;
    };
    public select?: Array<{value?: any, view: string}>;
    public button?: boolean;
    public mdButton?: boolean;
    public mdRaisedButton?: boolean;
    public mdFab?: boolean;
    public mdMiniFab?: boolean;
    public modalOrDropdown?: boolean;
    public key?: string;
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
