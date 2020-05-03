
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
    onCartUpdated: function(){
      console.log("cart updated")
      // $.ajax({
      //   type:'GET',
      //   url: '/cart',
      //   context: document.body,
      //   success: function(context){
      //     let
      //       $dataCartContents = $(context).find('.js-cart-page-contents'),
      //       dataCartHTML = $dataCartContents.html(),
      //       dataCartItemcount = $dataCartContents.attr('data-cart-item-count'),
      //       $miniCartContents = $('.js-mini-cart-contents'),
      //       $cartItemCount = $(".js-cart-item-count");

      //       $cartItemCount.text(dataCartItemcount);
      //       $miniCartContents.html(dataCartHTML);

      //       if(parseInt(dataCartItemcount) > 0){
      //         openCart()
      //       }else{
      //         closeCart();
      //       }
      //   }
      // });
    },
    onError: function(XMLHttpRequest, textStatus){
        let data = XMLHttpRequest.responseJSON;
        alert(data.status + '-' + data.message + ':' + data.description)
    },
    init:function(){
      $(document).on('submit', addtoCartFormSelector, ajaxify.onAddToCart)
    }
  }

  ajaxify.init()



});
