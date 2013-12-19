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
  function RegionLayout(selector) {
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
        this.view = null;
        this.state = null;
      }
      return this;
    },
    
    // Render: implemented strictly for duck-typing purposes.
    render: function() {
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
  function ListLayout(selector) {
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

    // Renders a collection of views into the list:
    render: function(models, ViewClass, filter, sort) {
      this.empty();
      
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

    empty: function() {
      this.$el.empty();
      _.invoke(this.views, 'remove');
      this.views.length = 0;
      return this;
    },

    remove: function() {
      this.empty();
      this.$el =
        this.models =
        this.views =
        this.viewClass = null;
      return this;
    }
  };
  
  // ViewKit Backbone Extension
  // --------------------------
  var ViewKit = Backbone.ViewKit = Backbone.View.extend({
    _vk: function() {
      return this.__vk || (this.__vk = []);
    },
    
    // Defines a new layout Region for the provided selector:
    // selector attempts to scope itself within the view instance.
    createRegion: function(selector) {
      var $container = resolveViewSelector(this, selector);
      return this.addLayout(ViewKit.createRegion($container));
    },

    // Defines a new layout List for to the provided selector:
    // selector attempts to scope itself within the view instance.
    createList: function(selector) {
      var $container = resolveViewSelector(this, selector);
      return this.addLayout(ViewKit.createList($container));
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
  
  // Static method for creating display regions:
  // @param selector  A jQuery object, or globally-scoped selector.
  ViewKit.createRegion = function(selector) {
    return new RegionLayout(selector);
  };
  
  // Static method for creating display lists:
  // @param selector  A jQuery object, or globally-scoped selector.
  ViewKit.createList = function(selector) {
    return new ListLayout(selector);
  };
  
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