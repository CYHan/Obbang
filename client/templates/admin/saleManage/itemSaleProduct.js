Template.itemSaleProduct.events({

});

Template.itemSaleProduct.helpers({
    listSaleProductDetail : function(){
    return this.products;
},
    dateParent : function(){
        return moment(Template.parentData(1).createdAt.getTime()).format("YYYY.M.D");
    },
    timeParent : function() {
        return moment(Template.parentData(1).createdAt.getTime()).format("h:mm:ss a");
    },
    moneySale : function() {
        return numberWithCommas(this.quantity*this.price);
    }
});
function numberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}