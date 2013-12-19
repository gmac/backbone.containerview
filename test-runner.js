describe('Backbone.ViewKit', function() {
  
  var view;
  var child1;
  var child2;
  
  beforeEach(function() {
    view = new Backbone.ViewKit();
    child1 = new Backbone.View();
    child2 = new Backbone.View();
  });
  
  it('should define a Backbone.ViewKit constructor function.', function() {
    expect(Backbone.ViewKit).to.exist;
    expect(_.isFunction(Backbone.ViewKit)).to.be.true;
  });
  
  it('should extend Backbone.ViewKit instances from Backbone.View.', function() {
    expect(view).to.be.instanceof(Backbone.View);
  });
  
  it('should provide an array singleton for caching view references.', function() {
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
  
  it('remove: should call a ViewKit instance\'s superclass "remove" implementation', function() {
    var sup = Backbone.View.prototype.remove = sinon.spy();
    view.remove();
    expect(sup.callCount).to.equal(1);
    expect(sup.calledOn(view)).to.be.true;
  });
  
  it('remove: should call a ViewKit instance\'s "removeLayout" method', function() {
    view.removeLayout = sinon.spy();
    view.remove();
    expect(view.removeLayout.callCount).to.equal(1);
    expect(view.removeLayout.calledOn(view)).to.be.true;
  });
  
  it('remove: should call superclass "remove" before calling "removeLayout" (for performance)', function() {
    var superCall = Backbone.View.prototype.remove = sinon.spy();
    var emptyCall = view.removeLayout = sinon.spy();
    view.remove();
    expect(superCall.calledBefore(emptyCall)).to.be.true;
  });
});