import * as ActionCableNs from 'actioncable';
import { Observable } from 'rxjs/Observable';

const ActionCable = ActionCableNs;

export class Cable {
  baseCable: any;
  channels: Channel[] = [];

  constructor(public url: string) {
    this.baseCable = ActionCable.createConsumer(this.url);
  }

  /**
   * Create a subscription to a channel or return the existing one
   */
  channel(name: string, params = {}): Channel {
    return new Channel(this, name, params);
  }

  disconnect() {
    return this.baseCable.disconnect();
  }
}

export class Channel {
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

  send(data: any) {
    this.baseChannel.send(data);
  }

  unsubscribe() {
    this.cable.baseCable.subscriptions.remove(this.baseChannel);
  }
}
