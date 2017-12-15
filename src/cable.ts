import * as ActionCableNs from 'actioncable';
import { Observable } from 'rxjs/Observable';

const ActionCable = ActionCableNs;

export class Cable {
  baseCable: any;

  constructor(public url: string) {
    this.baseCable = ActionCable.createConsumer(this.url);
  }

  /**
   * Create a new subscription to a channel, optionally with topic paramters.
   */
  channel(name: string, params = {}): Channel {
    return new Channel(this, name, params);
  }

  /**
   * Close the connection.
   */
  disconnect() {
    return this.baseCable.disconnect();
  }
}

export class Channel {
  /**
   * Once a channel subscription is created, the messages Observable will emit any messages the channel receives.
   * For easy clean-up, when this Observable is completed the ActionCable channel will also be closed.
   */
  messages: Observable<any>;
  baseChannel: any;

  constructor(public cable: Cable, public name: string, public params = {}) {
    const channelParams = Object.assign({}, params, {channel: name});
    this.messages = Observable.create(observer => {
      this.baseChannel = this.cable.baseCable.subscriptions.create(channelParams, {
        received: (data: any) => observer.next(data)
      });
      return () => this.unsubscribe();
    });
  }

  /**
   * Close the connection.
   */
  send(data: any) {
    this.baseChannel.send(data);
  }

  /**
   * Close the connection.
   */
  unsubscribe() {
    this.cable.baseCable.subscriptions.remove(this.baseChannel);
  }
}
