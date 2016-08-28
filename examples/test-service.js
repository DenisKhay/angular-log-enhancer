angular.module('testApp')
  .factory('mservice', function($log) {
    $log = $log.getInstance('hello from mserv');
    $log.debug.setStyle('background:green');

    $log.debug('should be green');

    return {
      run:function(){
        $log.debug('the individual style test')
      }
    };

  });