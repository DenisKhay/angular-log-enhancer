/**
 * angular 1.4.3
 *
 * created by Denis Khaidarshin denis.khaydarshin@gmail.com
 *
 * it allows to much extend opportunities of logging with angular $log component -
 * one of the main features of it is the possibility to supress some of $log messages.
 * Next, now possible to sign all logs from some particular module with unique identifier,
 * that can help you very well for simplify debugging.
 * For more information please see the README and enjoy with angular :) Good Luck and enjoy your life, Dude :)
 *
 * License: MIT
 */


;(function (window, document, angular, undefined) {



  'use strict';






  angular.module('angularLogEnhancer', [])
    .provider('angularLogEnhancer', angularLogEnhancerProvider)
    .config(config);





  if (!window.console || !window.console.warn) {
    window.console = {};
    window.console.warn = function () {
    }
  }




  /**
   * @ngdoc function constructor
   * @name angularLogEnhancerProvider
   *
   * @descripton
   * provides method for setting options from app.config()
   *
   * @constructor
   */
  function angularLogEnhancerProvider(){

    var that = this;

    that._options = {

      affectToAllLogs: true,

      showOnly: [],

      suppressOnly: [],

      quickStyle: true,

      time: true

    };

    that.setOptions =

    that.$get = function(){
      return {
        setOptions:setOptions
      };
    };

    function setOptions(opt){

      if(angular.isObject(opt)){
        angular.extend(that._options, opt)
      }

    }


  }





  /**
   * @ngdoc function
   * @name config
   *
   * @description
   * please see angular doc
   *
   * @param $provide
   * @param angularLogEnhancerProvider
   */
  function config($provide, angularLogEnhancerProvider) {



    $provide.decorator('$log', ['$delegate', function ($delegate) {



      var options = angularLogEnhancerProvider._options;



      var methodsNames = ['log', 'info', 'warn', 'debug', 'error'];




      /**
       * copy (actually, not exact copy - i know) all instant methods to here
       * @type {Object}
       */
      var instant = methodsNames.reduce(function (prev, next) {
        prev[next] = $delegate[next];
        return prev;
      }, {});





      /**
       *
       * @ngdoc method
       * @name getInstance
       * @methodOf $delegate ($log)
       *
       * @description
       * get/create collection of extended logging function
       * I.e. it just extend existing logging functions and returns it
       *
       * @param contextMsg {String} - custom message that will printed with each log message
       *
       * @returns {Object} like this {log:fn,debug:fn,warn:fn,info:fn ..}
       */
      $delegate.getInstance = function (contextMsg) {
        return methodsNames.reduce(function (prev, next) {
          prev[next] = extendLogFn(instant[next], contextMsg);
          return prev;
        }, {});
      };





      if (options.affectToAllLogs) {
        methodsNames.forEach(function (v) {
          $delegate[v] = extendLogFn(instant[v]);
        });
      } else {
        methodsNames.forEach(function (v) {
          $delegate[v].setStyle = dummy;
        });
      }





      //----------------------------------------------------------------------------------------------------------------
      // functions
      //----------------------------------------------------------------------------------------------------------------





      /**
       *
       * @ngdoc function
       * @name extendLogFn
       *
       * @description
       * extends logging functions
       *
       * @param loggingFunc
       * @param contextMsg
       * @returns {logFn}
       */
      function extendLogFn(loggingFunc, contextMsg) {

        var styles = null;


        function logFn() {


          var time = options.time ? timeLogging() + '::' : '';
          var contextMessage = contextMsg ? '[' + contextMsg + ']> ' : '';
          var hasStyles = false;





          var args = Array.prototype.slice.call(arguments, 0);





          if (typeof args[0] !== 'string') {
            args = [''].concat(args);
          }





          /**
           * log styling
           * @type {boolean}
           */

          var hasStyling = /^\%c/.test(args[0]) && typeof args[1] === 'string';
          var quickStyleApplied = /^@/.test(args[0]) && options.quickStyle;

          if (hasStyling) {

            hasStyles = true;
            args[0] = args[0].replace(/^\%c/, '');

          } else if (quickStyleApplied) {
            //format: @s:18;[c:blue;][w:600;][b:red;]
            var style = unfoldStyle(args[0]);

            if (style) {
              hasStyles = true;
              args.splice(0, 1);
              args.splice(1, 0, style);
            }

          } else if (styles) {

            hasStyles = true;
            args.splice(1, 0, styles);

          } else {
            hasStyles = false;
          }




          /**
           * final assembling first argument of the log function
           * @type {string}
           */
          args[0] = (hasStyles ? '%c' : '') + ('---\n' + time + contextMessage) + args[0];



          if (isNotSupressed(args[0])) {
            loggingFunc.apply(null, args);
          }



        }




        logFn.setStyle = function (style) {
          styles = style;
        };

        //trick for passing tests when option affectToAllLogs enabled
        logFn.logs = [];



        return logFn;
      }





      /**
       *
       * @ngdoc function
       * @name unfoldStyle
       *
       * @description
       * it unfolds shorten styles to normal css styles
       * notice that available only for:
       * font-size in px - s,
       * color - c,
       * font-weight - w,
       * background-color - b
       *
       * shorten styles should have format like this (wo hash):
       * # @s:18;c:red;w:600;b:gray
       *
       * @param style {string} short style
       *
       * @returns {string|boolean}
       */
      function unfoldStyle(style) {

        var stringStyle = '';
        var scw = {
          size: /s:(\d+)/i,
          color: /c:([^;\s]+)/i,
          weight: /w:([^;\s]+)/i,
          background: /b:([^;\s]+)/i
        };

        style = style.replace(/\s+/g, '');

        var size = style.match(scw.size);
        var color = style.match(scw.color);
        var weight = style.match(scw.weight);
        var background = style.match(scw.background);

        if (size && size[1]) {
          stringStyle += 'font-size:' + size[1] + 'px;';
        }

        if (color && color[1]) {
          stringStyle += 'color:' + color[1] + ';';
        }

        if (weight && weight[1]) {
          stringStyle += 'font-weight:' + weight[1] + ';';
        }

        if (background && background[1]) {
          stringStyle += 'background-color:' + background[1] + ';';
        }

        return stringStyle || false;

      }





      /**
       *
       * @ngdoc function
       * @name dummy
       *
       * @description
       * just show notification for wrong use setStyle function
       *
       * @returns undefined
       *
       */
      function dummy() {
        console.warn('AngularLogExtender :: Please enable "Affect to all log" option, or use getInstance. See readme!');
      }




      /**
       *
       * @ngdoc function
       * @name isNotSupressed

       * @description
       * checks permissions for publish the string to browser console
       * permissions defined in 2 arrays:
       * positive - options.showOnly
       * negative - options.suppressOnly
       *
       *
       * @param str {String} - target string
       *
       * @returns {Boolean}
       */
      function isNotSupressed(str) {

        if (options.showOnly.length) {
          return check(str, options.showOnly);
        }

        if (options.suppressOnly.length) {
          return !check(str, options.suppressOnly);
        }

        return true;
      }




      /**
       *
       * @ngdoc function
       * @name check

       * @description
       * checks whether matches for given string to anything in given array
       *
       * @param str {String} target string
       * @param arr {Array} array with patterns for compare. Array may contain string or RegExp or both types
       *
       * @returns {Boolean}
       */
      function check(str, arr) {

        var ln = arr.length;

        while (ln--) {
          var one = arr[ln];

          if (!(one instanceof RegExp)) {
            one = new RegExp(one);
          }

          if (one.test(str)) {
            return true;
          }
        }

        return false;

      }




      /**
       *
       * @ngdoc function
       * @name simpleFormatter
       *
       * @description
       * it simple formats given value from (for example) 4 to 004 - so it just prepends required count of given symbols
       * to the value
       *
       * @param val {string|number} target value for format
       * @param count {number} - number of symbols that must be added
       * @param symbol {string|number}
       *
       * @returns {string|number}
       */
      function simpleFormatter(val, count, symbol) {

        val = (val).toString();

        if (val.length >= count) {
          return val;
        }

        var add = count - val.length;

        return multiply(add, symbol) + val;

      }




      /**
       *
       * @ngdoc function
       * @name multiply
       *
       * @description
       * just returns string that consists of given symbol $(who) that repeating multiple times
       *
       * @param multiplier {number}
       * @param who {string}
       *
       * @returns {string}
       */
      function multiply(multiplier, who) {
        return new Array(multiplier).join(who) + who;
      }




      /**
       *
       * @ngdoc function
       * @name timeLogging
       *
       * @description
       * returns current time in next format : hh:mm:ss SSS
       *
       * @returns {string}
       */
      function timeLogging() {

        var dateTime = new Date(),

          hours = simpleFormatter(dateTime.getHours(), 2, 0),
          minutes = simpleFormatter(dateTime.getMinutes(), 2, 0),
          seconds = simpleFormatter(dateTime.getSeconds(), 2, 0),
          milliseconds = simpleFormatter(dateTime.getMilliseconds(), 3, 0);


        return hours + ':' + minutes + ':' + seconds + ' ' + milliseconds;

      }



      return $delegate;

    }]);




  }



})(window, document, window.angular);