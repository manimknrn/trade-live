import { CommonModule } from "@angular/common";
import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { RouterModule } from "@angular/router";

import { AgGridAngular } from "ag-grid-angular";
import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { WebSocketSubject } from "rxjs/webSocket";
import { FormsModule } from '@angular/forms';
import { Subscription } from "rxjs";
import { StockService } from "./service/stock.service";
import { OnDestroy } from '@angular/core';
import { IViewportDatasource, IViewportDatasourceParams, RowModelType } from 'ag-grid-community';
import { ViewportRowModelModule } from "ag-grid-enterprise";

ModuleRegistry.registerModules([AllCommunityModule]);
ModuleRegistry.registerModules([ViewportRowModelModule]);

// Row Data Interface
interface IRow {
  make: string;
  model: string;
  price: number;
  electric: boolean;
}

@Component({
  standalone: true,
  imports: [AgGridAngular, RouterModule, CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnDestroy {
  public columnDefs = [
    { headerName: 'ID', field: 'id' },
    { headerName: 'Asset Name', field: 'assetName' },
    { headerName: 'Price', field: 'price' },
    { headerName: 'Last Update', field: 'lastUpdate' },
    { headerName: 'Type', field: 'type' },
  ];

  public rowHeight = 50;
  public rowModelType: RowModelType = 'viewport';
  public viewportDatasource: IViewportDatasource;

  private viewportParams!: IViewportDatasourceParams;

  constructor(private stockService: StockService) {
    this.viewportDatasource = this.createViewportDatasource();
    this.listenToStockUpdates();
  }

  /**
   * Creates a custom ViewportDatasource to handle the loading of visible rows.
   */
  private createViewportDatasource(): IViewportDatasource {
    return {
      init: (params: IViewportDatasourceParams) => {
        this.viewportParams = params;
        const totalRowCount = 1000000; // Simulating a large dataset
        params.setRowCount(totalRowCount);
      },
      setViewportRange: (firstRow: number, lastRow: number) => {
        // Fetch initial data for the visible rows
        const rowData: any = {};
        for (let rowIndex = firstRow; rowIndex <= lastRow; rowIndex++) {
          const item = {
            id: rowIndex,
            assetName: `Asset-${rowIndex}`,
            price: this.generateRandomPrice(),
            lastUpdate: new Date().toISOString(),
            type: rowIndex % 2 === 0 ? 'Type A' : 'Type B',
          };
          rowData[rowIndex] = item;
        }
        this.viewportParams.setRowData(rowData);

        // Notify the WebSocket service to subscribe to the range
        this.stockService.subscribeToData(firstRow, lastRow);
      },
      destroy: () => {
        // Unsubscribe from WebSocket updates when the viewport is destroyed
        this.stockService.unsubscribeFromData();
      },
    };
  }

  /**
   * Listens for live updates from the WebSocket service.
   */
  private listenToStockUpdates(): void {
    this.stockService.getStockUpdates().subscribe((message) => {
      if (message.type === 'update') {
        this.updatePrices(message.data);
      }
    });
  }

  /**
   * Updates the prices of rows dynamically based on WebSocket updates.
   * @param updatedData Array of updated rows from the server.
   */
  private updatePrices(updatedData: any[]): void {
    updatedData.forEach((data) => {
      const rowNode = this.viewportParams.getRow(data.id);
      if (rowNode) {
        rowNode.setData({
          ...rowNode.data,
          price: data.price,
          lastUpdate: new Date().toISOString(),
        });
      }
    });
  }

  /**
   * Generates a random price for simulation.
   */
  private generateRandomPrice(): number {
    return parseFloat((Math.random() * 100 + 1).toFixed(2));
  }

  /**
   * Clean up WebSocket connection when the component is destroyed.
   */
  ngOnDestroy(): void {
    this.stockService.closeConnection();
  }
}