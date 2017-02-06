// ==UserScript==
// @name         Kralj kresimir
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Simplifies ordering on 'Kralj Kresimir Catering' page
// @author       Ivica Batinic
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js
// @match        http://www.s-1.hr/dnevni.html.php
// ==/UserScript==

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var Store = function() {
  this.state = null;
  this.reducer = null;
  this.listeners = [];
};

Store.prototype.dispatch = function(action) {
  this.state = this.reducer(this.state, action);
  this.listeners.forEach(function(listener) {
    listener();
  });
};

Store.prototype.createStore = function(reducer) {
  this.reducer = reducer;
  this.state = this.reducer(null, {});
}

Store.prototype.getState = function() {
  return this.state;
}

Store.prototype.subscribe = function(listener) {
  this.listeners.push(listener);
  return function unsubscribe() {
    var index = this.listeners.indexOf(listener);
    this.listeners.splice(index, 1);
  }
};

module.exports = Store;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var Store = __webpack_require__(0);

(function(store) {
    'use strict';

    var selector = {
      orderNumber: '.rednibroj',
      mealTitle: '.jelo',
      price: '.cjena'
    }

    var $infoRow = $('' +
      '<tr>' +
        '<td></td>' +
        '<td>UKUPNO:</td>' +
        '<td id="total" colspan="2" style="text-align:right; font-weight:bold; font-size: 20px;">0,00 kn</td>' +
      '</tr>' +
    '');
    var $total = $infoRow.find('#total');

    var $actionsRow = $('' +
      '<tr>' +
        '<td id="actions" colspan="4"></td>' +
      '</tr>' +
    '');
    var $actions = $actionsRow.find('#actions');

    var $buttonOrder = $('<button/>', { text: 'ORDER!' });

    var $checkbox = $('<input/>', { type: 'checkbox' });
    var $quantity = $('<input/>', { type: 'number', min: 0, step: 1, val: 0 , style: 'width: 30px; display: inline-block; float: right; margin-left: 5px;' });

    var $rows = $('.rednibroj').parent('tr');
    var rowsCount = $rows.length;

    var reducer = function(state, action){
      if (!state) {
        state = {};
      }
      switch (action.type) {
        case 'ADD':
          var newState = Object.assign({}, state);
          newState[action.id] = {
            active: false,
            quantity: action.quantity,
            name: action.name,
            price: action.price
          }
          return newState;

        case 'TOGGLE':
          var newState = Object.assign({}, state);
          var item = newState[action.id];
          if (item) {
            item.active = !item.active;
            item.quantity = item.active ? 1 : 0;
          }
          newState[action.id] = item;
          return newState;

        case 'QUANTITY_CHANGE':
          var newState = Object.assign({}, state);
          var item = newState[action.id];
          if (item) {
            item.quantity = action.quantity;
            if (action.quantity == 0) {
              item.active = false;
            } else {
              item.active = true;
            }
          }
          return newState;

        default:
          return state;
      }
    };

    store.createStore(reducer);

    /**
     *
     */
    function observeStore(store, select, onChange) {
      var currentState;

      function handleChange() {
        var nextState = select(store.getState());
        if (nextState !== currentState) {
          currentState = nextState;
          onChange(currentState);
        }
      }

      var unsubscribe = store.subscribe(handleChange);
      handleChange();
      return unsubscribe;
    }

    /**
     *
     */
    function onOrder(event) {
      var body = 'Jela:\r\n';
      var state = store.getState();

      console.log('NARUDZBA:\r\n');
      for (var item in state) {
        if (state.hasOwnProperty(item)) {
          if(state[item].active) {
            console.log(state[item].name + ' - komada ' + state[item].quantity);
            body += state[item].name + ' - komada ' + state[item].quantity + '\r\n\r\n';
          }
        }
      }

      body += 'Adresa:\r\nStrojarska 22, Infinum, 13. kat';

      var mailOpener = document.createElement('a');
      mailOpener.setAttribute('href', 'mailto:s-1@inet.hr?Subject=Narudzba&Body=' + encodeURIComponent(body));
      mailOpener.click();
    }

    /**
     *  Initialize buttons event handlers and appends them to actions container
     */
    function initButtons() {
      $buttonOrder.on('click', onOrder);

      $actions
        .append($buttonOrder);
    }

    /**
     *  Adds additional rows in the end of a table.
     */
    function addAdditionalRows($element) {
      $element
        .after($actionsRow)
        .after($infoRow);
    }

    function priceToFloat(price) {
      return parseFloat(price.replace(',', '.').replace(/ kn/g, ''));
    }

    function floatToPrice(float) {
      return float.toFixed(2).replace('.', ',') + ' kn';
    }

    function getTotalPrice() {
      var state = store.getState();
      var total = 0.00;
      for (var prop in state) {
        var item = state[prop];
        if (item.active) {
          total += item.price * item.quantity;
        }
      }
      return floatToPrice(total);
    }

    /**
     *
     */
    function injectControls($element, id) {
      var $orderNumber = $element.find(selector.orderNumber);
      var $checkboxClone = $checkbox.clone(true);
      $checkboxClone.change(function() {
        store.dispatch({
          type: 'TOGGLE',
          id: id
        });
      });
      $orderNumber.prepend($checkboxClone);

      var $mealTitle = $element.find(selector.mealTitle);

      var $price = $element.find(selector.price).eq(1);
      $price.css('width','auto');
      var $quantityClone = $quantity.clone(true);
      $quantityClone.on('change textInput input', function(event) {
        var $target = $(event.target);
        store.dispatch({
          type: 'QUANTITY_CHANGE',
          id: id,
          quantity: $target.val()
        });
      });
      $price.append($quantityClone);

      store.dispatch({
        type: 'ADD',
        id: id,
        quantity: 0,
        name: $orderNumber.text() + ' ' + $mealTitle.text(),
        price: priceToFloat($price.text())
      });

      var unsubscribeQuantityObserver = observeStore(
        store,
        function select(state) {
          return state[id].quantity
        },
        function onChange(quantity) {
          $quantityClone.val(quantity);
          $total.text(getTotalPrice());
        }
      );

      var unsubscribeActiveObserver = observeStore(
        store,
        function select(state) {
          return state[id].active
        },
        function onChange(active) {
          $checkboxClone.prop('checked', active);
        }
      );
    }

    $rows.each(function(index, element) {
      var $element = $(element);

      injectControls($element, index);

      if (index == rowsCount - 1) {
        addAdditionalRows($element);
      }
    });

    $rows
      .css('cursor', 'pointer')
      .hover(
        function(event){
          $(event.currentTarget).css('text-decoration', 'underline');
        },
        function (event) {
          $(event.currentTarget).css('text-decoration', '');
        }
      );

    initButtons();
})(new Store());

/***/ })
/******/ ]);