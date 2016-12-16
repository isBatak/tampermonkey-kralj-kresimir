// ==UserScript==
// @name         Kralj kresimir
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Simplifies ordering on 'Kralj Kresimir Catering' page
// @author       Ivica Batinic
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js
// @match        http://www.s-1.hr/dnevni.html.php
// ==/UserScript==

(function() {
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
    function injectControls($element) {
      var $orderNumber = $element.find(selector.orderNumber);
      $orderNumber.prepend($checkbox.clone(true));

      var $mealTitle = $element.find(selector.mealTitle);

      var $price = $element.find(selector.price).eq(1);
      $price.append($quantity.clone(true));
    }

    $rows.each(function(index, element) {
      var $element = $(element);

      injectControls($element);

      console.log(index, rowsCount - 1);
      if (index == rowsCount - 1) {
        addAdditionalRows($element);
      }
    });

    initButtons();
})();