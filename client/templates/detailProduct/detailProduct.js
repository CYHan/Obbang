/**
 * Created by quki on 2015-12-08.
 */
var keyCurrServerTime = "currServerTime";
var timer;

Template.detailProduct.onRendered(function () {
    timer = setInterval(refresh, 500);

    Meteor.call("getTime", function (err, date) {
        if (!err) {
            Session.set(keyCurrServerTime, date.getTime());
        } else {
            alert(err);
            console.error("METEOR GET TIME error : " + err);
        }
    });

    var endsAtTime = this.data.item.endsAt.getTime();
    var templateInstance = this;

    setInterval(function () {
        calculateTimeAndPrice(endsAtTime, templateInstance);
    }, 500);
});

Template.detailProduct.onCreated(function () {
    this.rctPriceCurrent = new ReactiveVar(0);
});

Template.detailProduct.destroyed = function () {
    clearInterval(timer);
};


Template.detailProduct.helpers({
    priceCurrent: function () {
        return numberWithCommas(Template.instance().rctPriceCurrent.get());
    }
});

function refresh() {

    countServerTime();

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
 * countdown 을 위한 시간과 시간에 따른 가격변화를 계산한다.
 * 서버시간을 이용한다.
 * @param endsAtTime : 상품이 종료되는 시간, time(milliseconds)형식.
 * @param templateInstance
 */
function calculateTimeAndPrice(endsAtTime, templateInstance) {
    var timeDuration = endsAtTime - Session.get(keyCurrServerTime);
    templateInstance.$('.countdown').html(moment(timeDuration).utc().format("H:mm:ss"));
    var yIntercept = templateInstance.data.item.priceMaxDiscount;  // y절편
    var gradient = (templateInstance.data.item.priceNormal - yIntercept) / (templateInstance.data.item.discountDuration * 3600);  //기울기
    var totalSec = timeDuration / 1000;
    var priceCurrent = gradient * totalSec + yIntercept;
    priceCurrent = Math.round(priceCurrent);  // 소수점은 반올림
    templateInstance.rctPriceCurrent.set(priceCurrent);

}

/**
 * 3자리 마다 , 를 찍어준다.
 * @param number : 액수
 * @returns {string}
 */
function numberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}