// Last commit: 0ba0d24 (2013-11-06 10:53:04 -0500)


(function() {
var metricsCalculationElement = null,
    // A list of all of the style properties
    // to copy over to our example element
    layoutStyles = [
      'maxWidth',
      'maxHeight',
      'paddingLeft',
      'paddingRight',
      'paddingTop',
      'paddingBottom',
      'borderLeftStyle',
      'borderRightStyle',
      'borderTopStyle',
      'borderBottomStyle',
      'borderLeftWidth',
      'borderRightWidth',
      'borderTopWidth',
      'borderBottomWidth',
      'fontFamily',
      'fontSize',
      'fontWeight',
      'fontVariant',
      'lineHeight',
      'whiteSpace',
      'letterSpacing',
      'wordWrap',
      'boxSizing',
      'MozBoxSizing',
      'textTransform',
      'textRendering',
      // Font feature settings
      'webkitFontFeatureSettings',
      'mozFontFeatureSettings',
      'msFontFeatureSettings',
      'oFontFeatureSettings',
      'fontFeatureSettings'
    ],
    defaultBoxSizing;

/**
  Return the computed styles for a given element.

  TODO: Cache the last used element's computed style
        properties so they don't have to be fetched again.

  @private
 */
function computedStylesFor(element) {
  // Retrieve the computed style of the element
  var styles;
  if (document.defaultView && document.defaultView.getComputedStyle) {
    styles = document.defaultView.getComputedStyle(element, null);
  } else {
    styles = element.currentStyle;
  }

  return styles;
};

/**
  Detect the browser's default box sizing.
  This should detect old IE quirks and then
  provide the correct box model when detecting
  per-element box-sizing.

  @private
 */
var detectDefaultBoxSizing = function () {
  var tester    = document.createElement('div'),
      boxSizing;

  document.body.appendChild(tester);
  tester.style.cssText = 'width:24px; padding:10px; border:2px solid #000;' +
                         'box-sizing:content-box; -moz-box-sizing:content-box;';

  switch (tester.offsetWidth) {
  case 24:
    boxSizing = 'border-box';
    break;
  case 44:
    boxSizing = 'padding-box';
    break;
  case 48:
    boxSizing = 'content-box';
    break;
  }

  document.body.removeChild(tester);
  return boxSizing;
};

/**
  @private
  @return {String} The box sizing of the current element
 */
var boxSizingOf = function (element) {
  // Detect the browser's default box sizing model
  if (defaultBoxSizing == null) {
    defaultBoxSizing = detectDefaultBoxSizing();
  }

  var styles = computedStylesFor(element);
  return styles.boxSizing       ||
         styles.webkitBoxSizing ||
         styles.MozBoxSizing    ||
         styles.msBoxSizing     ||
         styles.oBoxSizing      ||
         defaultBoxSizing;
};

/**
  @private
  @returns {Number|String} Returns a normalized margin so it's a number or 'auto'.
 */
var normalizeMargin = function (margin) {
  if (margin !== 'auto') {
    return parseInt(margin, 10);
  }
  return margin;
};

/**
  Computes the layout of an element that matches
  the inspector properties of the DOM element.

  @method layoutOf
  @for Ember.Metrics
  @static
  @param element {DOMELement} The element to compute the layout of.
  @return {Object} Layout properties of the element
 */
function layoutOf(element) {
  // Handle window
  if ((window.Window && element instanceof Window) || // Standards
      element === window) {                           // Safari 5.1
    var dimensions = {
          width:  element.innerWidth,
          height: element.innerHeight
        },
        dimensionsWithChrome = {
          width:  element.outerWidth,
          height: element.outerHeight
        };

    // IE<8 doesn't support window.innerWidth / window.outerWidth

    return {
      width:     element.innerWidth,
      height:    element.innerHeight,
      boxSizing: null,
      content: dimensions,
      borders: dimensions,
      margins: dimensionsWithChrome
    };
  }

  // Handle document
  if ((window.Document && element instanceof Document) || // Standards
      element === document) {                             // old IE
    var dimensions = {
      width:  Math.max(
        element.body.scrollWidth, element.documentElement.scrollWidth,
        element.body.offsetWidth, element.documentElement.offsetWidth,
        element.body.clientWidth, element.documentElement.clientWidth
      ),
      height: Math.max(
        element.body.scrollHeight, element.documentElement.scrollHeight,
        element.body.offsetHeight, element.documentElement.offsetHeight,
        element.body.clientHeight, element.documentElement.clientHeight
      )
    };

    // The document has no chrome
    return {
      width:    dimensions.width,
      height:   dimensions.height,
      boxSizing: null,
      content: dimensions,
      borders: dimensions,
      margins: dimensions
    };
  }

  var boxSizing = boxSizingOf(element),
      content = {
        width:  element.offsetWidth,
        height: element.offsetHeight
      },
      styles = computedStylesFor(element),
      layout = {
        width:     null,
        height:    null,
        boxSizing: boxSizing,
        content:   {},
        padding:   {},
        borders:   {},
        margins:   {}
      },
      padding = {
        top:    parseInt(styles.paddingTop,        10),
        right:  parseInt(styles.paddingRight,      10),
        bottom: parseInt(styles.paddingBottom,     10),
        left:   parseInt(styles.paddingLeft,       10)
      },
      borders = {
        top:    parseInt(styles.borderTopWidth,    10),
        right:  parseInt(styles.borderRightWidth,  10),
        bottom: parseInt(styles.borderBottomWidth, 10),
        left:   parseInt(styles.borderLeftWidth,   10)
      },
      margins = {
        top:    normalizeMargin(styles.marginTop),
        right:  normalizeMargin(styles.marginRight),
        bottom: normalizeMargin(styles.marginBottom),
        left:   normalizeMargin(styles.marginLeft)
      };

  // Normalize the width and height so
  // they refer to the content
  content.width  -= borders.right + borders.left +
                    padding.right + padding.left;
  content.height -= borders.top + borders.bottom +
                    padding.top + padding.bottom;
  layout.content = content;

  padding.width  = content.width +
                   padding.left + padding.right;
  padding.height = content.height +
                   padding.top + padding.bottom;
  layout.padding = padding;

  borders.width  = padding.width +
                   borders.left + borders.right;
  borders.height = padding.height +
                   borders.top + borders.bottom;
  layout.borders = borders;

  // Provide the "true" width and height
  // of the box in terms of the current box model
  switch (boxSizing) {
  case 'border-box':
    layout.width  = borders.width;
    layout.height = borders.height;
    break;
  case 'padding-box':
    layout.width  = padding.width;
    layout.height = padding.height;
    break;
  default:
    layout.width  = content.width;
    layout.height = content.height;
  }

  if (margins.left !== 'auto' && margins.right !== 'auto') {
    margins.width = borders.width +
                    margins.left + margins.right;
  } else {
    margins.width = 'auto';
  }

  if (margins.top !== 'auto' && margins.bottom !== 'auto') {
    margins.height = borders.height +
                     margins.top + margins.bottom;
  } else {
    margins.height = 'auto';
  }
  layout.margins = margins;

  return layout;
};

/**
  Prepare for measuring the layout of a string.

  @method prepareStringMeasurement
  @for Ember.Metrics
  @static
  @param exampleElement {DOMElement}
    A DOM element to use as a template for measuring a string in.
  @param additionalStyles {Object}
    Additional styles to apply to the calculation element.
 */
function prepareStringMeasurement(exampleElement, additionalStyles) {
  var element = metricsCalculationElement;

  if (additionalStyles == null) {
    additionalStyles = {};
  }

  if (metricsCalculationElement == null) {
    var parent = document.createElement('div');
    parent.style.cssText = "position:absolute; left:-10010px; top:-10px;" +
                           "width:10000px; height:0px; overflow:hidden;" +
                           "visibility:hidden;";

    element = metricsCalculationElement = document.createElement('div');

    parent.appendChild(metricsCalculationElement);
    document.body.insertBefore(parent, null);
  }

  // Retrieve the computed style of the element
  var styles = computedStylesFor(exampleElement);

  // Iterate through the styles that we care about for layout
  // and apply them to the element
  for (var i = 0, len = layoutStyles.length; i < len; i++) {
    var style = layoutStyles[i],
        value = styles[style];
    element.style[style] = value;
  }

  // Explicitly set the `font` property for Mozilla
  var font = "";
  if (styles.font === "") {
    if (styles.fontStyle)   font += styles.fontStyle   + " ";
    if (styles.fontVariant) font += styles.fontVariant + " ";
    if (styles.fontWeight)  font += styles.fontWeight  + " ";
    if (styles.fontSize)    font += styles.fontSize    + " ";
    else                    font += "10px";
    if (styles.lineHeight)  font += "/" + styles.lineHeight;

    font += " ";
    if (styles.fontFamily)  font += styles.fontFamily;
    else                    font += "sans-serif";

    element.style.font = font;
  }

  Ember.mixin(element.style, {
    position: "absolute",
    top:    "0px",
    right:  "auto",
    bottom: "auto",
    left:   "0px",
    width:  "auto",
    height: "auto"
  }, additionalStyles);
};

/**
  Cleanup properties used by `measureString`
  setup in `prepareStringMeasurement`.

  @for Ember.Metrics
  @static
  @method teardownStringMeasurement
 */
function teardownStringMeasurement() {
  // Remove any leftover styling from string measurements
  if (metricsCalculationElement) {
    metricsCalculationElement.innerHTML = "";
    metricsCalculationElement.className = "";
    metricsCalculationElement.setAttribute('style', '');
  }
};

/**
  Measures a string given the styles applied
  when setting up string measurements.

  @for Ember.Metrics
  @static
  @method measureString
  @param string {String} The string to measure
  @param ignoreEscape {Boolean} Whether the string should be escaped.
  @return {Object} The layout of the string passed in.
 */
function measureString(string, ignoreEscape) {
  var element = metricsCalculationElement;

  if (ignoreEscape) {
    element.innerHTML = string;

  // Escape the string by entering it as
  // a text node to the DOM element
  } else if (Ember.typeOf(element.innerText) !== "undefined") {
    element.innerText = string;
  } else {
    element.textContent = string;
  }

  // Trigger a repaint so the height and width are correct
  // Webkit / Blink needs this to trigger a reflow
  element.style.overflow = 'visible';
  element.style.overflow = 'hidden';

  return layoutOf(element);
};

Ember.Metrics = {
  prepareStringMeasurement:  prepareStringMeasurement,
  teardownStringMeasurement: teardownStringMeasurement,
  measureString:             measureString,
  layoutOf:                  layoutOf
};

})();



