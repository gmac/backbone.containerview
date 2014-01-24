(function() {
  
  var Backbone = this.Backbone;
  var $ = this.jQuery || this.$;
  var _ = this._;
  
  function isViewLike(view, error) {
    if (!_.isFunction(view) && _.isFunction(view.render) && _.isFunction(view.remove)) {
			return true;
		} else if (error) {
			throw('Layout objects require "render" and "remove" methods');
		}
    return false;
  }
  
  function resolveViewSelector(view, selector) {
    if (!selector) return view.$el;
    if (selector instanceof $) return selector;
    return view.$(selector);
  }

  // Display Region
  // --------------
  // Manages the display of a list of models and their views
  function DisplayRegion(selector) {
    this.$el = $(selector).empty();
    this.views = [];
  }

  DisplayRegion.prototype = {
    views: null,
    view: null,
    models: null,

    // Default filter method used to render the list:
    filter: function(model) {
      return true;
    },

    // Renders a collection of views into the list:
    render: function(filter) {
      this.close();
			var content;
			
			if (isViewLike(this.view)) {
				// Single view item:
				this.view.render();
				this.views.push(this.view);
				content = this.view.$el;
			}
			else if (_.isFunction(this.view) && this.models) {
				// Views list:
				if (!filter) filter = this.filter;

	      content = document.createDocumentFragment();
				
				// Loop through collection and render all models that pass the filter:
	      _.each(this.models, function(model, index) {
	        if (filter(model, index)) {
	          var view = new this.view({model: model});
	          this.views.push(view);
	          view.render();
	          list.appendChild(view.el);
	        }
	      }, this);
			}
			
      content && this.$el.append(content);
      return this;
    },
		
		// Opens a single view, or a view constructor with a collection of models:
    open: function(view, models) {
			if (models && models instanceof Backbone.Collection) models = models.models;
			this.models = (models && _.isArray(models)) ? models.slice() : null;
			this.view = (_.isFunction(view) || isViewLike(view, true)) ? view : null;
      return this.render();
    },

    // Adds a one-off view onto the end of the list:
    append: function(view) {
      view.render();
      this.views.push(view);
      this.$el.append(view.$el);
      return this;
    },

    close: function() {
      this.$el.empty();
      _.invoke(this.views, 'remove');
      this.views.length = 0;
      return this;
    },

    remove: function() {
      this.close();
      this.$el = this.view = this.models = null;
      return this;
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
		
		createRegion: function(selector) {
      var $container = resolveViewSelector(this, selector);
      return this.addLayout(ViewKit.createList($container));
		},
		
    // Adds a removable element to the layout cache:
    // Layout elements MUST implement a "remove" method.
    // all added layout is automatically removed along with the managing view instance.
    // @param item: a removable item (View or Region instance)
    addLayout: function(item) {
      if (isViewLike(item, true)) {
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
  
  ViewKit.createRegion = function(selector) {
    return new DisplayRegion(selector);
  };
  
  return ViewKit;
  
}).call(this);