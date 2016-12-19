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
        '<td id="totla" style="text-align:center; font-weight:bold; font-size: 20px;">0,00 kn</td>' +
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
          }
          newState[action.id] = item;
          return newState;

        default:
          return state;
      }
    };

    store.createStore(reducer);

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

    /**
     *
     */
    function injectControls($element, id) {
      var $orderNumber = $element.find(selector.orderNumber);
      var $checkboxClone = $checkbox.clone(true);
      $checkboxClone.on('click', function() {
        store.dispatch({
          type: 'TOGGLE',
          id: id
        });
      });
      $orderNumber.prepend($checkboxClone);

      var $mealTitle = $element.find(selector.mealTitle);

      var $price = $element.find(selector.price).eq(1);
      $price.append($quantity.clone(true));

      store.dispatch({
        type: 'ADD',
        id: id,
        quantity: 0,
        name: $orderNumber.text() + ' ' + $mealTitle.text(),
        price: $price.text()
      });

      var currentActiveState;
      store.subscribe(function(){
        var previousActiveState = currentActiveState;
        var currentActiveState = store.getState()[id].active;
        if (currentActiveState !== currentActiveState) {
          console.log(state[id]);
        }
      });

      $element.on('click', function() {
        store.dispatch({
          type: 'TOGGLE',
          id: id
        });
        console.log(store.getState()[id].active);
      });
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