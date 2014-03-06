// Backbone.ContainerView
// (c) 2014 Greg MacWilliam
// Freely distributed under the MIT license
(function (root, factory) {

  if (typeof exports !== 'undefined') {
    module.exports = factory(require('backbone'), require('underscore'));
  } else if (typeof define === 'function' && define.amd) {
    define(['backbone', 'underscore'], factory);
  } else {
    factory(root.Backbone, root._);
  }

}(this, function (Backbone, _) {

  var $ = Backbone.$;
  var ViewPrototype = Backbone.View.prototype;
  var ALL = '*';

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

    // Subviews list accessor:
    // Creates a managed subview array if one does not yet exist.
    // Subviews list should always be accessed through this method.
    _sv: function (subviews) {
      if (subviews && _.isArray(subviews)) this.__sv = subviews;
      if (!this.__sv) this.__sv = [];
      return this.__sv;
    },

    // Adds a managed subview to the container:
    addSubview: function (views) {
      views = _.isArray(views) ? views : Array.prototype.slice.call(arguments);

      var added = _.filter(views, function (view) {
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
    releaseSubviews: function (view, options) {
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
        revised = _.reject(subviews, function (view) {
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
    removeSubviews: function (view, options) {
      options = options || {};
      options.remove = true;
      return this.releaseSubviews(view, options);
    },

    // Specifies the number of subviews currently managed by the container:
    numSubviews: function () {
      return this._sv().length;
    },

    // Creates a new managed container view within the view:
    createSubcontainer: function (selector) {
      var $container = resolveViewSelector(this, selector);
      if (!$container.is(this.$el)) {
        return this.addSubview(ContainerView.create($container));
      }
      return this;
    },

    // Filter method used while rendering model lists:
    contentFilter: function (model) {
      return true;
    },

    // Sort method used while rendering model lists:
    contentSort: null,

    // Renders the current model/view content configuration:
    renderContent: function () {
      var subviews = [];
      var contentView = this.contentView;
      var contentModels = this.contentModels;
      var content = document.createDocumentFragment();

      // Render view constructor with models list:
      if (_.isFunction(contentView) && _.isArray(contentModels)) {

        // Sort models array when a sort method is defined:
        if (_.isFunction(this.contentSort)) {
          contentModels = contentModels.slice();
          contentModels.sort(_.bind(this.contentSort, this));
        }

        // Loop through collection and render all models that pass the filter:
        _.each(contentModels, function (model, index) {
          if (this.contentFilter(model, index)) {
            var view = new contentView({
              model: model
            });
            subviews.push(view);
            view.render();
            content.appendChild(view.el);
          }
        }, this);

        // Render single view:
      } else if (isView(contentView)) {
        contentView.render();
        subviews.push(contentView);
        content.appendChild(contentView.el);
      }

      // Replace container content, then cleanup old views and cache new subviews:
      this.$el.html(content);
      this.removeSubviews(ALL);
      this._sv(subviews);
      return this;
    },

    // Opens a single view, or a view constructor with a collection of models:
    open: function (view, models) {
      // Convert collection/model instances to an array:
      if (models instanceof Backbone.Collection) models = models.models;
      else if (models instanceof Backbone.Model) models = [models];

      this.contentModels = _.isArray(models) ? models : null;
      this.contentView = (_.isFunction(view) || isView(view, true)) ? view : null;
      return this.renderContent();
    },

    // Closes the region by emptying the display and releasing all content references:
    // The region is still usable for presenting content after calling "close".
    close: function () {
      this.$el.empty();
      this.removeSubviews(ALL);
      this.contentView = this.contentModels = null;
      return this;
    },

    // Adds a one-off view onto the end of the list:
    append: function (view, selector) {
      view = this.addSubview(view);
      view.render();
      resolveViewSelector(this, selector).append(view.$el);
      return this;
    },

    // Inserts a subview by replacing the targeted selector element:
    swapIn: function (view, selector) {
      if (!selector) {
        return this.append(view, selector);
      }

      view = this.addSubview(view);
      view.render();
      resolveViewSelector(this, selector).replaceWith(view.$el);
      return this;
    },

    // Removes the view by emptying, releasing all content, and orphaning the container:
    // The region is no longer usable after being removed.
    remove: function () {
      var result = ViewPrototype.remove.apply(this, arguments);
      this.close();
      return result;
    }

    // STATIC API:
  }, {
    // Convenience method for creating a new container view:
    create: function (selector) {
      return new ContainerView({
        el: selector
      });
    },

    // Installs ContainerView methods globally onto Backbone.View:
    install: function (enable) {
      Backbone.View.prototype = (enable !== false) ?
        _.extend({}, ViewPrototype, ContainerView.prototype) : ViewPrototype;
    }
  });

  return ContainerView;
}));