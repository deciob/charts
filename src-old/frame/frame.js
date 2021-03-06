// **frame.frame module**

define([
  'd3',
  'utils/mixins',
  'frame/config',
  'frame/states',
  'frame/mixins',
  'frame/state_machine'
], function(d3, utils_mixins, default_config, states, frame_mixins, StateMachine) {

  return function (user_config) {

    var config = user_config || {},
      utils  = utils_mixins(),
      extend = utils.extend,
      getset = utils.getset,
      __     = extend(default_config, config);

    function Frame () {
  
      var self = this instanceof Frame
                 ? this
                 : new Frame();
      
      self.__ = __;
      getset(self, __);
      self.frame = __.initial_frame;
      self.parsed_data = self.parseData.call(self);
  
      self.state_machine = new StateMachine(states.transition_states);
      self.dispatch = d3.dispatch(
        'start', 
        'stop', 
        'next', 
        'prev', 
        'reset', 
        'end',
        'jump',
        'at_beginning_of_transition'
      );
      
      // Fired when all the chart related transitions within a frame are 
      // terminated.
      // It is the only dispatch event that does not have a state_machine 
      // equivalent event.
      // `frame` is an arbitrary namespace, in order to register multiple 
      // listeners for the same event type.
      //
      // https://github.com/mbostock/d3/wiki/Internals#events:
      // If an event listener was already registered for the same type, the 
      // existing listener is removed before the new listener is added. To 
      // register multiple listeners for the same event type, the type may be 
      // followed by an optional namespace, such as 'click.foo' and 'click.bar'.
      self.dispatch.on('end.frame', self.handleFrameEnd);
  
      self.dispatch.on('stop', self.handleStop);
  
      self.dispatch.on('start', self.handleStart);
  
      self.dispatch.on('next', self.handleNext);
  
      self.dispatch.on('prev', self.handlePrev);
  
      self.dispatch.on('reset', self.handleReset);
  
      self.dispatch.on('jump', self.handleJump);
  
      return self;
    }
  
    //getset(Frame.prototype, __);
    getset(Frame, __);
    frame_mixins.call(Frame.prototype);
  
    Frame.prototype.startTransition = function () {
      var self = this;
      clearTimeout(__.current_timeout);
      if (self.parsed_data[self.frame]) {
        __.current_timeout = setTimeout( function () {
          // Fire the draw event
          __.draw_dispatch.draw.call(self, self.parsed_data[self.frame], __.old_frame);
        }, __.step);
      } else {
        // When no data is left to consume, let us stop the running frames!
        this.state_machine.consumeEvent('stop');
        this.frame = __.old_frame;
      }
      self.dispatch.at_beginning_of_transition.call(self);
    }
  
    Frame.prototype.handleFrameEnd = function () {
      this.handleTransition();
      return this;
    }
  
    Frame.prototype.handleStop = function () {
      this.state_machine.consumeEvent('stop');
      return this;
    }
  
    // TODO: there is a lot of repetition here!
  
    Frame.prototype.handleStart = function () {
      if (this.state_machine.getStatus() === 'in_pause') {
        this.state_machine.consumeEvent('start');
        this.handleTransition();
      } else {
        console.log('State already in in_transition_start.');
      }
      return this;
    }
  
    // TODO:
    // for next and prev we are allowing multiple prev-next events to be 
    // fired without waiting for the current frame to end. Change?
  
    Frame.prototype.handleNext = function () {
      this.state_machine.consumeEvent('next');
      if (this.state_machine.getStatus() === 'in_transition_next') {
        this.handleTransition();
      } else {
        console.log('State not in pause when next event was fired.');
      }
      return this;
    }
  
    Frame.prototype.handlePrev = function () {
      this.state_machine.consumeEvent('prev');
      if (this.state_machine.getStatus() === 'in_transition_prev') {
        this.handleTransition();
      } else {
        console.log('State not in pause when prev event was fired.');
      }
      return this;
    }
  
    Frame.prototype.handleReset = function () {
      this.state_machine.consumeEvent('reset');
      if (this.state_machine.getStatus() === 'in_transition_reset') {
        this.handleTransition();
      } else {
        console.log('State not in pause when reset event was fired.');
      }
      return this;
    }
  
    Frame.prototype.handleJump = function (value) {
      this.state_machine.consumeEvent('jump');
      if (this.state_machine.getStatus() === 'in_transition_jump') {
        this.handleTransition(value);
      } else {
        console.log('State not in pause when jump event was fired.');
      }
      return this;
    }
  
    
    Frame.prototype.handleTransition = function (value) {
      var self = this, status = this.state_machine.getStatus();
      if (status === 'in_transition_start') {
        __.old_frame = this.frame;
        this.frame += __.delta;
        this.startTransition();
      } else if (status === 'in_transition_prev') {
        __.old_frame = this.frame;
        this.frame -= __.delta;
        this.startTransition();
        self.state_machine.consumeEvent('stop');
      } else if (status === 'in_transition_next') {
        __.old_frame = this.frame;
        this.frame += __.delta;
        this.startTransition();
        self.state_machine.consumeEvent('stop');
      } else if (status === 'in_transition_jump') {
        if (!value) return new Error('need to pass a value to jump!');
        __.old_frame = this.frame;
        this.frame = value;
        this.startTransition();
        self.state_machine.consumeEvent('stop');
      } else if (status === 'in_transition_reset') {
        __.old_frame = this.frame;
        this.frame = __.initial_frame;
        this.startTransition();
        self.state_machine.consumeEvent('stop');
      } else if (status === 'in_pause') {
        return;
      } 
    }
  
    return Frame;

  };
  
});

