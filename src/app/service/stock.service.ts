import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  private socket$: WebSocketSubject<any>;
  serverURL = 'https://server-production-2515.up.railway.app';
  // serverURL = 'ws://localhost:8080';

  constructor() {
    // Initialize WebSocket connection
    this.socket$ = new WebSocketSubject(this.serverURL);
  }

  /**
   * Request data for visible rows from the server.
   * @param firstRow The first row in the range.
   * @param lastRow The last row in the range.
   */
  // subscribeToData(firstRow: number, lastRow: number): void {
  //   this.socket$.next({ type: 'subscribe', firstRow, lastRow });
  // }

  /**
   * Unsubscribe from the WebSocket updates for the current viewport.
   */
  // unsubscribeFromData(): void {
  //   this.socket$.next({ type: 'unsubscribe' });
  // }

  listenForUpdates(numberOfRecords: number): Observable<any[]> {
    // this.socket$.send(JSON.stringify({ type: 'set-record-count', count: numberOfRecords }));
    // return this.socket$; // Emits messages received from the WebSocket
    this.socket$.next({
      type: 'set-record-count',
      count: numberOfRecords, // Add this field to request the number of records
    });
    return this.socket$;
  }

  /**
   * Listen for live updates from the WebSocket server.
   * @returns An observable stream of WebSocket messages.
   */
  // getStockUpdates(): Observable<any> {
  //   return this.socket$;
  // }

  /**
   * Close the WebSocket connection when the service is destroyed.
   */
  closeConnection(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}