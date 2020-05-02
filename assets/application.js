
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
        $addToCartButton = $form.find('#add-to-cart-button');

        if(canAddtoCart){
          $id.val(selectedVariant.id);
          $addToCartButton.prop('disabled', false);
        }
        else{
          $id.val('');
          $addToCartButton.prop('disabled', true)
        }
    },
    init: function(){
      $(document).on('change', productOptionSelector, productForm.onProductOptionChanged);
      $(document).on('form:change', addtoCartFormSelector, productForm.validate)
    }
  };


  productForm.init();

});
