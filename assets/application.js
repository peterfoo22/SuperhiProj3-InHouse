
$(document).ready(function(){

  //add to cart form
  let
    addtoCartFormSelector = '#add-to-cart-form',
    productOptionSelector = addtoCartFormSelector +' [name*=option]';

  let productForm = {
    onProductOptionChanged: function(event){
      let
        $form = $(this).closest(addtoCartFormSelector),
        selectedVariant = productForm.getActiveVariant($form);
        $form.trigger('form:change', [selectedVariant])
    },
    getActiveVariant: function($form){
      let
        variants = JSON.parse(decodeURIComponent($form.attr('data-variants'))),
        formData = $form.serializeArray(),
        formOptions = {
          option1:null,
          option2:null,
          option3:null
        },
        selectedVariant = null;

      $.each(formData, function(index, item){
        if (item.name.indexOf('option')!= -1){
          formOptions[item.name] = item.value;
        }
      });

      $.each(variants, function(index, variant){
        if(variant.option1 === formOptions.option1 && variant.option2 === formOptions.option2 && variant.option3 === formOptions.option3){
          selectedVariant = variant;
          return false;
        }
      })

      return selectedVariant;
    },
    validate: function(event, selectedVariant){
      let
        $form = $(this),
        hasVariant = selectedVariant != null,
        canAddtoCart = hasVariant && selectedVariant.inventory_quantity > 0
        $id = $form.find('.js-variant-id'),
        $addToCartButton = $form.find('#add-to-cart-button'),
        $price = $form.find('.js-price'),
        formattedVariantPrice =0,
        priceHTML ="";

        if(hasVariant){
          formattedVariantPrice = "$" + (selectedVariant.price/100).toFixed(2);
          priceHTML = '<span class = money>' + formattedVariantPrice + '</span>';
          window.history.replaceState(null, null, '?variant=' + selectedVariant.id)

        }
        else{
          priceHTML = $price.attr('data-default-price')
        }

        if(canAddtoCart){
          $id.val(selectedVariant.id);
          $addToCartButton.prop('disabled', false);
        }
        else{
          $id.val('');
          $addToCartButton.prop('disabled', true);
        }

        $price.html(priceHTML);
    },
    init: function(){
      $(document).on('change', productOptionSelector, productForm.onProductOptionChanged);
      $(document).on('form:change', addtoCartFormSelector, productForm.validate)
    }
  };


  productForm.init();

  let ajaxify = {
    onAddToCart: function(event){
      event.preventDefault();
      $.ajax({
        type: 'POST',
        url:'/cart/add.js',
        data: $(this).serialize(),
        dataType:'json',
        success: ajaxify.onCartUpdated,
        error: ajaxify.onError
      });
    },
    onLineRemoved: function(event){
        event.preventDefault();

        let
          $removeLink = $(this),
          removeQuery = $removeLink.attr('href').split('change?')[1];

          $.post('/cart/change.js', removeQuery, ajaxify.onCartUpdated, 'json');

    },
    onCartUpdated: function(){
      console.log("cart updated")
      $.ajax({
        type:'GET',
        url: '/cart',
        context: document.body,
        success: function(context){
          let
            $dataCartContents = $(context).find('.js-cart-page-contents'),
            dataCartHTML = $dataCartContents.html(),
            dataCartItemcount = $dataCartContents.attr('data-cart-item-count'),
            $miniCartContents = $('.js-mini-cart-contents'),
            $cartItemCount = $(".js-cart-item-count");

            $cartItemCount.text(dataCartItemcount);
            $miniCartContents.html(dataCartHTML);

            if(parseInt(dataCartItemcount) > 0){
              ajaxify.openCart()
            }else{
              ajaxify.closeCart();
            }
        }
      });
    },
    onError: function(XMLHttpRequest, textStatus){
        let data = XMLHttpRequest.responseJSON;
        alert(data.status + '-' + data.message + ':' + data.description)
    },
    onCartButtonClick: function(event){
        event.preventDefault();

        let isCartOpen = $('html').hasClass('mini-cart-open');

        if(!isCartOpen){
          ajaxify.openCart();
        }
        else{
          ajaxify.closeCart();
        }
    },
    openCart: function(){
      $('html').addClass('mini-cart-open');
    },
    closeCart: function(){
      $('html').removeClass('mini-cart-open');
    },
    init:function(){
      $(document).on('submit', addtoCartFormSelector, ajaxify.onAddToCart);

     $(document).on('click', '#mini-cart .js-remove-line', ajaxify.onLineRemoved);

      $(document).on('click', '.js-cart-link', ajaxify.onCartButtonClick)
    }
  }

  ajaxify.init()

  //Quantity fields
  let
    quantityFieldSelector = '.js-quantity-field',
    quantityButtonSelector = '.js-quantity-button',
    quantityPickerSelector = '.js-quantity-picker',
    quantityPicker = {
      onButtonClick: function(event){
        let
          $button = $(this),
          $picker = $button.closest(quantityPickerSelector),
          $quantity = $picker.find('.js-quantity-field'),
          quantityValue = parseInt($quantity.val())
          max = $quantity.attr('max') ? parseInt($quantity.attr('max')) : null;

          if($button.hasClass('plus') && (max === null || quantityValue + 1 <= max)){
            $quantity.val(quantityValue + 1).change()
          }
          else if ($button.hasClass('minus')){
            $quantity.val(quantityValue - 1).change()
          }
      },
      onChange: function(event){
        let
          $field = $(this),
          $picker = $field.closest(quantityPickerSelector),
          $quantity = $picker.find('.js-quantity-text'),
          shouldDisableMinus = parseInt(this.value) === parseInt($field.attr('min')),
          $minusbutton = $picker.find('.js-quantity-button.minus'),
          shouldDisableplus = parseInt(this.value) === parseInt($field.attr('max')),
          $plusbutton =$picker.find('.js-quantity-button.plus');

          $quantity.text(this.value);

        if (shouldDisableMinus){
          $minusbutton.prop('disabled', true);
        }
        else if ($minusbutton.prop('disabled') === true) {
          $minusbutton.prop('disabled', false);
        }


        if (shouldDisableplus){
          $plusbutton.prop('disabled', true);
        }
        else if ($plusbutton.prop('disabled') === true) {
          $plusbutton.prop('disabled', false);
        }
      },
      init: function(){
        $(document).on('click', quantityButtonSelector , quantityPicker.onButtonClick);

        $(document).on('change', quantityFieldSelector , quantityPicker.onChange);
      }

    };

  quantityPicker.init();

});
