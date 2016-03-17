var keyAddedProducts = "addedProducts";
var keyPriceTotalNormal = "priceTotal";
var keyForModal = "forModal";
var keyCurrServerTime = "currServerTime";
var dataCustomer;
var intervalName;
var listIntervalName = [];

onProductOnDiscountSold = function (soldProductOnDiscount) {
    toastr.info(soldProductOnDiscount.name + ": " +
        soldProductOnDiscount.quantityLeft + "개 남았습니다.", "상품 팔림");
    initializeAllOfTemplate();
};

onProductOnDiscountRemoved = function (removedProductOnDiscount) {
    toastr.warning(removedProductOnDiscount.name + "이 판매 종료되었습니다.", "판매 종료");
    initializeAllOfTemplate();
};
Template.layoutCustomer.rendered = function () {

    intervalName = setInterval(countThisTmpl, 500);
    initializeAllOfTemplate();

};
Template.layoutCustomer.destroyed = function () {
    clearInterval(intervalName);
};
Template.layoutCustomer.events({
    'click button[id=btn-usecoupon-customer]': function (event, tmpl) {

        // 쿠폰쓰기 버튼 클릭 시점에 Session("forModal")에 check 된 listProduct 저장.
        var listProductChecked = getListProductChecked();
        Session.set(keyForModal, listProductChecked);
        // modal show.
        $('#modal-modalCustomer').modal();
        $('#modal-modalCustomer').on('hidden.bs.modal', function () {
            initializeAllOfTemplate();
        });
        $('#btn-buy-modalCustomer').text('쿠폰쓰기');
        changeModalView();
    }
});

Template.customer.onCreated(function () {

});

Template.customer.rendered = function () {
    Meteor.call("getTime", function (err, date) {
        if (!err) {
            Session.set(keyCurrServerTime, date.getTime());
        } else {
            alert(err);
            console.error("METEOR GET TIME error : " + err);
        }
    });
};

Template.customer.helpers({

    listStore : function () {
        var listStore = [];

        dataCustomer = this.dataCustomer;

        $.each(dataCustomer, function (index, element) {
            var objStoreTemp = {};
            objStoreTemp.storeName = element.storeName;
            objStoreTemp.storeId = element.storeId;
            listStore.push(objStoreTemp);
        });

        // list element(store) 중복 제거.
        var listUnique = _.uniq(listStore, function (item, key, storeId) {
            return item.storeId;
        });

        return listUnique;
    }
});

Template.customer.events({
    'click .tbl-itemProductCustomer': function (event, tmpl) {
        Router.go('detail.show', {_id: this._id});
    }
});

Template.itemStoreCustomer.helpers({
    listProduct: function (storeId) {
        var listProduct = [];

        $.each(dataCustomer, function (index, element) {
            var storeIdThis = element.storeId;
            if (storeId == storeIdThis) {
                listProduct.push(element);
            }
        });

        return listProduct;
    }
});

Template.itemProductCustomer.onCreated(function () {
    this.rctPriceCurrent = new ReactiveVar(0);
});

Template.itemProductCustomer.onRendered(function () {

    var endsAtTime = this.data.endsAt.getTime();
    var tmplInstance = this;

    var intervalName = setInterval(function () {
        calculateTimeAndPrice(endsAtTime, tmplInstance);
    }, 500);
    // 개별 item 들을 식별해서 count 를 제어하기 위함.
    var objThisTmpl = {};
    objThisTmpl.intervalName = intervalName;
    objThisTmpl.productId = this.data._id;
    listIntervalName.push(objThisTmpl);
});

Template.itemProductCustomer.destroyed = function () {

    // item 이 destroy 되면 count 중지.
    var listThis = _.where(listIntervalName, {productId: this.data._id});
    clearInterval(listThis[0].intervalName);
    listIntervalName = _.without(listIntervalName, _.findWhere(listIntervalName, {productId: this.data._id}));
};


Template.itemProductCustomer.helpers({
    priceCurrent: function () {
        return Template.instance().rctPriceCurrent.get();
    },
    priceTotal : function () {
        var addedProducts = Session.get(keyAddedProducts);
        var quantity = addedProducts ? (addedProducts[this._id] ? addedProducts[this._id] : 1) : 1;
        return quantity * Template.instance().rctPriceCurrent.get();
    }
});

