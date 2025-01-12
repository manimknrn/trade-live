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
  receiveTime = new Date().toLocaleTimeString();

  constructor() {
    // Initialize WebSocket connection
    this.socket$ = new WebSocketSubject(this.serverURL);
  }

  listenForUpdates(numberOfRecords: number): Observable<any> {
    // this.socket$.send(JSON.stringify({ type: 'set-record-count', count: numberOfRecords }));
    // return this.socket$; // Emits messages received from the WebSocket
    this.socket$.next({
      type: 'set-record-count',
      count: numberOfRecords, // Add this field to request the number of records
    });
    this.receiveTime = new Date().toLocaleTimeString();
    return this.socket$;
    // return this.socket$.pipe(
    //   map((message) => {
    //     const receiveTime = new Date().toLocaleTimeString();
    //     return { data: message, time: receiveTime }; // Including timestamp with each update
    //   })
    // );
  }

  /**
   * Close the WebSocket connection when the service is destroyed.
   */
  closeConnection(): void {
    this.socket$.next({ type: 'disconnect' });
    // if (this.socket$) {
    //   this.socket$.unsubscribe();
    // }
  }
}