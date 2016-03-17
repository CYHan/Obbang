// 사용자 Document를 구한다.
// publish 안에서는 사용자 _id 밖에 볼 수 없기 때문에 users를 참조해야 한다.
function getUser(userId) {
    return Meteor.users.findOne({_id: userId});
}

/**
 * 관리자 신청 대기중인 사용자를 제공한다.
 * 필요 권한: Root
 */
Meteor.publish("PendingAdminUsers", function(){
	if (Roles.userIsInRole(this.userId, ["Root"])) {
		return getPendingAdmin();
	}
});

/**
 * 해당 관리자가 등록한 상품을 제공한다.
 * 필요 권한: Admin
 */
Meteor.publish("ProductAdmin", function(){
	if (Roles.userIsInRole(this.userId, ["Admin"])) {
		var user = getUser(this.userId);
		return getProduct(user);
	}
});

/**
 * 구매자가 구매 가능한 모든 할인상품을 제공한다.
 */
Meteor.publish("ProductOnDiscountCustomer", function(){
	return getProductOnDiscountCustomer();
});

/**
 * 판매자가 등록중인 할인상품을 제공한다.
 * 수량이 남아있으며, 구매기한을 넘기지 않은 할인상품을 제공한다.
 */
Meteor.publish("ProductOnDiscountAdmin", function(){
	if (Roles.userIsInRole(this.userId, ["Admin"])) {
		var user = getUser(this.userId);
		return getProductOnDiscountAdmin(user);
	}
});

/**
 * 상품 이미지를 모두 제공한다.
 */
Meteor.publish("ProductImage", function(){
	return ProductImage.find();
});

/**
 * 지정한 기간 내의 구매내역을 구한다.
 * @param {Date} dateFrom 기간 시점
 * @param {Date} dateEnd 기간 종점
 */
Meteor.publish("TradeCustomer", function (dateFrom, dateTo) {
	var user = getUser(this.userId);
	return getTradeCustomer(user, dateFrom, dateTo);
});

/**
 * 지정한 기간 내의 판매내역을 구한다.
 * 필요 권한: Admin
 * @param {Date} dateFrom 기간 시점
 * @param {Date} dateEnd 기간 종점
 */
Meteor.publish("TradeAdmin", function (dateFrom, dateTo) {
	if (Roles.userIsInRole(this.userId, ["Admin"])) {
		var user = getUser(this.userId);
		return getTradeAdmin(user, dateFrom, dateTo);
	}
});
/**
 * landing 페이지에서 Email list를 만든다.
 */
Meteor.publish("LandingEmails", function () {
		return LandingEmails.find();
});