Template.itemProductCustomer.events({
    'click [group=btn-check]': function (event, tmpl) {
        event.stopImmediatePropagation();
        event.preventDefault();
        var buttonCheck = tmpl.find("#check-" + this._id);
        if ($(buttonCheck).attr("disabled")) {
            return;
        }
        var valueBefore = $(buttonCheck).attr("checked");
        var isChecked = getValueAfter(valueBefore);

        if (isChecked) {
            setProductChecked(this._id, tmpl);
            addProductToSessionData(this._id);
            changeTotalPrices(this.priceNormal, true);
            setInnerHTMLQuantityForProduct(this._id, 1, tmpl);
            disableOtherStores(this.storeId);
        } else {
            var quantity = setProductUnchecked(this._id, tmpl);
            changeTotalPrices(this.priceNormal * quantity, false);
            setInnerHTMLQuantityForProduct(this._id, 0, tmpl);
            enableOtherStores();
        }
    },

    'click [group=btn-plus]': function (event, tmpl) {
        event.stopImmediatePropagation();
        event.preventDefault();
        var addedProducts = Session.get(keyAddedProducts);
        if (typeof addedProducts != "undefined") {
            var quantity = addedProducts[this._id];
            if (quantity == this.quantityLeft) {
                return;
            }
        }
        var productQuantity = addProductToSessionData(this._id);
        changeTotalPrices(this.priceNormal, true);

        setProductChecked(this._id, tmpl);

        setInnerHTMLQuantityForProduct(this._id, productQuantity, tmpl);
        disableOtherStores(this.storeId);
    },
    'click [group=btn-minus]': function (event, tmpl) {
        event.stopImmediatePropagation();
        event.preventDefault();
        var addedProducts = Session.get(keyAddedProducts);
        var isNoneSessionData = typeof addedProducts == "undefined" || 0 == addedProducts[this._id]
            || "undefined" == typeof addedProducts[this._id];
        if (isNoneSessionData) {
            return;
        }
        var productQuantity = removeProductFromSessionData(this._id);
        changeTotalPrices(this.priceNormal, false);

        if (0 == productQuantity) {
            setProductUnchecked(this._id, tmpl);
        }

        setInnerHTMLQuantityForProduct(this._id, productQuantity, tmpl);
        enableOtherStores();
    }
});


Template.modalCustomer.helpers({
    discountPercentage: function () {
        var discountPercentage = 0;
        var priceTotalNormal = Session.get(keyPriceTotalNormal);
        var listForModal = Session.get(keyForModal);
        var priceTotal = 0;
        $.each(listForModal, function (index, element) {
            priceTotal += element.quantity * element.price;
        });
        if(priceTotalNormal != 0){
            discountPercentage = Math.round((1 - priceTotal / priceTotalNormal) * 100);
        }

        return discountPercentage;
    },
    priceTotalNormal: function () {
        var priceTotalNormal = Session.get(keyPriceTotalNormal);
        return numberWithCommas(priceTotalNormal);
    },

    listProduct: function () {
        var listProduct = Session.get(keyForModal);
        $.each(listProduct, function (index, element) {
            element.price = numberWithCommas(element.price);
        });
        return listProduct;
    },
    priceTotal: function () {
        var listProduct = Session.get(keyForModal);
        var priceTotal = 0;
        $.each(listProduct, function (index, element) {
            priceTotal += element.quantity * element.price;
        });
        return numberWithCommas(priceTotal);
    }
});


Template.modalCustomer.events({

    'click button[id= btn-buy-modalCustomer]': function (event, tmpl) {
        var modalBtnText = $('#btn-buy-modalCustomer').text();
        if (modalBtnText == '확인') {
            var pwd = '';
            $("#group-pwd :input").each(function () {
                pwd += $(this).val();
            });
            pwd = Package.sha.SHA256(pwd);
            var items = _.map(getListProductChecked(), function (item) {
                return _.pick(item, "productOnDiscountId", "quantity", "price");
            });
            Meteor.call('buyProduct', items, pwd, function (err, success) {
                if (err) {
                    alert(err);
                }
            });

            $('#modal-modalCustomer').modal('hide');

        } else if (modalBtnText == '쿠폰쓰기') {

            $('#btn-buy-modalCustomer').text('확인');
            changeModalView();
        }
    }
});

function setInnerHTMLQuantityForProduct(productId, productQuantity, tmpl) {
    var label = tmpl.find("#label-" + productId);
    label.innerHTML = productQuantity;
}
function setProductChecked(productId, tmpl) {
    $('#unchecked-' + productId).addClass('hidden');
    $('#checked-' + productId).removeClass('hidden');

    var buttonCheck = tmpl.find("#check-" + productId);
    $(buttonCheck).attr("checked", true);
}

