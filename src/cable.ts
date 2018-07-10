import * as ActionCableNs from 'actioncable';
import { Observable } from 'rxjs/Observable';

const ActionCable = ActionCableNs;

export class Cable {
  baseCable: any;

  constructor(public url: string) {
    this.baseCable = ActionCable.createConsumer(this.url);
  }

  /**
   * Create a new subscription to a channel, optionally with topic parameters.
   */
  channel(name: string, params = {}): Channel {
    return new Channel(this, name, params);
  }

  /**
   * Close the connection.
   */
  disconnect(): void {
    this.baseCable.close();
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
   * Broadcast message to other clients subscribed to this channel.
   */
  send(data: any): void {
    this.baseChannel.send(data);
  }

  /**
   * Perform a channel action with the optional data passed as an attribute
   */
  perform(action: string, data?: any): void {
    this.baseChannel.perform(action, data);
  }

  /**
   * Unsubscribe from the channel.
   */
  unsubscribe(): void {
    this.cable.baseCable.subscriptions.remove(this.baseChannel);
  }
}
