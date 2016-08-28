(function (angular) {

  angular.module('testApp')
    .controller('testCtrl', function ($log, $scope, mservice) {

      $scope.test = 'something';

      $log.debug.setStyle('background:gray');

      $log.warn.setStyle('background:red');

      $log.warn('must be red');


      $log.debug('@s:20;c:green;b:black;w:800','hello from all',{a:'mms'});


      $log.info('some');
      $log.debug('hello to all!');

      $log.debug('one another debug');


      $log.debug('%cchange style', 'color:red');

      $log.debug('and tes this will be red');

      mservice.run();

    });





})(angular);