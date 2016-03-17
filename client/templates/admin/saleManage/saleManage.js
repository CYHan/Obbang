//var keyCurrServerDate = "keyCurrServerDate";
var isSet;
var isSet2;
Template.saleManage.onCreated(function () {
    /*Meteor.call("getTime", function (err, serverDate) {
     if(!err){
        Session.set(keyCurrServerDate,serverDate);
     }else{
        console.error(err);
     }
     });
    this.tempsaleManage = new ReactiveVar(getTradeAdmin(Meteor.user(), moment().startOf('day').toDate(), Session.get(keyCurrServerDate).fetch());
    this.predate = new ReactiveVar(moment(Session.get(keyCurrServerDate)));*/
    isSet = false;
    isSet2 = false;
    this.reactiveTempsaleManage = new ReactiveVar([]);
    this.reactivePredate = new ReactiveVar([]);
});

Template.saleManage.helpers({
    nameStore: function () {
        return this.saleManage[0].storeName;
    },
    dateLastEdit: function () {
        return moment(this.saleManage[this.saleManage.length - 1].createdAt.getTime()).format("h:mm MMM YYYY");
    },
    listSaleProduct: function () {
        if(!isSet) {
            var dateChange = moment(moment(this.currentDate).subtract(1, 'day'));
            dateChange.set('hour',0);
            dateChange.set('minute',0);
            dateChange.set('second',0);
            Template.instance().reactiveTempsaleManage.set(getTradeAdmin(Meteor.user(), dateChange.toDate(), this.currentDate).fetch());
            isSet = true;
        }
        return Template.instance().reactiveTempsaleManage.get();
    },
    saleSumAll: function () {
        var sum = 0;
        for (var i = 0; i < this.saleManage.length; i++) {
            for (var j = 0; j < this.saleManage[i].products.length; j++) {
                sum += this.saleManage[i].products[j].price * this.saleManage[i].products[j].quantity;
            }
        }
        return numberWithCommas(sum);
    },
    saleSumTerm: function () {
        var reactiveArray = Template.instance().reactiveTempsaleManage.get();
        var totalPrice = 0;
        $.each(reactiveArray, function (index, element) {
            $.each(element.products, function (index, ele) {
                totalPrice += ele.price * ele.quantity;
            })
        })
        return numberWithCommas(totalPrice);
    },
    termPre: function () {
        if (!isSet2) {
            var tempPreDate = moment(this.currentDate);
            Template.instance().reactivePredate.set(tempPreDate);
            isSet2 = true;
        }
        var a = Template.instance().reactivePredate.get();
        return a.format("YYYY.M.D");
    },
    termToday: function () {
        var a = this.currentDate;
        return moment(a).format("YYYY.M.D");
    }
});

Template.saleManage.events({
    'click button[name=today]': function (evl, tmpl) {
        $('button').removeClass('curr');
        $(evl.target).addClass('curr');
        var dateChange = moment(moment(tmpl.data.currentDate).subtract(1, 'day'));
        dateChange.set('hour',0);
        dateChange.set('minute',0);
        dateChange.set('second',0);
        Template.instance().reactiveTempsaleManage.set(getTradeAdmin(Meteor.user(), dateChange.toDate(), tmpl.data.currentDate).fetch());
        var tempPreDate = moment(tmpl.data.currentDate);
        Template.instance().reactivePredate.set(tempPreDate);
    },
    'click button[name=week]': function (evl, tmpl) {
        $('button').removeClass('curr');
        $(evl.target).addClass('curr');
        var dateChange = moment(moment(tmpl.data.currentDate).subtract(1, 'week'));
        dateChange.set('hour',0);
        dateChange.set('minute',0);
        dateChange.set('second',0);
        Template.instance().reactiveTempsaleManage.set(getTradeAdmin(Meteor.user(), dateChange.toDate(), tmpl.data.currentDate).fetch());
        var tempPreDate = moment(tmpl.data.currentDate);
        tempPreDate.subtract(7, 'days');
        Template.instance().reactivePredate.set(tempPreDate);
    },
    'click button[name=month]': function (evl, tmpl) {
        $('button').removeClass('curr');
        $(evl.target).addClass('curr');
        var dateChange = moment(moment(tmpl.data.currentDate).subtract(1, 'month'));
        dateChange.set('hour',0);
        dateChange.set('minute',0);
        dateChange.set('second',0);
        Template.instance().reactiveTempsaleManage.set(getTradeAdmin(Meteor.user(), dateChange.toDate(), tmpl.data.currentDate).fetch());
        var tempPreDate = moment(tmpl.data.currentDate);
        tempPreDate.subtract(1, 'month');
        Template.instance().reactivePredate.set(tempPreDate);
    },
    'click button[name=threemonth]': function (evl, tmpl) {
        $('button').removeClass('curr');
        $(evl.target).addClass('curr');
        var dateChange = moment(moment(tmpl.data.currentDate).subtract(3, 'month'));
        dateChange.set('hour',0);
        dateChange.set('minute',0);
        dateChange.set('second',0);
        Template.instance().reactiveTempsaleManage.set(getTradeAdmin(Meteor.user(), dateChange.toDate(),tmpl.data.currentDate).fetch());
        var tempPreDate = moment(tmpl.data.currentDate);
        tempPreDate.subtract(3, 'month');
        Template.instance().reactivePredate.set(tempPreDate);
    }
});

function numberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}