import * as ActionCableNs from 'actioncable';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

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
    let channel = this.findChannel(name, params);
    if (!channel) {
      channel = new Channel(this, name, params);
    }
    return channel
  }

  findChannel(name: string, params = {}) {
    return this.channels.find(channel => channel.isFor(name, params));
  }

  disconnect() {
    return this.baseCable.disconnect();
  }
}

export class Channel {
  private source: Subject<any> = new Subject();
  messages: Observable<any> = this.source.asObservable();
  baseChannel: any;

  constructor(public cable: Cable, public name: string, public params = {}) {
    const channelParams = Object.assign({}, params, {channel: name});
    this.baseChannel = this.cable.baseCable.subscriptions.create(channelParams, {
      received: (data: any) => this.source.next(data)
    });
  }

  send(data: any) {
    this.baseChannel.send(data);
  }

  unsubscribe() {
    this.cable.baseCable.subscriptions.remove(this.baseChannel);
    this.source.complete();
  }

  isFor(name: string, params = {}) {
    if (this.name !== name) {
      return false;
    }

    const theseParams = Object.getOwnPropertyNames(this.params);
    const thoseParams = Object.getOwnPropertyNames(params);

    if (theseParams.length !== thoseParams.length) {
      return false;
    }

    for (const param of theseParams) {
      if (theseParams[param] !== thoseParams[param]) {
        return false;
      }
    }

    return true;
  }
}