function setProductUnchecked(productId, tmpl) {
    $('#unchecked-' + productId).removeClass('hidden');
    $('#checked-' + productId).addClass('hidden');

    var buttonCheck = tmpl.find("#check-" + productId);
    $(buttonCheck).attr("checked", false);
    var addedProducts = Session.get(keyAddedProducts);
    var quantity = addedProducts[productId];
    addedProducts[productId] = 0;
    Session.set(keyAddedProducts, addedProducts);
    setInnerHTMLQuantityForProduct(productId, 1, tmpl);
    return quantity;
}

// 총 가격 합산 ( priceNormal들의 합)
function changeTotalPrices(priceNormal, isAdd) {

    setCheckedQuantity();

    var priceTotalNormal = Session.get(keyPriceTotalNormal);

    if (!priceTotalNormal) {
        priceTotalNormal = 0;
    }

    if (isAdd) {
        priceTotalNormal += priceNormal;
    } else {
        priceTotalNormal -= priceNormal;
    }
    Session.set(keyPriceTotalNormal, priceTotalNormal);
}

function removeProductFromSessionData(productId) {
    var addedProducts = Session.get(keyAddedProducts);
    var product = addedProducts[productId];
    if (0 < product) {
        addedProducts[productId] = product - 1;
    }
    Session.set(keyAddedProducts, addedProducts);
    return addedProducts[productId];
}
function addProductToSessionData(productId) {
    var addedProducts = Session.get(keyAddedProducts);
    if (typeof addedProducts == "undefined") {
        addedProducts = {};
        addedProducts[productId] = 1;
    } else {
        var product = addedProducts[productId];
        if (typeof product == "undefined" || product == 0) {
            addedProducts[productId] = 1;
        } else {
            addedProducts[productId] = product + 1;
        }
    }

    Session.set(keyAddedProducts, addedProducts);
    return addedProducts[productId];
}

function enableOtherStores() {
    var addedProducts = Session.get(keyAddedProducts);
    var keys = Object.keys(addedProducts);
    for (var i = 0; i < keys.length; i++) {
        if (0 < addedProducts[keys[i]]) return;
    }
    if (0 == length) {
        enableOtherStoreButtons($("a[group='btn-check']"));
        enableOtherStoreButtons($("a[group='btn-plus']"));
        enableOtherStoreButtons($("a[group='btn-minus']"));
    }
}

function enableOtherStoreButtons(buttons) {

    $.each(buttons, function (index, element) {
        $(element).attr("disabled", false);
    });
}

function disableOtherStores(storeId) {
    disableOtherStoreButtons(storeId, $("a[group='btn-check']"));
    disableOtherStoreButtons(storeId, $("a[group='btn-plus']"));
    disableOtherStoreButtons(storeId, $("a[group='btn-minus']"));
}

function disableOtherStoreButtons(storeId, buttons) {

    $.each(buttons, function (index, element) {
        if ($(element).attr("store") != storeId) {
            $(element).attr("disabled", true);
        }
    });
}

function getValueAfter(valueBefore, event) {
    var valueAfter;
    if (typeof valueBefore == "undefined" || !valueBefore) {
        valueAfter = true;
    } else {
        valueAfter = false;
    }
    return valueAfter;
}

/**
 * Modal 의 Password input 내부의 값들을 모두 비운다.
 */
function initPwdInputText() {
    $('#group-pwd').find('input').val('');
}
/**
 * Modal 의 view 를 동적으로 변화시킨다.
 */
function changeModalView() {
    var modalBtnText = $('#btn-buy-modalCustomer').text();
    if (modalBtnText == "쿠폰쓰기") {
        initPwdInputText();
        $('#group-pwd').hide();
        $('#group-price-total').show();

    } else if (modalBtnText == "확인") {
        $('#group-price-total').hide();
        $('#group-pwd').show();
    }
}

/**
 * customer template 에서 0.5초마다 실행되는 함수
 */
function countThisTmpl() {

    countServerTime();
    sumPriceCurrents();

}


/**
 * Session내부의
 * Server 시간을 0.5초 단위로 초기화한다.
 */
function countServerTime(){
    var tempServerTime = Session.get(keyCurrServerTime) + 500;
    Session.set(keyCurrServerTime, tempServerTime);
}
/**
 * 선택된 상품의 가격의 합을 구한다.
 */
