var ContainerView = Backbone.ContainerView;

describe('Backbone.ContainerView', function() {
  
  var view;
  var luke;
  var leia;
  var models;
  
  var ItemView = Backbone.View.extend({
    tagName: 'span',
    attributes: function() {
      return {'data-name': this.model.get('name')};
    }
  });
  
  beforeEach(function() {
    view = new ContainerView({el: '<div><div class="region"></div></div>'});
    luke = new Backbone.View({el: '<div class="luke"></div>'});
    leia = new Backbone.View({el: '<div class="leia"></div>'});
    models = [
      new Backbone.Model({name: 'luke'}),
      new Backbone.Model({name: 'leia'})
    ];
  });
  
  it('should define a Backbone.ContainerView constructor function', function() {
    expect(Backbone.ContainerView).to.exist;
    expect(_.isFunction(Backbone.ContainerView)).to.be.true;
  });
  
  it('should extend Backbone.ContainerView instances from Backbone.View', function() {
    expect(view).to.be.instanceof(Backbone.View);
  });
  
  /*it('should define Backbone.View as its default "_super" reference', function() {
    expect(view._super).to.equal(Backbone.View);
  });*/
  
  it('should provide an array singleton for caching subview references', function() {
    var cache = view._sv();
    expect(cache).to.be.instanceof(Array);
    expect(cache).to.equal(view._sv());
  });
  
  it('should provide a static "create" method for generating instances', function() {
    var container = ContainerView.create('<span></span>');
    expect(container).to.be.instanceof(ContainerView);
    expect(container.el.tagName.toLowerCase()).to.equal('span');
  });
  
  it('addSubview: should throw an error when adding a non-view object', function() {
    expect(function() {
      view.addSubview({});
    }).to.throw();
  });
  
  it('numSubviews: should specify the current number of managed subviews view', function() {
    view.addSubview(luke);
    expect(view.numSubviews()).to.equal(1);
    
    view.addSubview(leia);
    expect(view.numSubviews()).to.equal(2);
  });
  
  it('addSubview: should add and return a single view instance', function() {
    var returned = view.addSubview(luke);
    expect(view.numSubviews()).to.equal(1);
    expect(view._sv()[0]).to.equal(luke);
    expect(returned).to.equal(luke);
  });
  
  it('addSubview: should add and return an array of view instances', function() {
    var returned = view.addSubview([luke, leia]);
    expect(view.numSubviews()).to.equal(2);
    expect(view._sv()[0]).to.equal(luke);
    expect(view._sv()[1]).to.equal(leia);
    expect(returned).to.be.instanceof(Array);
    expect(returned).to.have.length(2);
  });
  
  it('addSubview: should add and return a list of view instance arguments', function() {
    var returned = view.addSubview(luke, leia);
    expect(view.numSubviews()).to.equal(2);
    expect(view._sv()[0]).to.equal(luke);
    expect(view._sv()[1]).to.equal(leia);
    expect(returned).to.be.instanceof(Array);
    expect(returned).to.have.length(2);
  });
  
  it('releaseSubviews: should release a specific subview instance', function() {
    view.addSubview(luke, leia);
    view.releaseSubviews(leia);
    expect(view.numSubviews()).to.equal(1);
    expect(view._sv()[0]).to.equal(luke);
  });
  
  it('releaseSubviews: should release and remove a specific subview instance', function() {
    var removeLeia = sinon.spy(leia, 'remove');
    view.addSubview(luke, leia);
    view.releaseSubviews(leia, {remove: true});
    expect(removeLeia.calledOnce).to.be.true;
  });
  
  it('releaseSubviews: should release a selected subview instance', function() {
    view.addSubview(luke, leia);
    view.releaseSubviews('.luke');
    expect(view.numSubviews()).to.equal(1);
    expect(view._sv()[0]).to.equal(leia);
  });
  
  it('releaseSubviews: should release and remove a selected subview instance', function() {
    var removeLuke = sinon.spy(luke, 'remove');
    view.addSubview(luke, leia);
    view.releaseSubviews('.luke', {remove: true});
    expect(removeLuke.calledOnce).to.be.true;
  });
  
  it('releaseSubviews: should use "*" to release all subview instances', function() {
    view.addSubview(luke, leia);
    view.releaseSubviews('*');
    expect(view.numSubviews()).to.equal(0);
  });
  
  it('releaseSubviews: should use "*" to release and remove all subview instances', function() {
    var removeLuke = sinon.spy(luke, 'remove');
    var removeLeia = sinon.spy(leia, 'remove');
    view.addSubview(luke, leia);
    view.releaseSubviews('*', {remove: true});
    expect(removeLuke.calledOnce).to.be.true;
    expect(removeLeia.calledOnce).to.be.true;
  });
  
  it('createSubcontainer: should create a new managed container for a selected child element', function() {
    var region = view.createSubcontainer('.region');
    expect(view.numSubviews()).to.equal(1);
    expect(region).to.be.instanceof(ContainerView);
  });
  
  it('append: should add a new managed subview into the view\'s root container element', function() {
    view.append(luke);
    expect(view.$el.children()).to.have.length(2);
    expect(view.numSubviews()).to.equal(1);
  });
  
  it('append: should add a new managed subview into a selected container element', function() {
    view.append(luke, '.region');
    expect(view.$el.children()).to.have.length(1);
    expect(view.$('.region').children()).to.have.length(1);
    expect(view.numSubviews()).to.equal(1);
  });
  
  it('swapIn: should add a new managed subview in place of a selected container element', function() {
    view.swapIn(luke, '.region');
    expect(view.$el.children()).to.have.length(1);
    expect(view.$('.region')).to.have.length(0);
    expect(view.$('.luke')).to.have.length(1);
    expect(view.numSubviews()).to.equal(1);
  });
  
  it('swapIn: should defer to "append" if no target selector is specified', function() {
    view.swapIn(luke);
    expect(view.$el.children()).to.have.length(2);
    expect(view.$('.region')).to.have.length(1);
    expect(view.$('.luke')).to.have.length(1);
    expect(view.numSubviews()).to.equal(1);
  });
  
  /*it('empty: should empty the container element, and remove all subviews', function() {
    luke.remove = sinon.spy();
    leia.remove = sinon.spy();
    
    // Add subviews and validate configuration:
    view.append(luke);
    view.append(leia);
    expect(view.$el.children()).to.have.length(3);
    expect(view.numSubviews()).to.equal(2);
    
    // Empty the view, and validate cleanup:
    view.empty();
    expect(view.$el.children()).to.have.length(0);
    expect(view.numSubviews()).to.equal(0);
    expect(luke.remove.calledOnce).to.be.true;
    expect(leia.remove.calledOnce).to.be.true;
  });*/
  
  it('open: should open a single subview into the container', function() {
    view.open(luke);
    expect(view.$el.children()).to.have.length(1);
    expect(view.$('.luke')).to.have.length(1);
    expect(view.numSubviews()).to.equal(1);
  });
  
  it('open: should replace existing container contents with opened view', function() {
    view.open(luke);
    expect(view.numSubviews()).to.equal(1);
    
    view.open(leia);
    expect(view.$el.children()).to.have.length(1);
    expect(view.$('.leia')).to.have.length(1);
    expect(view.numSubviews()).to.equal(1);
  });
  
  it('open: should open a list of views, rendered from a view class and models array', function() {
    view.open(ItemView, models);
    expect(view.$el.children()).to.have.length(2);
    expect(view.$('[data-name="luke"]')).to.have.length(1);
    expect(view.$('[data-name="leia"]')).to.have.length(1);
    expect(view.numSubviews()).to.equal(2);
  });
  
  it('open: opening a new list should remove/replace old content', function() {
    var remove = sinon.spy(Backbone.View.prototype, 'remove');
    
    view.open(luke);
    expect(view.$el.children()).to.have.length(1);
    expect(view.numSubviews()).to.equal(1);
    
    view.open(ItemView, models);
    expect(view.$el.children()).to.have.length(2);
    expect(view.numSubviews()).to.equal(2);
    
    expect(remove.callCount).to.equal(1);
    remove.restore();
  });
  
  it('open: opening new content should remove/replace an old list', function() {
    var remove = sinon.spy(Backbone.View.prototype, 'remove');
    
    view.open(ItemView, models);
    expect(view.$el.children()).to.have.length(2);
    expect(view.numSubviews()).to.equal(2);
    
    view.open(luke);
    expect(view.$el.children()).to.have.length(1);
    expect(view.numSubviews()).to.equal(1);
    
    expect(remove.callCount).to.equal(2);
    remove.restore();
  });
  
  it('open: should store opened content references on the view', function() {
    view.open(ItemView, models);
    expect(view.contentView).to.equal(ItemView);
    expect(view.contentModels).to.equal(models);
  });
  
  it('close: should empty the container', function() {
    view.open(ItemView, models);
    expect(view.$el.children()).to.have.length(2);
    expect(view.numSubviews()).to.equal(2);
    
    view.close();
    expect(view.$el.children()).to.have.length(0);
    expect(view.numSubviews()).to.equal(0);
  });
  
  it('close: should nullify content references', function() {
    view.open(ItemView, models);
    expect(view.contentView).to.equal(ItemView);
    expect(view.contentModels).to.equal(models);
    
    view.close();
    expect(view.contentView).to.be.null;
    expect(view.contentModels).to.be.null;
  });
  
  it('renderContent: should empty the container when there is no opened content', function() {
    expect(view.$el.children()).to.have.length(1);
    view.renderContent();
    expect(view.$el.children()).to.have.length(0);
  });
  
  it('renderContent: should render and display a single view instance as content', function() {
    var render = sinon.spy(luke, 'render');
    view.contentView = luke;
    view.renderContent();
    
    expect(view.$el.children()).to.have.length(1);
    expect(view.$el.children()[0]).to.equal(luke.$el[0]);
    expect(render.calledOnce).to.be.true;
  });
  
  it('renderContent: should empty the container when a view constructor is provided without models', function() {
    view.contentView = ItemView;
    view.renderContent();
    expect(view.$el.children()).to.have.length(0);
    expect(view.numSubviews()).to.equal(0);
  });
  
  it('renderContent: should render a view constructor with a list of models into the container', function() {
    view.contentView = ItemView;
    view.contentModels = models;
    view.renderContent();
    expect(view.$el.children()).to.have.length(2);
    expect(view.numSubviews()).to.equal(2);
  });
  
  it('contentFilter: should provide an automatic-pass by default', function() {
    expect(view.contentFilter()).to.be.true;
  });
  
  it('contentFilter: should filter the list of rendered models', function() {
    view.contentFilter = function(model) {
      return model.get('name') === 'luke';
    };
    
    view.open(ItemView, models);
    expect(view.$el.children().eq(0).is('[data-name="luke"]')).to.be.true;
    expect(view.$el.children()).to.have.length(1);
    expect(view.numSubviews()).to.equal(1);
  });
  
  it('contentSort: should be unimplemented by default', function() {
    expect(view.contentSort).to.be.null;
  });

  it('contentSort: should sort the render order of the provided content models', function() {
    // Expect original order to be "luke", "leia":
    expect(models[0].get('name')).to.equal('luke');
    expect(models[1].get('name')).to.equal('leia');
    
    // Sort alphabetically:
    view.contentSort = function(model1, model2) {
      return model1.get('name').localeCompare(model2.get('name'));
    };
    
    view.open(ItemView, models);
    
    // Expect render order to be "leia", "luke":
    expect(view.$el.children().eq(0).is('[data-name="leia"]')).to.be.true;
    expect(view.$el.children().eq(1).is('[data-name="luke"]')).to.be.true;
  });
  
  it('remove: should call superclass "remove" and then "empty" (in that order for best performance)', function() {
    var superCall = sinon.spy(Backbone.View.prototype, 'remove');
    //var emptyCall = sinon.spy(view, 'empty');
    
    view.remove();
    expect(superCall.calledOnce).to.be.true;
    //expect(emptyCall.calledOnce).to.be.true;
    //expect(superCall.calledBefore(emptyCall)).to.be.true;
    superCall.restore();
  });
  
  it('remove: should call "remove" on all managed subviews', function() {
    var remove = sinon.spy(Backbone.View.prototype, 'remove');
    
    view.addSubview(luke, leia);
    view.remove();
    expect(remove.callCount).to.equal(3);
    remove.restore();
  });
});
