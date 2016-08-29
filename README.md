# Angular Log Enhancer


Module for extending built in angular $log using $provide.decorator

#### How to install:

Using **bower**:
```
bower install angular-log-enhancer
```

Using **node package manager**:

```
npm install angular-log-enhancer
```

#### Features:

* Hiding/suppression any application log messages from browser console with regexp or using fragments of messages as id
* Possibility to sign log messages for each of your modules
* Possibility to set individual css style for group of messages.
* Using option quickStyle you may quickly set individual css styles for any log message

Please see description for each option below


#### How to use:

Connect module to your project and setup in code:

```javascript
var app = angular.module('your_app', ['angularLogEnhancer'])

app.config(function(angularLogEnhancerProvider){

    angularLogEnhancerProvider.setOptions({
        affectToAllLogs: true, //default value
        showOnly: ['http-interceptor', /keychain/i],
        //or
        //suppressOnly: [/authori?zation/i, 'queue-manager', 'something-else'],
        quickStyle: true, //default false
        time: true //default - false
        });

})


```