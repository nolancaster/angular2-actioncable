import * as ActionCableNs from 'actioncable';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';

const ActionCable = ActionCableNs;

export class Cable {
  baseCable: any;
  private disconnectedSource: Subject<any> = new Subject();

  constructor(public url: string, public params?: any) {
    this.baseCable = ActionCable.createConsumer(this.buildUrl(url, params));

    // If a function is passed as params, re-evaluate it before attempting to reconnect
    if (params instanceof Function) {
      this.disconnected().subscribe(() => {
        this.baseCable.url = ActionCable.createWebSocketURL(this.buildUrl(url, params));
      });
    }
  }

  /**
   * Create a new subscription to a channel, optionally with topic parameters.
   */
  channel(name: string, params = {}): Channel {
    const channel = new Channel(this, name, params);
    channel.disconnected().subscribe(data => this.disconnectedSource.next(data));
    return channel;
  }

  /**
   * Emits when the WebSocket connection is closed.
   */
  disconnected(): Observable<any> {
    return this.disconnectedSource.asObservable().debounceTime(100);
  }

  /**
   * Close the connection.
   */
  disconnect(): void {
    this.baseCable.close();
  }

  protected buildUrl(url: string, params?: any): string {
    if (!params) {
      return url;
    }

    if (params instanceof Function) {
      params = params();
    }

    const paramString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    return [url, paramString].join('?');
  }
}

export class Channel {
  baseChannel: any;
  messages: Observable<any>;
  private initializedSource: Subject<any> = new Subject();
  private connectedSource: Subject<any> = new Subject();
  private disconnectedSource: Subject<any> = new Subject();
  private rejectedSource: Subject<any> = new Subject();
  private eventTypes = ['initialized', 'connected', 'disconnected', 'rejected'];

  constructor(public cable: Cable, public name: string, public params = {}) {
    const channelParams = Object.assign({}, params, {channel: name});
    this.messages = Observable.create(observer => {
      const mixin = {
        received: (data: any) => observer.next(data)
      };

      this.eventTypes.forEach(type => {
        mixin[type] = (data: any) => this[`${type}Source`].next(data)
      });

      this.baseChannel = this.cable.baseCable.subscriptions.create(channelParams, mixin);
      return () => this.unsubscribe();
    });
  }

  /**
   * Emits messages that have been broadcast to the channel.
   * For easy clean-up, when this Observable is completed the ActionCable channel will also be closed.
   */
  received(): Observable<any> {
    return this.messages;
  }

  /**
   * Emits when the subscription is initialized.
   */
  initialized(): Observable<any> {
    return this.initializedSource.asObservable();
  }

  /**
   * Emits when the subscription is ready for use on the server.
   */
  connected(): Observable<any> {
    return this.connectedSource.asObservable();
  }

  /**
   * Emits when the WebSocket connection is closed.
   */
  disconnected(): Observable<any> {
    return this.disconnectedSource.asObservable();
  }

  /**
   * Emits when the subscription is rejected by the server.
   */
  rejected(): Observable<any> {
    return this.rejectedSource.asObservable();
  }

  /**
   * Broadcast message to other clients subscribed to this channel.
   */
  send(data: any): void {
    this.baseChannel.send(data);
  }

  /**
   * Perform a channel action with the optional data passed as an attribute.
   */
  perform(action: string, data?: any): void {
    this.baseChannel.perform(action, data);
  }

  /**
   * Unsubscribe from the channel.
   */
  unsubscribe(): void {
    this.baseChannel.unsubscribe();
    this.eventTypes.forEach(type => this[`${type}Source`].complete());
  }
}
