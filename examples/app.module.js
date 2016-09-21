(function (window, document, angular, undefined) {

  'use strict';



  var testApplication = angular.module('testApp', ['angularLogEnhancer']);



  testApplication
    .config(config)
    .run(run);



  config.$inject = ['angularLogEnhancerProvider'];
  function config(angularLogEnhancerProvider) {

    console.log(angularLogEnhancerProvider._options);

    angularLogEnhancerProvider.setOptions({
      time: false,
      suppressOnly: ['[hello from mserv]']
    });

  }


  run.$inject = ['angularLogEnhancer'];
  function run(angularLogEnhancer) {
    console.log(angularLogEnhancer);
    angularLogEnhancer.setOptions({quickStyle: true});
  }



})(window, window.document, window.angular);

