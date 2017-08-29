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
    elevation?: boolean | string; // TODO: determine if boolean or string needed or both?
    modalOptions?: ModalOptions;
    inlineEditing?: boolean;
    export?: ExportOptions;
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
    public hoverable?: { backgroundColor: string } | false;
    public button?: boolean;
    public mdButton?: boolean;
    public mdRaisedButton?: boolean;
    public mdFab?: boolean;
    public mdMiniFab?: boolean;
    public key?: string;
    public openCustomComponent?: boolean;
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

export class ExportOptions {
    toExcel?: boolean;
    fileName?: string;
    buttonOptions?: {
        text?: string; // Text for button to display
        showText?: boolean;
        icon?: string; // Material Icon string
        showIcon?: boolean;
        position?: string; // bottom-left, bottom-right, top-left, top-right (Default: bottom-right)
        type?: string; // md-button, md-raised-button, md-fab, md-mini-fab
    };
}
