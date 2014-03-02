// **The default configuration module for the bar.bar module**

define('bar/config',[
    "base_config",
    "utils/utils",
  ], function(base_config, utils) {
    
  var config = {
    orientation: 'vertical',
  };

  return utils.extend(base_config, config);
  
});

