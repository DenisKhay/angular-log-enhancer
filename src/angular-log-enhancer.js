/**
 * angular 1.4.3
 *
 * created by Denis Khaidarshin @madlizard
 *
 * it allows to much extend opportunities of logging with angular $log component -
 * one of the main features of it is the possibility to supress some of $log messages.
 * Next, now possible to sign all logs from some particular module with unique identifier,
 * that can help you very well for simplify debugging.
 * For more information please see the README and enjoy with angular :) Good Luck and enjoy your life, Dude :)
 *
 * License: MIT
 */


(function (window, document, angular, undefined) {


  'use strict';


  angular.module('angularLogEnhancer', [])
    .provider('angularLogEnhancer', angularLogEnhancerProvider)
    .config(config);





  if (!window.console || !window.console.warn) {
    window.console = {};
    window.console.warn = function () {
    };
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
  function angularLogEnhancerProvider() {

    var that = this;

    that._options = {

      affectToAllLogs: true,
      showOnly: [],
      suppressOnly: [],
      quickStyle: false,
      quickStyleMark: '@@',
      time: false,
      stringify: false
    };

    that.setOptions = setOptions;

    that.$get = function () {
      return {
        setOptions: setOptions
      };
    };

    function setOptions(opt) {

      if (angular.isObject(opt)) {
        angular.extend(that._options, opt);
      }

    }


  }




  config.$inject = ['$provide', 'angularLogEnhancerProvider'];

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
          $delegate[v].resetStyle = dummy;
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

        var mainStyle = null;


        function logFn() {


          var time = timeLogging();
          var contextMessage = contextMsg ? '[' + contextMsg + ']> ' : '';

          var args = Array.prototype.slice.call(arguments, 0);


          if (typeof args[0] !== 'string') {
            args = [''].concat(args);
          }





          /**
           * log styling
           * @type {boolean}
           */

          var style = getStyles(args);

          if (style) {
            args = cleanStyles(args);
          } else if (mainStyle) {
            style = mainStyle;
          }




          /**
           * final assembling first argument of the log function
           * @type {string}
           */
          args[0] = (time ? time + '::' : '') + contextMessage + args[0];


          if (isNotSupressed(args[0])) {

            if (options.stringify) {
              args = [stringify(args)];
            } else
            if (style) {

              args[0] = '%c' + args[0];
              args.splice(1, 0, style);

            }
            args[0] = '---------------\n' + args[0];
            loggingFunc.apply(null, args);
          }



        }




        logFn.setStyle = function (style) {
          mainStyle = style;
        };

        logFn.resetStyle = function () {
          mainStyle = '';
        };

        //trick for passing tests when option affectToAllLogs enabled
        logFn.logs = [];



        return logFn;
      }



      function stringify(arr) {

        return arr.reduce(function (prev, next, i, arr) {

          var last = (arr.length - 1) === i;

          return prev + JSON.stringify(next, function (key, value) {
              if (typeof value === 'function') {
                return value + '';
              }
              return value;
            }, 2) + (last ? '' : '\n---\n');
        }, '');


      }

      function cleanStyles(args) {
        var arg = args.slice();

        var quickStyleMark = new RegExp('^' + options.quickStyleMark);
        var quickStyle = quickStyleMark.test(args[0]) && options.quickStyle;

        if (/^%c/.test(arg[0])) {
          arg[0] = arg[0].replace(/^\s?%c/, '');
          arg.splice(1, 1);
        }

        if (quickStyle) {
          arg.splice(0, 1);
        }

        return arg;
      }

      function getStyles(arg) {

        var args = arg.slice();

        var quickStyleMark = new RegExp('^' + options.quickStyleMark);
        var hasStyling = /^%c/.test(args[0]) && typeof args[1] === 'string';
        var quickStyleApplied = quickStyleMark.test(args[0]) && options.quickStyle;

        if (hasStyling) {


          args[0] = args[0].replace(/^%c/, '');
          return args[1];

        } else if (quickStyleApplied) {
          //format: @@s:18;[c:blue;][w:600;][b:red;]
          var style = unfoldStyle(args[0]);

          return style || null;

        }

        return null;

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

        var stringStyle = '',
          size,
          color,
          weight,
          background,
          scw = {
            size: /s:(\d+)/i,
            color: /c:([^;\s]+)/i,
            weight: /w:([^;\s]+)/i,
            background: /b:([^;\s]+)/i
          };

        style = style.replace(/\s+/g, '');

        size = style.match(scw.size);
        color = style.match(scw.color);
        weight = style.match(scw.weight);
        background = style.match(scw.background);

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

        var ln = arr.length,
          one;

        while (ln--) {
          one = arr[ln];

          if (!(one instanceof RegExp)) {
            one = new RegExp(one.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
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
        if (!options.time) {
          return '';
        }

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