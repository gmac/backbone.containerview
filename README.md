# Backbone.ContainerView

![build status](https://api.travis-ci.org/gmac/backbone.containerview.png)

ContainerView is a compact `Backbone.View` extention that provides basic memory management, high-performance rendering, and convenient layout controls to the native Backbone View.

## Principals

ContainerView addresses several core principals required for building highly efficient application displays.

### 1. Memory Management

Backbone Views should, by design, listen to their associated models for events. However, these event bindings must be undone when the view is deprecated, otherwise the view may be held in memory rather than being garbage-collected. To address this, Backbone Views provide a `remove` method that cleans up the view's DOM element and bound events. It's our job to make sure that `remove` is called on every view instance when we're finished with it.

ContainerView is designed to help with this by maintaining a list of its managed subviews. When a ContainerView is removed, it calls `remove` on all of its subviews. ContainerViews may also be nested, which makes the removal of an entire view tree as simple as calling `remove` on the top-level container.

### 2. Minimizing DOM Reflows

When elements are added or removed from the active DOM, a document *reflow* is generally triggered. This is an expensive operation that forces the browser to recalculate the document layout. To optimize rendering performance, we want to trigger as few reflows as possible. ContainerView helps with this:

- When rendering a lists, ContainerView builds a list outside of the active DOM, a then swaps the fully-rendered list into the container, triggering a single reflow.
- When removing elements, ContainerView removes itself from the DOM first before calling `remove` on its subviews, again triggering only a single reflow.

### 3. Workflow

ContainerView has three major concerns...

- **Memory Management:** Subviews are registered with their container, and will be removed along with that container. ContainerView makes sure that `remove` is called on all subviews for proper memory management.
- **Efficient Rendering:** adding and removing elements from the active DOM triggers expensive reflows; ContainerView handles the timing of subview rendering and removal to minimize reflows. Also, it performs list rendering using document fragments, so entire lists may be generated with only a single reflow.
- **Easy View Management:** Lists should be built outside of the DOM, then be added all at once.

To aid in managing views, ViewKit implements a few common display patterns, including:

- Region renderer (Shows one subview at a time. Opening a new subview cleans up the old one.)

## ContainerView API

- [#create](#create)
- [#install](#install)
- [addSubview](#addSubview)
- [releaseSubviews](#releaseSubviews)
- [removeSubviews](#removeSubviews)
- [createSubcontainer](#createSubcontainer)
- [open](#open)
- [close](#close)
- [append](#append)
- [swapIn](#swapin)
- [renderContent](#renderContent)
- [contentFilter](#contentFilter)
- [contentSort](#contentSort)
- [remove](#remove)


##### <span id='create'>ContainerView.create</span> `ContainerView.create('.selector');`

Static convenience method for creating a new `ContainerView` object. This method is useful for creating an application's root container region:

``` javascript
var container = ContainerView.create('#app-container');
	
// Opens a list of friend views into the container:
container.open(FriendsListView, this.friendsCollection);
```

##### <span id='install'>ContainerView.install</span> `ContainerView.install();`

Static convenience method for installing ContainerView methods onto the native Backbone.View class. Once installed, all ContainerView methods will be available through regular Backbone.View instances. Note that ContainerView is extremely lightweight, and adds virtually no overhead onto class instances, so the performance impact of installing ContainerView is negligable.

##### <span id='addSubview'>addSubview</span> `container.addSubview(view);`
 
Adds a view instance to the container's list of managed subviews. Managed subviews will have their `remove` method invoked when their managing container is removed or emptied.

You generally shouldn't need to call `addSubview` directly. Favor using the display management methods (`open`, `close`, `append`, etc), which will control the container display while automatically tracking managed subviews.

##### <span id='releaseSubviews'>releaseSubviews</span> `container.releaseSubviews(selector, [options]);`

Releases view instances from the container's list of managed subviews. The `selector` argument may be a specific view instance to release, or a selector string to match subview elements against. You may specify `"*"` as the selector argument to match *all* subviews.

By default, released subviews are simply deleted from the container's list of managed subviews; their display element and bound event listeners are left untouched. To call `remove` on these subviews for formal cleanup purposes, pass a `{remove: true}` option. Removed subviews will be removed from the DOM, and their listeners unbound.

##### <span id='removeSubviews'>removeSubviews</span> `container.removeSubviews(selector);`

A convenience method for invoking `releaseSubviews` with a `{remove: true}` option. All selected subviews will be released, and their elements are removed from the container element.

##### <span id='numSubviews'>numSubviews</span> `container.numSubviews();`

Specifies the number of subview instances currently managed by the container.

##### <span id='createSubcontainer'>createSubcontainer</span> `container.createSubcontainer(selector);`

Creates a new `ContainerView` instance for the matched selector element, and adds this sub-container to the parent's list of managed subviews. Returns the new sub-container instance.

##### <span id='open'>open</span> `container.open(view, [models]);`

Opens new content into the container view. When new content is opened, all existing container content is removed and released, and the container assumes responsibility for the new content. The `open` method may be used to display a single view instance, or to render a list of views. Arguments:

- `view`: a single view instance to display within the container, or a view class constructor function to render into the container. When providing a view constructor function, you must also provide one or more models to render as the second argument.
- `models`: a collection (or array) of models to render. A models array is only required when the first argument provided is a view constructor function.

##### <span id='close'>close</span> `container.close();`

Closes any existing container content. The container element will be emptied, all subviews will be released, and all content references will be nullified.

##### <span id='append'>append</span> `container.append(view, [selector]);`

Adds a one-off view onto the end of the list.

##### <span id='swapIn'>swapIn</span> `container.swapIn(view, [selector]);`

Adds a one-off view onto the end of the list.

##### <span id='swapIn'>contentFilter</span> `container.contentFilter = function(model) {};`

Defines a filter function used select relevant models for display. This is a automatic-pass function by default. You may override with a function that accepts a model then returns `true`/`false` to indicate its keep status. Call `render` on the region to re-render with the filter applied.

##### <span id='swapIn'>contentSort</span> `container.contentSort = function(model1, model2) {};`

Defines a sort function to use while rendering a list of models. This is `null` by default, which skips the sorting process. A sort function should accept two models as arguments, and return a -/0/+ number to indicate their relative positions. Call `render` on the region to re-render with the sort order applied.

