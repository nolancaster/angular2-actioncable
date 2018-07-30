<p align="center">
  <img src='http://i.imgur.com/hicMwNW.png' alt='ng-cable logo'/>
</p>

Simple and flexible integration for ActionCable and Angular2/4/5+ applications.

## Install

```bash
npm install angular2-actioncable
```
[![npm](https://img.shields.io/badge/npm-v1.2.2-blue.svg)](https://nodei.co/npm/angular2-actioncable/)

## Usage

Use the ActionCableService to create an ActionCable consumer and subscribe to a channel.

```typescript
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ActionCableService, Channel } from 'angular2-actioncable';
import { MessageService } from './shared/messages/message.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  subscription: Subscription;

  constructor(
    private cableService: ActionCableService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    // Open a connection and obtain a reference to the channel
    const channel: Channel = this.cableService
      .cable('ws://cable.example.com')
      .channel('ChatChannel', {room : 'Best Room'});

    // Subscribe to incoming messages
    this.subscription = channel.received().subscribe(message => {
        this.messageService.notify(message);
    });
  }

  ngOnDestroy() {
    // Unsubscribing from the messages Observable automatically
    // unsubscribes from the ActionCable channel as well
    this.subscription.unsubscribe();
  }
}
```

## API

### ActionCableService
#### ``.cable(url: string, params?: any): Cable``
  Open a new ActionCable connection to the url. Any number of connections can be created.  
  If a function is supplied for the URL params, it will be reevaluated before any reconnection attempts.
####

#### ``.disconnect(url: string): void``
  Close an open connection for the url.
####

### Cable
#### ``.channel(name: string, params?: any): Channel``
  Create a new subscription to a channel, optionally with topic parameters.
####

#### ``.disconnect(): void``
  Close the connection.
####

#### ``.disconnected(): Observable<any>``
  Emits when the WebSocket connection is closed.
####

### Channel
#### ``.received(): Observable<any>``
  Emits messages that have been broadcast to the channel.  
  For easy clean-up, when this Observable is completed the ActionCable channel will also be closed.
####

#### ``.send(data: any): void``
  Broadcast message to other clients subscribed to this channel.
####

#### ``.perform(action: string, data?: any): void``
  Perform a channel action with the optional data passed as an attribute.
####

#### ``.initialized(): Observable<any>``
  Emits when the subscription is initialized.
####

#### ``.connected(): Observable<any>``
  Emits when the subscription is ready for use on the server.
####

#### ``.disconnected(): Observable<any>``
  Emits when the WebSocket connection is closed.
####

#### ``.rejected(): Observable<any>``
   Emits when the subscription is rejected by the server.
####

#### ``.unsubscribe(): void``
  Unsubscribe from the channel.
####
