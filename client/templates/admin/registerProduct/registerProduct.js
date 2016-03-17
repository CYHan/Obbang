/**
 * Created by quki on 2015-11-25.
 */

var rctProductsTemp = new ReactiveArray();

Template.layoutRegisterProduct.events({
    'click a[id=btn-goInsert-registerProduct]': function (event, template) {
        Router.go('/insertProduct');
    },
    'click a[id=btn-goAdmin-registerProduct]': function (event, template) {
        Router.go('/admin');
    },
    'click button[id=add-product-registerProduct]': function (event, template) {

        var productsToInsert = _.map(rctProductsTemp.array(), function (item) {
            return _.pick(item, "_id", "quantity");
        });
        Meteor.call('addProductOnDiscount', productsToInsert);
        rctProductsTemp.clear();

        Router.go('/admin');
    }
});

Template.registerProduct.helpers({
    storeName: function () {
        return Meteor.user().profile.store.name;
    },
    storeId: function () {
        return Meteor.user().profile.store.id;
    },
    listRegisterProduct: function () {
        return this.dataRegister;
    },
    listTempProduct: function (){
        var quauntityTotal=0;
        $.each(rctProductsTemp,function(index,element){
            quauntityTotal +=element.quantity;
        });
        $("#bottom-type-registerProduct").html(rctProductsTemp.length+"개");
        $("#bottom-total-registerProduct").html(quauntityTotal+"개");
        return rctProductsTemp.list();
    }
});
Template.registerProduct.events({


});

Template.itemRegisterProduct.helpers({
    priceNormal: function () {
        console.log();
        return numberWithCommas(this.priceNormal);
    },
    priceMaxDiscount: function(){
        return numberWithCommas(this.priceMaxDiscount);
    }
});

Template.itemRegisterProduct.events({
    'click .add-temp-registerProduct': function (event, template) {
        var productId = this._id;
        var productItem = _.find(rctProductsTemp, function (item) {
            return item._id === productId;
        });

        if (productItem) {
            productItem.quantity++;
            rctProductsTemp.changed();
        }
        else {
            var itemToInsert = _.clone(this);
            _.extend(itemToInsert, {quantity: 1});
            rctProductsTemp.push(itemToInsert);
        }
    },
    'click button[name=remove-item-registerProduct]': function (event, template) {
        Meteor.call('removeProduct', this._id);
    }
});



Template.itemTempProduct.events({
    'click button[name=delete-temp-registerProduct]': function (event, template) {
        var productId = this._id;
        var productItem = _.find(rctProductsTemp, function (item) {
            return item._id === productId;
        });

        if (productItem.quantity === 1) {
            rctProductsTemp.remove(productItem);
        }
        else {
            productItem.quantity--;
            rctProductsTemp.changed();
        }
    }
});

/**
 * 3자리 마다 , 를 찍어준다.
 * @param number : 액수
 * @returns {string}
 */
function numberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