(function() {

})();



(function() {
/**
  This mixin provides common functionality for automatically
  resizing view depending on the contents of the view. To
  make your view resize, you need to set the `autoresize`
  property to `true`, and let the mixin know whether it
  can resize the height of width.

  In addition, `autoResizeText` is a required property for
  this mixin. It is already provided for `Em.TextField` and
  `Em.TextArea`.

  @class AutoResize
  @namespace Ember
  @extends Ember.Mixin
  @since Ember 1.0.0-rc3
 */
Ember.AutoResize = Ember.Mixin.create(/** @scope Ember.AutoResize.prototype */{

  /**
    Add `ember-auto-resize` so additional
    styling can be applied indicating that
    the text field will automatically resize.

    @property classNameBindings
   */
  classNameBindings: ['autoresize:ember-auto-resize'],

  /**
    Whether the view using this mixin should
    autoresize it's contents. To enable autoresizing
    using the view's default resizing, set
    the attribute in your template.

    ```handlebars
    {{view Ember.TextField autoresize=true}}
    ```

    @property autoresize
    @type Boolean
    @default false
   */
  autoresize: false,

  /**
    When the auto resize mixin is activated,
    trigger an initial measurement, which
    should layout the text fields properly.

    @private
   */
  init: function () {
    this._super();
    if (this.get('autoresize')) {
      this.scheduleMeasurement();
    }
  },

  /**
    The current dimensions of the view being
    resized in terms of an object hash that
    includes a `width` and `height` property.

    @property dimensions
    @default null
    @type Object
   */
  dimensions: null,

  /**
    Whether the auto resize mixin should resize
    the width of this view.

    @property shouldResizeWidth
    @default false
    @type Boolean
   */
  shouldResizeWidth: false,

  /**
    Whether the auto resize mixin should resize
    the height of this view.

    @property shouldResizeHeight
    @default false
    @type Boolean
   */
  shouldResizeHeight: false,

  /**
    If set, this property will dictate how much
    the view is allowed to resize horizontally
    until it either falls back to scrolling or
    resizing vertically.

    @property maxWidth
    @default null
    @type Number
   */
  maxWidth: null,

  /**
    If set, this property dictates how much
    the view is allowed to resize vertically.
    If this is not set and the view is allowed
    to resize vertically, it will do so infinitely.

    @property maxHeight
    @default null
    @type Number
   */
  maxHeight: null,

  /**
    A required property that should alias the
    property that should trigger recalculating
    the dimensions of the view.

    @property autoResizeText
    @required
    @type String
   */
  autoResizeText: Ember.required(),

  /**
    Whether the autoResizeText has been sanitized
    and should be treated as HTML.

    @property ignoreEscape
    @default false
    @type Boolean
   */
  ignoreEscape: false,

  /**
    Whether whitespace should be treated as significant
    contrary to any styles on the view.

    @property significantWhitespace
    @default false
    @type Boolean
   */
  significantWhitespace: false,

  /**
    Schedule measuring the view's size.
    This happens automatically when the
    `autoResizeText` property changes.

    @method scheduleMeasurement
   */
  scheduleMeasurement: function () {
    if (this.get('autoresize')) {
      Ember.run.once(this, 'measureSize');
    }
  }.observes('autoResizeText'),

  /**
    Measures the size of the text of the element.

    @method measureSize
   */
  measureSize: function () {
    var text = this.get('autoResizeText'),
        size;

    if (!Ember.isEmpty(text) && !this.get('isDestroying')) {
      // Provide extra styles that will restrict
      // width / height growth
      var styles  = {},
          element = this.$()[0];

      if (this.get('shouldResizeWidth')) {
        if (this.get('maxWidth') != null) {
          styles.maxWidth = this.get('maxWidth') + "px";
        }
      } else {
        styles.maxWidth = Ember.Metrics.layoutOf(element).width + "px";
      }

      if (this.get('shouldResizeHeight')) {
        if (this.get('maxHeight') != null) {
          styles.maxHeight = this.get('maxHeight') + "px";
        }
      } else {
        styles.maxHeight = Ember.Metrics.layoutOf(element).height + "px";
      }

      // Force white-space to pre-wrap to make
      // whitespace significant
      if (this.get('significantWhitespace')) {
        styles.whiteSpace = 'pre-wrap';
      }

      Ember.Metrics.prepareStringMeasurement(element, styles);
      size = Ember.Metrics.measureString(text, this.get('ignoreEscape'));
      Ember.Metrics.teardownStringMeasurement();
    } else {
      size = { width: 0, height: 0 };
    }

    this.set('measuredSize', size);
  },

  /**
    Alter the `dimensions` property of the
    view to conform to the measured size of
    the view.

    @method measuredSizeDidChange
   */
  measuredSizeDidChange: function () {
    var size      = this.get('measuredSize'),
        maxWidth  = this.get('maxWidth'),
        maxHeight = this.get('maxHeight'),
        layoutDidChange = false,
        dimensions = {};

    if (this.get('shouldResizeWidth')) {
      // Account for off-by-one error in FireFox
      // (specifically, input elements have 1px
      //  of scroll when this isn't applied)
      // TODO: sniff for this bug and fix it!
      size.width += 1;

      if (maxWidth != null &&
          size.width > maxWidth) {
        dimensions.width = maxWidth;
      } else {
        dimensions.width = size.width;
      }
      layoutDidChange = true;
    }

    if (this.get('shouldResizeHeight')) {
      if (maxHeight != null &&
          size.height > maxHeight) {
        dimensions.height = maxHeight;
      } else {
        dimensions.height = size.height;
      }
      layoutDidChange = true;
    }

    this.set('dimensions', dimensions);

    if (layoutDidChange) {
      Ember.run.scheduleOnce('render', this, this.dimensionsDidChange);
    }
  }.observes('measuredSize'),

  /**
    Retiles the view at the end of the render queue.
    @method dimensionsDidChange
   */
  dimensionsDidChange: function () {
    var dimensions = this.get('dimensions'),
        styles = {};

    for (var key in dimensions) {
      if (dimensions.hasOwnProperty(key) &&
          key != null) {
        styles[key] = dimensions[key] + 'px';
      }
    }

    var $element = this.$();
    if ($element) {
      $element.css(styles);
    }
  }

});


/**
  @namespace Ember
  @class TextField
 */
Ember.TextField.reopen(Ember.AutoResize, /** @scope Ember.TextField.prototype */{

  /**
    By default, text fields only
    resize their width.

    @property shouldResizeWidth
    @default true
    @type Boolean
   */
  shouldResizeWidth: true,

  /**
    Whitespace should be treated as significant
    for text fields.

    @property significantWhitespace
    @default true
    @type Boolean
   */
  significantWhitespace: true,

  /**
    This provides a single character
    so users can click into an empty
    text field without it being too small

    @property autoResizeText
    @type String
   */
  autoResizeText: function () {
    var value = this.get('value');
    return Ember.isEmpty(value) ? '.' : value;
  }.property('value')

});

/**
  @namespace Ember
  @class TextArea
 */
Ember.TextArea.reopen(Ember.AutoResize, /** @scope Ember.TextArea.prototype */{

  /**
    By default, textareas only resize
    their height.

    @property shouldResizeHeight
    @type Boolean
   */
  shouldResizeHeight: true,

  /**
    Whitespace should be treated as significant
    for text areas.

    @property significantWhitespace
    @default true
    @type Boolean
   */
  significantWhitespace: true,

  /**
    Optimistically resize the height
    of the textarea so when users reach
    the end of a line, they will be
    presented with space to begin typing.

    @property autoResizeText
    @type String
   */
  autoResizeText: function () {
    var value = this.get('value');
    if (Ember.isNone(value)) {
      value = '';
    }
    return value + '@';
  }.property('value')

});

})();



(function() {

})();



(function() {
/**
  Ember AutoResize

  @module ember
  @submodule ember-autoresize
  @requires ember-views
 */

})();

