(function() {
  
  var Backbone = this.Backbone;
  var $ = this.jQuery || this.$;
  var _ = this._;
  
  function isViewLike(view) {
    if (typeof view.render != 'function' || typeof view.remove != 'function') 
      throw('Layout objects require "render" and "remove" methods');
    return true;
  }
  
  function isCollection(collection) {
    return collection instanceof Backbone.Collection;
  }
  
  function resolveViewSelector(view, selector) {
    if (!selector) return view.$el;
    if (selector instanceof $) return selector;
    return view.$(selector);
  }
  
  // Display Region
  // --------------
  // Manages the display of a single subview within a container.
  // Also manages an optional "state" value used to describe the region state.
  function RegionLayout(selector, options) {
    this.$el = $(selector).empty();
  };

  RegionLayout.prototype = {
    state: null,
    view: null,
    
    // Opens a new view instance into the region:
    // Any existing view is closed, then the new view is rendered and added.
    // Optionally, non-view display may be opened as raw HTML.
    open: function(view, state) {
      this.close();
      this.state = state || null;
      
      if (isViewLike(view)) {
        view.render();
        this.view = view;
        this.$el.append(view.$el);
      }
      return this;
    },

    // Closes the existing view:
    // view is removed, references cleared, and state reset.
    close: function() {
      if (this.view) {
        this.view.remove();
        this.view = this.state = null;
      }
      return this;
    },
    
    // Rerenders the view:
    render: function() {
      if (this.view) {
        this.view.render();
      }
      return this;
    },
    
    // Removes the region layout by closing its content and dereferencing container:
    remove: function() {
      this.close();
      this.$el = null;
      return this;
    }
  };

  // Display List
  // ------------
  // Manages the display of a list of models and their views
  function ListLayout(selector, options) {
    this.$el = $(selector).empty();
    this.views = [];
  };

  ListLayout.prototype = {
    models: null,
    views: null,
    viewClass: null,
    
    // Default filter method used to render the list:
    filter: function(model) {
      return true;
    },
    
    // Default sort function used while rendering the list:
    sort: null,
    
    open: function(View, collection, filter, sort) {
      
    },
    
    close: function() {
      this.$el.empty();
      _.invoke(this.views, 'remove');
      this.views.length = 0;
      return this;
    },
    
    // Renders a collection of views into the list:
    render: function(collection, ViewClass, filter, sort) {
      this.close();
      
      var list = document.createDocumentFragment();
      
      // Default the filter function to the instance filter member:
      if (!_.isFunction(filter)) filter = this.filter;

      // Loop through collection and render all models that pass the filter:
      collection.each(function(model, index) {
        if (filter(model, index)) {
          var view = new ViewClass({model: model});
          this.views.push(view);
          view.render();
          list.appendChild(view.el);
        }
      }, this);

      this.$el.append(list);
      return this;
    },

    // Adds a one-off view onto the end of the list:
    append: function(view) {
      view.render();
      this.views.push(view);
      this.$el.append(view.$el);
      return this;
    },

    remove: function() {
      this.close();
      this.$el =
        this.models =
        this.views =
        this.viewClass = null;
      return this;
    }
  };
  
  // Finite State Renderer
  // ---------------------
  // Manages a collection of views, only showing one at a time based on current state.
  function FiniteStateLayout(selector, options) {
    this.$el = $(selector).empty();
    this._s = {};
    this.config(options);
  }
  
  FiniteStateLayout.prototype = {
    view: null,
    state: null,
    
    config: function(options) {
      
    },
    
    addState: function(key, ViewClass) {
      this._s[key] = ViewClass;
      this.render();
    },
    
    state: function(state) {
      if (state !== undefined && state !== this.state && this._s[state]) {
        this.state = state;
        this.render();
      }
      return this.state;
    },
    
    render: function() {
      this.empty();
      if (this._s[this.state]) {
        this.view = new this._s[this.state]();
        this.view.render();
        this.$el.append(this.view.$el);
      }
    },
    
    empty: function() {
      if (this.view) {
        this.view.remove();
        this.view = this.state = null;
      }
      return this;
    },
    
    remove: function() {
      this.empty();
    }
  };
  
  
  // ViewKit Backbone Extension
  // --------------------------
  var ViewKit = Backbone.ViewKit = Backbone.View.extend({
    _vk: function() {
      return this.__vk || (this.__vk = []);
    },
    
    // Inserts a subview by replacing the targeted selector element:
    replaceSubview: function(view, selector) {
      this.addLayout(view).render();
      resolveViewSelector(this, selector).replaceWith(view.$el);
      return view;
    },

    // Appends a new subview to the targeted selector element:
    appendSubview: function(view, selector) {
      this.addLayout(view).render();
      resolveViewSelector(this, selector).append(view.$el);
      return view;
    },

    // Adds a removable element to the layout cache:
    // Layout elements MUST implement a "remove" method.
    // all added layout is automatically removed along with the managing view instance.
    // @param item: a removable item (View or Region instance)
    addLayout: function(item) {
      if (isViewLike(item)) {
        this._vk().push(item);
      }
      return item;
    },

    // Removes a single layout item from the cache, or all existing layout:
    removeLayout: function(item) {
      var cache = this._vk();
      
      if (item) {
        // Remove a single provided layout item:
        var i = _.indexOf(cache, item);
        _.isFunction(item.remove) && item.remove();
        if (i >= 0) cache.splice(i, 1);
        
      } else {
        // Remove all layout items:
        _.invoke(cache, 'remove');
        cache.length = 0;
      }
      return this;
    },
    
    // Removes the view and all of its managed layout:
    remove: function() {
      var result = Backbone.View.prototype.remove.apply(this, arguments);
      this.removeLayout();
      return result;
    }
  });
  
  var layoutAPI = {
    'createRegion': RegionLayout,
    'createList': ListLayout
  };
  
  _.each(layoutAPI, function(LayoutClass, methodName) {
    // Add static method for creating a new layout element:
    ViewKit[methodName] = function(selector) {
      return new LayoutClass(selector);
    };
    
    // Add instance method for creating a layout element within the instance:
    ViewKit.prototype[methodName] = function(selector) {
      var $container = resolveViewSelector(this, selector);
      return this.addLayout(ViewKit[methodName]($container));
    };
  });
  
  // Mixin utility for applying ViewKit behavior to other view classes:
  // Application methods:
  // - ViewKit.mixin(MyBaseView.prototype);
  // - _.extend(MyBaseView.prototype, ViewKit.mixin());
  ViewKit.mixin = function(extend) {
    if (extend && !isView(extend))
      throw('ViewKit must extend a Backbone View class');
      
    extend = extend || {};
    
    for (var i in this.prototype) {
      if (this.prototype.hasOwnProperty(i)) {
        extend[i] = this.prototype[i];
      }
    }
    return extend;
  };
  
  return ViewKit;
  
}).call(this);