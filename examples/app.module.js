angular.module('testApp', ['angularLogEnhancer'])
  .config(function(angularLogEnhancerProvider){
    console.log(angularLogEnhancerProvider._options);
    angularLogEnhancerProvider.setOptions({time:false});
}).run(function(angularLogEnhancer){
  console.log(angularLogEnhancer);
angularLogEnhancer.setOptions({quickStyle: true})
});