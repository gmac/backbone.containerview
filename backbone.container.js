// Backbone.ContainerView

// (c) 2014 Greg MacWilliam
// Freely distributed under the MIT license

(function(root, factory) {
  
  if (typeof exports !== 'undefined') {
		module.exports = factory(require('backbone'), require('underscore'));
	} else if (typeof define === 'function' && define.amd) {
    define(['backbone', 'underscore'], factory);
  } else {
    factory(root.Backbone, root._);
  }
  
}(this, function(Backbone, _) {

  var $ = Backbone.$;
  var ALL = ALL;
  
  function isView(view, error) {
    if (view instanceof Backbone.View) return true;
    if (error) throw ('Not a View instance');
    return false;
  }

  function resolveViewSelector(view, selector) {
    if (!selector) return view.$el;
    if (selector instanceof $) return selector;
    return view.$(selector);
  }

  // ContainerView
  // --------------------------
  var ContainerView = Backbone.ContainerView = Backbone.View.extend({
    contentView: null,
    contentModels: null,
    
    models: null,
    view: null,
    
    _super: Backbone.View,
    
    // Subviews array manager:
    // This method will create a managed array if one does not yet exist.
    // Subviews list should always be accessed through this method.
    _sv: function(subviews) {
      if (subviews && _.isArray(subviews)) this.__sv = subviews;
      return this.__sv || (this.__sv = []);
    },
    
    // Adds a managed subview to the container:
    addSubview: function(views) {
      views = _.isArray(views) ? views : Array.prototype.slice.call(arguments);
      
      var added = _.filter(views, function(view) {
        if (isView(view, true) && view !== this) {
          this._sv().push(view);
          return true;
        }
      }, this);
      
      if (!added.length) return this;
      return added.length == 1 ? added[0] : added;
    },
    
    // Finds and removes a managed subview or view selector:
    // accepts a View object reference or selector string.
    releaseSubviews: function(view, options) {
      options = options || {};
      var selector = view;
      var subviews = this._sv();
      var revised = subviews;
      var remove = options.remove;
      
      if (selector === ALL) {
        // Releases all subview references:
        if (remove) _.invoke(subviews, 'remove');
        revised.length = 0;
        
      } else if (isView(view)) {
        // Removes a single View instance:
        if (remove) view.remove();
        revised = _.without(subviews, view);
        
      } else {
        // Removes all subviews that match the provided selector:
        revised = _.reject(subviews, function(view) {
          if (view.$el.is(selector)) {
            if (remove) view.remove();
            return true;
          }
        });
      }
      
      this._sv(revised);
      return this;
    },
    
    // Convenience method for releasing AND removing subviews:
    removeSubviews: function(view, options) {
      options = options || {};
      options.remove = true;
      return this.releaseSubviews(view, options);
    },
    
    // Specifies the number of subviews currently managed by the container:
    numSubviews: function() {
      return this._sv().length;
    },
    
    // Creates a new managed container view within the view:
    createContainer: function(selector) {
      var $container = resolveViewSelector(this, selector);
      if (!$container.is(this.$el)) {
        return this.addSubview(ContainerView.create($container));
      }
      return this;
    },
    
    // Filter method used while rendering model lists:
    listFilter: function(model) {
      return true;
    },
    
    // Sort method used while rendering model lists:
    listSort: null,

    // Renders the current model/view content configuration:
    render: function() {
      var views = [];
      var content = document.createDocumentFragment();
      
      // Render list with view constructor:
      if (this.models && _.isFunction(this.view)) {
        
        var models = this.models.slice();
        
        // Sort models array when a sort method is defined:
        if (_.isFunction(this.listSort)) {
          models.sort(_.bind(this.listSort, this));
        }

        // Loop through collection and render all models that pass the filter:
        _.each(models, function(model, index) {
          if (this.listFilter(model, index)) {
            var view = new this.view({model: model});
            views.push(view);
            view.render();
            content.appendChild(view.el);
          }
        }, this);
      
      // Render single view:
      } else if (isView(this.view)) {
        this.view.render();
        views.push(this.view);
        content.appendChild(this.view.el);
      }
      
      // Replace container content:
      this.$el.html(content);
      
      // Cleanup all old views, and then cache newly rendered views:
      this.removeSubviews(ALL);
      this._sv(views);
      return this;
    },

    // Opens a single view, or a view constructor with a collection of models:
    open: function(view, models) {
      if (models instanceof Backbone.Collection) {
        models = models.models;
      }
      this.models = _.isArray(models) ? models : null;
      this.view = (_.isFunction(view) || isView(view, true)) ? view : null;
      return this.render();
    },
    
    // Closes the region by emptying the display and releasing all content references:
    // The region is still usable for presenting content after calling "close".
    close: function() {
      this.empty();
      this.view = this.models = null;
      return this;
    },
    
    // Adds a one-off view onto the end of the list:
    append: function(view, selector) {
      view = this.addSubview(view);
      view.render();
      resolveViewSelector(this, selector).append(view.$el);
      return this;
    },
    
    // Inserts a subview by replacing the targeted selector element:
    swapIn: function(view, selector) {
      if (!selector) {
        return this.append(view, selector);
      }
      
      view = this.addSubview(view);
      view.render();
      resolveViewSelector(this, selector).replaceWith(view.$el);
      return this;
    },
    
    // Empties the container element and then removes all managed subviews:
    empty: function() {
      this.$el.empty();
      this.removeSubviews(ALL);
      return this;
    },

    // Removes the view by emptying, releasing all content, and orphaning the container:
    // The region is no longer usable after being removed.
    remove: function() {
      var result = this._super.prototype.remove.apply(this, arguments);
      this.close();
      return result;
    }
  });
  
  // Creates a new container view (convenience method):
  ContainerView.create = function(selector) {
    return new ContainerView({el: selector});
  };
  
  return ContainerView;
}));
