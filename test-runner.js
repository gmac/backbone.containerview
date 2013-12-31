var ViewKit = Backbone.ViewKit;

describe('Backbone.ViewKit', function() {
  
  var view;
  var child1;
  var child2;
  
  beforeEach(function() {
    view = new Backbone.ViewKit();
    child1 = new Backbone.View();
    child2 = new Backbone.View();
  });
  
  it('should define a Backbone.ViewKit constructor function', function() {
    expect(Backbone.ViewKit).to.exist;
    expect(_.isFunction(Backbone.ViewKit)).to.be.true;
  });
  
  it('should extend Backbone.ViewKit instances from Backbone.View', function() {
    expect(view).to.be.instanceof(Backbone.View);
  });
  
  it('should provide an array singleton for caching view references', function() {
    var cache = view._vk();
    expect(cache).to.be.instanceof(Array);
    expect(cache).to.equal(view._vk());
  });
  
  it('addLayout: should throw an error when adding layout without a "remove" method', function() {
    expect(function() {
      view.addLayout({});
    }).to.throw();
  });
  
  it('addLayout: should add removable layout to the view cache', function() {
    view.addLayout(child1);
    expect(view._vk()).to.have.length(1);
    expect(view._vk()[0]).to.equal(child1);
  });
  
  it('addLayout: should return the newly added layout', function() {
    var added = view.addLayout(child1);
    expect(added).to.equal(child1);
  });
  
  it('removeLayout: should remove a single subview instance', function() {
    view.addLayout(child1);
    view.addLayout(child2);
    view.removeLayout(child1);
    expect(view._vk()).to.have.length(1);
    expect(view._vk()[0]).to.equal(child2);
  });
  
  it('removeLayout: should call "remove" on a single removed instance', function() {
    view.addLayout(child1).remove = sinon.spy();
    view.removeLayout(child1);
    expect(child1.remove.callCount).to.equal(1);
  });
  
  it('removeLayout: should remove all subviews when called without an instance', function() {
    view.addLayout(child1);
    view.addLayout(child2);
    view.removeLayout();
    expect(view._vk()).to.have.length(0);
  });
  
  it('removeLayout: should call "remove" on all removed instances', function() {
    view.addLayout(child1).remove = sinon.spy();
    view.addLayout(child2).remove = sinon.spy();
    view.removeLayout();
    expect(child1.remove.callCount).to.equal(1);
    expect(child2.remove.callCount).to.equal(1);
  });
  
  it('replaceSubview: should call "addLayout" while adding new views', function() {
    var addLayout = sinon.spy(view, 'addLayout');
    view.replaceSubview(child1, '#test');
    expect(addLayout.calledWith(child1)).to.be.true;
  });
  
  it('replaceSubview: should add new layout in place of the specified selector', function() {
    // Add a placeholder to the view, then verify content length:
    view.$el.append('<div id="test"></div>');
    expect(view.$el.children().length).to.equal(1);
    
    view.replaceSubview(child1, '#test');

    // Expect still only one child, and that it's the swapped-in view:
    expect(view.$el.children().length).to.equal(1);
    expect(child1.$el.is( view.$el.children()[0] )).to.be.true;
  });
  
  it('replaceSubview: should return the added view element', function() {
    var returned = view.replaceSubview(child1, '#test');
    expect(returned).to.equal(child1);
  });
  
  it('appendSubview: should call "addLayout" while appending a new view', function() {
    var addLayout = sinon.spy(view, 'addLayout');
    view.appendSubview(child1);
    expect(addLayout.calledWith(child1)).to.be.true;
  });
  
  it('appendSubview: should append new layout into the ViewKit container element', function() {
    view.appendSubview(child1);
    expect(view.$el.children().length).to.equal(1);
    expect(child1.$el.is( view.$el.children()[0] )).to.be.true;
  });
  
  it('appendSubview: should return the added view element', function() {
    var returned = view.appendSubview(child1);
    expect(returned).to.equal(child1);
  });
  
  it('remove: should call a ViewKit instance\'s superclass "remove" implementation', function() {
    var _super = sinon.spy(Backbone.View.prototype, 'remove');
    view.remove();
    expect(_super.callCount).to.equal(1);
    expect(_super.calledOn(view)).to.be.true;
    _super.restore();
  });
  
  it('remove: should call a ViewKit instance\'s "removeLayout" method', function() {
    view.removeLayout = sinon.spy();
    view.remove();
    expect(view.removeLayout.callCount).to.equal(1);
    expect(view.removeLayout.calledOn(view)).to.be.true;
  });
  
  it('remove: should call superclass "remove" before calling "removeLayout" (for performance)', function() {
    var superCall = sinon.spy(Backbone.View.prototype, 'remove');
    var emptyCall = view.removeLayout = sinon.spy();
    view.remove();
    expect(superCall.calledBefore(emptyCall)).to.be.false;
    superCall.restore();
  });
});


describe('ViewKit Region Renderer', function() {
  
  var $el;
  var region;
  var view;
  
  beforeEach(function() {
    $el = $('<div id="vktest"></div>').appendTo('body');
    region = ViewKit.createRegion('#vktest');
    view = new Backbone.View();
  });
  
  afterEach(function() {
    $el.remove();
  });
  
  it('ViewKit.createRegion: should create a region renderer scoped to any document selector', function() {
    expect(region.$el[0]).to.equal($el[0]);
  });
  
  it('ViewKit.createRegion: should create a region renderer scoped to a provided jQuery object', function() {
    region = ViewKit.createRegion(view.$el);
    expect(region.$el[0]).to.equal(view.$el[0]);
  });
  
  it('ViewKit.createRegion: should create a Region object with expected API', function() {
    expect(region.$el).to.be.instanceof($);
    expect(region.open).to.be.a('function');
    expect(region.close).to.be.a('function');
    expect(region.remove).to.be.a('function');
  });
  
  it('Region.open: should close existing content before opening new content', function() {
    var close = sinon.spy(region, 'close');
    region.open(view);
    expect(close.callCount).to.equal(1);
  });
  
  it('Region.open: should throw an error when opening non-view-like objects', function() {
    expect(function() {
      region.open({});
    }).to.throw();
  });
  
  it('Region.open: should render a view-like object into the region', function() {
    view.render = sinon.spy();
    region.open(view);
    expect(view.render.callCount).to.equal(1);
    expect(region.$el.children().length).to.equal(1);
    expect(view.$el.is( region.$el.children()[0] )).to.be.true;
  });
  
  it('Region.open: should store a reference to the currently opened view', function() {
    region.open(view);
    expect(region.view).to.equal(view);
  });
  
  it('Region.close: should call "remove" on any currently opened view', function() {
    view.remove = sinon.spy();
    region.open(view);
    region.close();
    expect(view.remove.callCount).to.equal(1);
  });
  
  it('Region.close: should release references to the previously held view', function() {
    region.open(view);
    region.close();
    expect(region.view).to.be.null;
  });
  
  it('Region.remove: should call close and release element reference', function() {
    region.open(view);
    var close = sinon.spy(region, 'close');
    region.remove();
    expect(close.callCount).to.equal(1);
    expect(region.$el).to.be.null;
  });
});

