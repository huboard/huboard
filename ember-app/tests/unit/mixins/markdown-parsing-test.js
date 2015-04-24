import Ember from 'ember';
import MarkdownParsingMixin from 'app/mixins/markdown-parsing';

import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('mixin:markdown-parsing', 'MarkdownParsingMixin', {
  setup: function(){
    this.subject = Ember.Object.
      createWithMixins(MarkdownParsingMixin, {});
  }
});

test('Dummy Test', function(assert){
  assert.equal(1,1);
});
