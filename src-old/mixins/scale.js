define('mixins/scale', [
  "d3",
  "utils/mixins",
], function (d3, utils_mixins) {

  function _getRange (axis, __) {
    if ( axis == 'x') {
      return [0, __.w];
    } else if ( axis == 'y') {
      return [__.h, 0];
    }
  }

  // It assumes the data is correctly sorted.
  // TODO: Guard against axis argument == null or undefined
  function _getDomain (data, axis) {
    var d0 = Infinity, 
        d1 = 0, 
        index = axis == 'x' ? 0 : 1;
    data.forEach( function (dataset, i) {
      if (dataset[0][index] < d0) {
        d0 = dataset[0][index];
      }
      if (dataset[dataset.length - 1][index] > d1) {
        d1 = dataset[dataset.length - 1][index];
      }
    });
    return [d0, d1];
  }

  function _setScale (scale_type) {
    switch (scale_type) {
      case undefined:
        return;
      case 'ordinal':
        return d3.scale.ordinal;
      case 'linear':
        return d3.scale.linear;
      case 'time':
        return d3.time.scale;
      default:
        throw new Error('scale_type `'
          + scale_type
          + '` is not supported. Supported types are: ordinal, linear, time' );
    }
  }

  function setScales () {
    var __ = this.__;
    __.xScale = this._setScale(__.x_scale)();
    __.yScale = this._setScale(__.y_scale)();
    return this;
  }

  //TODO: throw on wrong input
  function _parseScaleBounds (bounds, __) {
    var min_max = getMinMaxValues(__.data);
    bounds = bounds.split(',');
    if (bounds[0] == 'min') { 
      bounds[0] = min_max.min; 
    } else {
      bounds[0] = +bounds[0];
    }
    if (bounds[1] == 'max') {
      bounds[1] = min_max.max; 
    } else {
      bounds[1] = +bounds[1];
    }
    return bounds;
  }

  // Sets the range and domain for the linear scale.
  function _applyLinearScale (range, __) {
    var scale_bounds = __.scale_bounds,
        min_max = _parseScaleBounds(scale_bounds, __);  
    return this.range(range).domain(min_max);
  }

  function _applyTimeScale (range, __) {
    // see [bl.ocks.org/mbostock/6186172](http://bl.ocks.org/mbostock/6186172)
    var data = __.data,
        domain = _getDomain(data, 'x'),
        t1 = domain[0],
        t2 = domain[1],
        offset = __.date_offset,
        t0,
        t3;
    if (__.date_offset) {
      t0 = d3.time[offset].offset(t1, -1);
      t3 = d3.time[offset].offset(t2, +1);
      return this
        .domain([t0, t3])
        .range([t0, t3].map(d3.time.scale()
          .domain([t1, t2])
          .range([0, __.w])));
    } else {
      return this.range(range).domain(domain);
    }
  }

  // Sets the range and domain for the ordinal scale.
  function _applyOrdinalScale (range, __) {
    var data = __.x_axis_data || __.data;  // FIXME this hack!
    return this
      .rangeRoundBands(range, __.padding)
      .domain( __.data[0].map( function(d) { return d[0]; } ) );
  }

  function _applyScale (axis, scale_type, __) {
    var range = _getRange(axis, __);
    switch (scale_type) {
      case 'ordinal':
        return _applyOrdinalScale.call(this, range, __);
      case 'linear':
        return _applyLinearScale.call(this, range, __);
      case 'time':
        return _applyTimeScale.call(this, range, __);
      case undefined:
        return new Error('scale cannot be undefined');
      default:
        throw new Error('scale_type ' 
                         + scale_type 
                         + ' not supported. Is it misspelled?' );
    }
  }

  function applyScales () {
    var __ = this.__;
    this.applyScale.call( __.xScale, 'x', __.x_scale, __ );
    this.applyScale.call( __.yScale, 'y', __.y_scale, __ );
    return this;
  }

  return function () {

    this.setScales = setScales;
    this.applyScales = applyScales;
    this.applyScale = _applyScale;
    // private methods, exposed for testing
    this._setScale = _setScale;
    this._applyLinearScale = _applyLinearScale;
    this._getRange = _getRange;
    return this;
  };

});

