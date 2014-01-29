# Backbone.ViewKit

![build status](https://api.travis-ci.org/gmac/backbone.viewkit.png)
(Work in Progress)

A compact view manager for high-performance layout. ViewKit provides basic functional view programming for memory management and optimized DOM manipulation. ViewKit doesn't care how you manage templates or render your views, it's only concerned with the following:

- Subviews are always registered with their parent view for automated cleanup.
- Calling "remove()" on a parent view cascades down to all its subviews.
- All views are rendered before being added to their container.
- All views are removed before cleaning up their subviews.
- Lists should be built outside of the DOM, then be added all at once.

To aid in managing views, ViewKit implements a few common display patterns, including:

- Region renderer (Shows one subview at a time. Opening a new subview cleans up the old one.)
- List renderer (Renders a list of subviews based on a collection of models)
- Finite State renderer (Displays a finite set of views based on a state key)

## Backbone.ViewKit

### ViewKit (static)

**ViewKit.createRegion** `ViewKit.createRegion('.selector');`

### ViewKit (instance)

**vk.replaceSubview** `vk.replaceSubview(view, '.selector');`

**vk.appendSubview** `vk.appendSubview(view, '.selector');`

**vk.createRegion** `vk.createRegion('.selector');`

**vk.addLayout** `vk.addLayout(view);`

**vk.removeLayout** `vk.removeLayout(view);`

**vk.remove** `vk.remove();`

### ViewRegion

**region.open** `region.open(View, Models?);`  
Opens a single view, or a view constructor with a collection of models.

**region.append** `region.append(view);`  
Adds a one-off view onto the end of the list.

**region.filter** `region.filter = function(model) {};`  
Defines a filter function used select relevant models for display. This is a automatic-pass function by default. You may override with a function that accepts a model then returns `true`/`false` to indicate its keep status. Call `render` on the region to re-render with the filter applied.

**region.sort** `region.sort = function(model1, model2) {};`  
Defines a sort function to use while rendering a list of models. This is `null` by default, which skips the sorting process. A sort function should accept two models as arguments, and return a -/0/+ number to indicate their relative positions. Call `render` on the region to re-render with the sort order applied.

**region.render** `region.render();`  
Renders a collection of views into the list.

**region.empty** `region.empty();`  
Empties the region display contents. The region may still be re-rendered with existing content.
    
**region.close** `region.close();`  
Closes the region by emptying the display and releasing all content references. The region is still usable for presenting content after calling `close`.

**region.remove** `region.remove();`  
Completely removes the region display by emptying it, releasing all of its content, and orphaning its container element. The region is no longer usable after being removed. All views managed by the region will also have their `remove` methods invoked.

