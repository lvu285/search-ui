import { Utils } from '../utils/Utils';
import _ = require('underscore');

export class Options {
  public merge<T>(provided: T): T {
    return _.extend({}, this, provided);
  }

  public mergeDeep<T>(provided: T): T {
    return _.extend({}, Utils.extendDeep(this, provided));
  }
}
