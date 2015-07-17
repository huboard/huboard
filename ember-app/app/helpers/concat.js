import Ember from 'ember';

export function conCat(params=[], hash={}) {
    let glue = hash.delimiter || '';
      return params.join(glue);
}

export default Ember.HTMLBars.makeBoundHelper(conCat);