function sumPriceCurrents(){

    var addedProducts = Session.get(keyAddedProducts);
    var sum = 0;
    if (typeof addedProducts != 'undefined') {
        var keyArray = Object.keys(addedProducts);

        for (var i = 0; i < keyArray.length; i++) {
            var productId = keyArray[i];
            var quantity = addedProducts[productId];
            var unitPrice = $('#priceCurrent-' + productId).html();

            if (typeof unitPrice != 'undefined') {
                sum += Math.ceil(unitPrice / 10) * 10 * quantity;
            } else {
                sum = 0;
            }
        }
        $('#price-total-customer').html(numberWithCommas(sum) + "원");
    }
    if (sum == 0) {
        $('#navbar-bottom-customer').addClass('hidden');
    } else {
        $('#navbar-bottom-customer').removeClass('hidden');
    }
}
/**
 * 현재 체크 된 product 정보를 Session 으로부터 가져온다.
 * @returns {Array} : product 객체들의 배열
 */
function getListProductChecked() {
    var addedProducts = Session.get(keyAddedProducts);
    var listProductChecked = [];

    if (typeof addedProducts != "undefined") {

        var keyArray = Object.keys(addedProducts);
        $.each(keyArray, function (index, productId) {
            if (addedProducts[productId] != 0) {
                var objTemp = {};
                var unitPrice = $('#priceCurrent-' + productId).html();
                var name = $('#name-' + productId).html();
                objTemp.name = name;
                objTemp.productOnDiscountId = productId;
                objTemp.quantity = addedProducts[productId];
                objTemp.price = Math.ceil(unitPrice / 10) * 10;
                listProductChecked.push(objTemp);
            }
        });
    }
    return listProductChecked;
}
/**
 * Template의 View, Session data 들을 초기화한다.
 */
function initializeAllOfTemplate() {

    var addedProducts = Session.get(keyAddedProducts);
    Session.set(keyForModal, []);
    Session.set(keyPriceTotalNormal, 0);
    if (typeof addedProducts != "undefined") {

        /*Object.keys(addedProducts).forEach(function (key) {

            addedProducts[key] = 0;

        });*/
        Session.set(keyAddedProducts,{});
    }
    $('a[group = btn-check]').attr("checked", false);

    //check button view 초기화 (채워진 원 <-> 빈 원)
    $('a[group = btn-check] :first-child').removeClass("hidden");
    $('a[group = btn-check] :last-child').addClass("hidden");

    _.each($('.count-product'), function (tag) {
        $(tag).html(0);
    });
    setCheckedQuantity();
    enableOtherStores();
}

/**
 * 3자리 마다 , 를 찍어준다.
 * @param number : 액수
 * @returns {string}
 */
function numberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
/**
 * 현재 체크된 상품의 갯수를 set 한다.
 */
function setCheckedQuantity() {
    var addedProducts = Session.get(keyAddedProducts);
    var checkedQuantity = 0;
    if (typeof addedProducts != "undefined") {

        var keyArray = Object.keys(addedProducts);
        $.each(keyArray, function (index, productOnDiscountId) {
            if (addedProducts[productOnDiscountId] != 0) {
                checkedQuantity += addedProducts[productOnDiscountId];
            }
        });
    }
    $("#quantity-checked-customer").html(checkedQuantity + "개");
}

/**
 * countdown 을 위한 시간과 시간에 따른 가격변화를 계산한다.
 * 서버시간을 이용한다.
 * @param endsAtTime : 상품이 종료되는 시간, time(milliseconds)형식.
 * @param templateInstance
 */
function calculateTimeAndPrice(endsAtTime, tmplInstance) {
    var timeDuration = endsAtTime - Session.get(keyCurrServerTime);
    tmplInstance.$('.countdown').html(moment(timeDuration).utc().format("H:mm:ss"));
    var yIntercept = tmplInstance.data.priceMaxDiscount;  // y절편
    var gradient = (tmplInstance.data.priceNormal - yIntercept) / (tmplInstance.data.discountDuration * 3600);  //기울기
    var totalSec = timeDuration / 1000;
    var priceCurrent = gradient * totalSec + yIntercept;
    priceCurrent = Math.round(priceCurrent);  // 소수점은 반올림
    tmplInstance.rctPriceCurrent.set(priceCurrent);
    //console.log(priceCurrent);
}
