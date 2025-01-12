import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  private socket$: WebSocketSubject<any>;

  constructor() {
    // Initialize WebSocket connection
    this.socket$ = new WebSocketSubject('ws://localhost:3000');
  }

  /**
   * Request data for visible rows from the server.
   * @param firstRow The first row in the range.
   * @param lastRow The last row in the range.
   */
  subscribeToData(firstRow: number, lastRow: number): void {
    this.socket$.next({ type: 'subscribe', firstRow, lastRow });
  }

  /**
   * Unsubscribe from the WebSocket updates for the current viewport.
   */
  unsubscribeFromData(): void {
    this.socket$.next({ type: 'unsubscribe' });
  }

  /**
   * Listen for live updates from the WebSocket server.
   * @returns An observable stream of WebSocket messages.
   */
  getStockUpdates(): Observable<any> {
    return this.socket$;
  }

  /**
   * Close the WebSocket connection when the service is destroyed.
   */
  closeConnection(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}