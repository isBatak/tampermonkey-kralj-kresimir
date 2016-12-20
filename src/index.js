// ==UserScript==
// @name         Kralj kresimir
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Simplifies ordering on 'Kralj Kresimir Catering' page
// @author       Ivica Batinic
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js
// @match        http://www.s-1.hr/dnevni.html.php
// ==/UserScript==


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
        '<td></td>' +
        '<td>UKUPNO:</td>' +
        '<td id="total" style="text-align:center; font-weight:bold; font-size: 20px;">0,00 kn</td>' +
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
    var $quantity = $('<input/>', { type: 'number', min: 0, step: 1, val: 0 , style: 'width: 20px; display: inline-block; float: right; margin-left: 5px;' });

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
      console.log(event);
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
          console.log(quantity);
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
          console.log(id, store.getState()[id].active);
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

    console.log(store.getState());

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