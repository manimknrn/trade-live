import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import {
  AllCommunityModule,
  AsyncTransactionsFlushedEvent,
  CellStyleModule,
  ClientSideRowModelApiModule,
  ClientSideRowModelModule,
  ColDef,
  GetRowIdFunc,
  GetRowIdParams,
  GridApi,
  GridReadyEvent,
  HighlightChangesModule,
  ModuleRegistry,
  ValidationModule,
  ValueFormatterParams,
} from "ag-grid-community";
import { RowGroupingModule, RowGroupingPanelModule, ViewportRowModelModule } from "ag-grid-enterprise";
ModuleRegistry.registerModules([
  ClientSideRowModelApiModule,
  CellStyleModule,
  ClientSideRowModelModule,
  RowGroupingModule,
  RowGroupingPanelModule,
  HighlightChangesModule,
  ValidationModule /* Development Only */,
]);
import { LicenseManager } from 'ag-grid-enterprise';
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { StockService } from "./service/stock.service";
export const AG_GRID_LICENSE_KEY = 'Using_this_{AG_Grid}_Enterprise_key_{AG-057603}_in_excess_of_the_licence_granted_is_not_permitted___Please_report_misuse_to_legal@ag-grid.com___For_help_with_changing_this_key_please_contact_info@ag-grid.com___{Nasdaq}_is_granted_a_{Single_Application}_Developer_License_for_the_application_{Calypso}_only_for_{20}_Front-End_JavaScript_developers___All_Front-End_JavaScript_developers_working_on_{Calypso}_need_to_be_licensed___{Calypso}_has_been_granted_a_Deployment_License_Add-on_for_{Unlimited}_Production_Environments___This_key_works_with_{AG_Grid}_Enterprise_versions_released_before_{29_June_2025}____[v3]_[01]_MTc1MTE1MTYwMDAwMA==fe9f06a7f30283b78dc3be500b18b0ac';

