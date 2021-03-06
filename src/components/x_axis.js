define('components/x_axis', [
  "d3",
  'utils'
], function (d3, utils) {
  'use strict';

  function _transitionAxisV (__) {
    return this
      .attr("transform", "translate(" + __.offset_x + "," + __.yScale.range()[0] + ")")
      .call(__.xAxis);
  }

  function _transitionAxisH (__) {
    return this
      .attr("transform", "translate(" + __.offset_x + "," + __.h + ")")
      .call(__.xAxis);
  }

  function transitionAxis (__) {
    if (__.orientation == 'vertical') {
      return _transitionAxisV.call(this, __);
    } else if (__.orientation == 'horizontal') {
      return _transitionAxisH.call(this, __);
    } else {
      throw new Error('orientation must be one of: vertical, horizontal');
    } 
  }

  function setAxis (__) {
    __.xAxis = utils.setAxisProps(__.x_axis, __.xScale);
    return __;
  }

  function drawXAxis (selection, transition, __, data) {
    var g,
        __ = setAxis(__);
    // Select the g element, if it exists.
    g = selection.selectAll("g.x.axis").data([data]);
    // Otherwise, create the skeletal axis.
    g.enter().append("g").attr("class", "x axis");
    g.exit().remove();
    // Update the axis.
    transitionAxis.call(transition.selectAll('.x.axis'), __);
    return g;
  } 

  return {
    drawXAxis: drawXAxis,
    setAxis: setAxis,
    transitionAxis: transitionAxis,
  };

});