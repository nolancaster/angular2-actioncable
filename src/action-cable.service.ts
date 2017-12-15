import { Injectable } from '@angular/core'
import { Cable } from './cable';

@Injectable()
export class ActionCableService {
  private cables: {[s: string]: Cable} = {};

  /**
   * Create a new ActionCable connection to the given url
   */
  cable(url: string): Cable {
    if (!this.cables.hasOwnProperty(url)) {
      this.cables[url] = new Cable(url);
    }

    return this.cables[url];
  }

  /**
   * Disconnect from url if a connection exists
   */
  disconnect(url) {
    if (this.cables.hasOwnProperty(url)) {
      this.cables[url].disconnect();
      delete this.cables[url];
    }
  }
}