ModuleRegistry.registerModules([AllCommunityModule]);
ModuleRegistry.registerModules([ViewportRowModelModule]);
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [AgGridAngular, RouterModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {

  constructor(readonly webSocketService: StockService) {
    LicenseManager.setLicenseKey(AG_GRID_LICENSE_KEY);
  }
  private gridApi!: GridApi;
  numberOfRecords: number = 500;
  totalRecords: number = 0;
  statistics: any;
  isDialogOpen = false;

  public columnDefs: ColDef[] = [
    // these are the row groups, so they are all hidden (they are show in the group column)
    {
      headerName: "Product",
      field: "product",
      enableRowGroup: false,
      rowGroupIndex: 0,
      hide: true,
    },
    // {
    //   headerName: "Portfolio",
    //   field: "portfolio",
    //   enableRowGroup: false,
    //   // rowGroupIndex: 1,
    //   hide: false,
    // },
    // {
    //   headerName: "Book",
    //   field: "book",
    //   enableRowGroup: false,
    //   // rowGroupIndex: 2,
    //   hide: false,
    // },
    {
      headerName: "Trade",
      field: "trade",
      width: 100,
      aggFunc: "min",
      enableValue: true,
      cellClass: "number",
      valueFormatter: numberCellFormatter,
      cellRenderer: "agAnimateShowChangeCellRenderer",
    },
    // all the other columns (visible and not grouped)
    {
      headerName: "Current",
      field: "current",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
      cellClass: "number",
      valueFormatter: numberCellFormatter,
      cellRenderer: "agAnimateShowChangeCellRenderer",
    },
    {
      headerName: "Previous",
      field: "previous",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
      cellClass: "number",
      valueFormatter: numberCellFormatter,
      cellRenderer: "agAnimateShowChangeCellRenderer",
    },
    {
      headerName: "Deal Type",
      field: "dealType",
      enableRowGroup: true,
    },
    {
      headerName: "Bid",
      field: "bidFlag",
      enableRowGroup: true,
      width: 100,
    },
    {
      headerName: "PL 1",
      field: "pl1",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
      cellClass: "number",
      valueFormatter: numberCellFormatter,
      cellRenderer: "agAnimateShowChangeCellRenderer",
    },
    {
      headerName: "PL 2",
      field: "pl2",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
      cellClass: "number",
      valueFormatter: numberCellFormatter,
      cellRenderer: "agAnimateShowChangeCellRenderer",
    },
    {
      headerName: "Gain-DX",
      field: "gainDx",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
      cellClass: "number",
      valueFormatter: numberCellFormatter,
      cellRenderer: "agAnimateShowChangeCellRenderer",
    },
    {
      headerName: "SX / PX",
      field: "sxPx",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
      cellClass: "number",
      valueFormatter: numberCellFormatter,
      cellRenderer: "agAnimateShowChangeCellRenderer",
    },
    {
      headerName: "99 Out",
      field: "_99Out",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
      cellClass: "number",
      valueFormatter: numberCellFormatter,
      cellRenderer: "agAnimateShowChangeCellRenderer",
    },
    {
      headerName: "Submitter ID",
      field: "submitterID",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
      cellClass: "number",
      valueFormatter: numberCellFormatter,
      cellRenderer: "agAnimateShowChangeCellRenderer",
    },
    {
      headerName: "Submitted Deal ID",
      field: "submitterDealID",
      width: 200,
      aggFunc: "sum",
      enableValue: true,
      cellClass: "number",
      valueFormatter: numberCellFormatter,
      cellRenderer: "agAnimateShowChangeCellRenderer",
    },
  ];
  public rowGroupPanelShow: "always" | "onlyWhenGrouping" | "never" = "always";
  public asyncTransactionWaitMillis = 4000;
  public getRowId: GetRowIdFunc = (params: GetRowIdParams) =>
    String(params.data.trade);
  public defaultColDef: ColDef = {
    width: 120,
  };
  public autoGroupColumnDef: ColDef = {
    width: 250,
  };
  public rowData!: any[];

  onAsyncTransactionsFlushed(e: AsyncTransactionsFlushedEvent) {
    console.log(
      "========== onAsyncTransactionsFlushed: applied " +
      e.results.length +
      " transactions",
    );
  }

  onFlushTransactions() {
    this.gridApi.flushAsyncTransactions();
  }

  updateRecords(): void {

    // Request records from the server
    // this.webSocketService.listenForUpdates(this.numberOfRecords);
    this.statistics.liveUpdatesReceived = 0;
    this.subscribeToUpdate()
  }

  openDialog() {
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;

    this.statistics = {
      totalRecordsReceived: 0,
      totalUpdatesApplied: 0,
      lastUpdateTimestamp: null,
      lastFiveUpdateDifferences: [] as number[], // Array to store time differences
      lastFiveUpdateTimestamps: [] as string[], // For display
      liveUpdatesReceived: 0, // Track the number of live updates received
    };

    console.log('service time: ', this.webSocketService.receiveTime);

    this.subscribeToUpdate();
  }

  subscribeToUpdate() {
    this.webSocketService.listenForUpdates(this.numberOfRecords).subscribe((message: any) => {
      if (!this.gridApi) {
        console.error('Grid API is not ready yet.');
        return;
      }

      this.totalRecords = message.data.length;

      // Capture the current timestamp
      const currentTimestamp = new Date();

      this.statistics.totalRecordsReceived = message.data.length;
      this.statistics.lastUpdateTimestamp = currentTimestamp.toLocaleTimeString();

      // Calculate and store time difference for the last 5 updates
      if (this.statistics.lastFiveUpdateTimestamps.length > 0) {
        const previousTimestamp = new Date(
          this.statistics.lastFiveUpdateTimestamps[this.statistics.lastFiveUpdateTimestamps.length - 1]
        );
        const timeDifferenceInSeconds = Math.round((currentTimestamp.getTime() - previousTimestamp.getTime()) / 1000);
        this.statistics.lastFiveUpdateDifferences.push(timeDifferenceInSeconds);

        // Keep only the last 5 differences
        if (this.statistics.lastFiveUpdateDifferences.length > 5) {
          this.statistics.lastFiveUpdateDifferences.shift();
        }
      }

      // Add the current timestamp to the list
      this.statistics.lastFiveUpdateTimestamps.push(currentTimestamp.toISOString());
      if (this.statistics.lastFiveUpdateTimestamps.length > 5) {
        this.statistics.lastFiveUpdateTimestamps.shift();
      }

      // Update the statistics
    this.statistics.liveUpdatesReceived++;
    const maxLiveUpdates = this.numberOfRecords; 
    if (this.statistics.liveUpdatesReceived >= maxLiveUpdates) {
      console.log('Maximum number of live updates received. Closing connection...');
      this.webSocketService.closeConnection();
    }

      // this.totalRecords = params.api.getDisplayedRowCount();
      if (message.type === 'initial') {
        // Set the initial data
        this.rowData = message.data;
        this.gridApi.setGridOption("rowData", this.rowData);
        this.gridApi.setGridOption("grandTotalRow", 'bottom');
      } else if (message.type === 'update') {
        // Apply updates to the grid
        const updates = message.data;
        const validUpdates = updates.filter((update: any) =>
          this.rowData.some(row => row.trade === update.trade)
        );

        if (validUpdates.length) {
          this.statistics.totalUpdatesApplied += validUpdates.length;
          this.gridApi.applyTransaction({ update: validUpdates });
        } else {
          this.statistics.totalUpdatesApplied += message.data.length;
          this.gridApi.setGridOption("rowData", message.data);
        }
      }

      // if (this.statistics.totalRecordsReceived >= this.numberOfRecords) {
      //   // this.subscription.unsubscribe();  // Stop listening after the required records are received
      //   this.webSocketService.closeConnection();
      // }
    });
  }
}

function numberCellFormatter(params: ValueFormatterParams) {
  return Math.floor(params.value)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

