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

test('matchShortSha', function(assert){
  var string; var matches;
  //Short SHA's (7 chars)
  //
  //### Test Case 1
  string = '<p> cdc3563 f2db01c87e41d676a82cf07ca7ac5b0f1cdc3563 cdc3563" cdc3563 4d43463 cdc3563 </p>';

  matches = this.subject.matchShortSha(string);
  assert.deepEqual(['cdc3563', '4d43463'], matches);

  //### Test Case 2
  string = '<p> http://github.com/f2db01c87e41d676a82cf07ca7ac5b0f1cdc3563 4d43463 </p>';

  matches = this.subject.matchShortSha(string);
  assert.deepEqual(['4d43463'], matches);
  
  //### Test Case 3
  string = '<p>Hi there <a href="https://github.com/discorick/Projects/commit/f2db01c87e41d676a82cf07ca7ac5b0f1cdc3563" class="commit-link"><tt>f2db01c</tt></a> I need some commits db9b4c5</p>';

  matches = this.subject.matchShortSha(string);
  assert.deepEqual(['db9b4c5'], matches);
});
