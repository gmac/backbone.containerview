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