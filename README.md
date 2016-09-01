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

1. Possibility to sign log messages for each of your modules
2. Hiding/suppression any application log messages from browser console with regexp or using fragments of messages as id
3. Possibility to set individual css style for group of messages.
4. Using option quickStyle you may quickly set individual css styles for any log message

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

And it will works as well:

```javascript

app.run(function(angularLogEnhancer){

    angularLogEnhancer.setOptions({
        affectToAllLogs: true, //default value
        showOnly: ['http-interceptor', /keychain/i],
        //or
        //suppressOnly: [/authori?zation/i, 'queue-manager', 'something-else'],
        quickStyle: true, //default false
        time: true //default - false
        });
})
```


#### More about features:

##### 1. Possibility to sign log messages for each of your modules

Just add next code at the top of your module

```javascript

$log = $log.getInstance('db-connector');
```

and all $log functions will print signed messages from this module like that:

```
---
[db-connector]> my debug message
---
[db-connector]> my log message
---
log without sign from another module
---
sync process finished..
---
another action logged successfully
---
[db-connector]> db connector log message again

```


##### 2. Hiding/suppression any application log messages from browser console with regexp or using fragments of messages as id





---

*sorry writing readme is in process