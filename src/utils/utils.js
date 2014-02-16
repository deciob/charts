define(["d3", "d3_tip"], function(d3, d3_tip) {

  // **Useful functions that can be shared across modules**
  
  function clone (obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }

  function extend (target, source) {
    var target_clone = clone(target);
    for(prop in source) {
      target_clone[prop] = source[prop];
    }
    return target_clone;
  }

  // Todo: some docs on this function.
  function getset (obj, state) {
    d3.keys(state).forEach( function(key) {
      obj[key] = function (x) {
        if (!arguments.length) return state[key];
        var old = state[key];
        state[key] = x;
        return obj;
      }
    });
  }

  // Fires a callback when all transitions of a chart have ended.
  // The solution is inspired from a reply in 
  // [Single event at end of transition?](https://groups.google.com/forum/#!msg/d3-js/WC_7Xi6VV50/j1HK0vIWI-EJ). 
  // The original suggestion assumes the data length never changes, this 
  // instead also accounts for exits during the transition.
  function endall (elements_in_transition, data, callback) {
    var n = data.length;
    elements_in_transition 
      .each("end", function() { 
        if (!--n) {
          callback.apply(this, arguments);
        }
      });
  }

  // Initializes a [d3-tip](https://github.com/Caged/d3-tip) tooltip.
  function tip (obj) {
    var tip = d3_tip().attr('class', 'd3-tip');
    typeof true === 'boolean';
    //if (Object.prototype.toString.call(obj) === "[object Object]") {
    if (typeof obj !== 'boolean') {
      Object.keys(obj).forEach(function(key) {
        var value = obj[key];
        if (key === 'attr') {
          tip.attr(value[0], value[1]);
        } else {
          tip[key](value);
        }  
      });
    }


    //var cb = typeof(cb) == "function" ? cb : function(d) { return d; };
    //return d3_tip()
    //  .attr('class', 'd3-tip')
    //  .html(cb);
  }

  return {
    extend: extend,
    getset: getset,
    endall: endall,
    tip: tip
  };

});
