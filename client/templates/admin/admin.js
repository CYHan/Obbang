var keyCurrServerTime = "currServerTime";
var intervalName;
var listIntervalName = [];

Template.layoutAdmin.rendered = function () {

	intervalName= setInterval(countServerTime, 500);
	/**
	 * 0.5초 단위로 지속적으로 countServerTime 함수를 호출한다.
	 */

};
Template.layoutAdmin.destroyed = function () {
	clearInterval(intervalName);
	/**
	 *  interval을 clear한다.
	 */
};

Template.tabAdmin.events({
	'click a[name=tab-registerProduct]':function(){
		$("a[name='tab-saleManage']").removeClass('current');
		$("a[name='tab-registerProduct']").addClass('current');
		/**
		 * 등록상품과 판매관리 중에서 현재 누른것의 css를 처리하기위해서 class이름을 조정한다. 즉,
		 * 등록상품버튼을 누르면 판매관리에 current를 제거하고 등록상품의 current를 추가함으로써 유동적인
		 * css 처리가 가능하도록 한다.
		 */
	},
	'click a[name=tab-saleManage]':function(){
		var  timeCurrent =Session.get(keyCurrServerTime);
		Router.go('sale.show', {_id: timeCurrent});
		$("a[name='tab-registerProduct']").removeClass('current');
		$("a[name='tab-saleManage']").addClass('current');
		/**
		 * 위의 설명과 동일. 판매관리에 대해서 이다.
		 */
	}
});

Template.admin.rendered = function(){

	$('#navtop-go-admin').addClass('hidden');
	$('#navtop-go-customer').removeClass('hidden');
	/**
	 *  1번쨰로 누르면 customer가 뜨도록
	 *  그다음으로 누르면 admin이 뜨도록 위와 같은 방법으로 css를 제어한다.
	 */
	Meteor.call("getTime",function(err,date){
		if(!err){
			Session.set(keyCurrServerTime,date.getTime());
		}else{
			console.error("METEOR GET TIME error : "+err);
		}
	});
	/**
	 *  Meteor.method에서 정의되어있는 method중 getTime이라는 method를 호출한다.
	 *  이떄, Session을 추가적으로 사용하며, 구해진 시간을 keyCurrServerTime에 집어 넣는다.
	 */
};

Template.admin.helpers({
	listProduct : function(){
		return this.dataAdm;
	}

	/**
	 *  admin helper로써, listProduct함수를 정의하며, 호출하여 사용할 수 있도록 한다.
	 *  여기서 의문 .. - this란 정확히 무엇인가?
	 */

});



Template.itemProductAdmin.onCreated(function(){
	this.priceCurrent = new ReactiveVar(0);
	/**
	 *  itemProductAdmin 가 create 될 때, 해당 객체의 priceCurrent값이 초기화 된다.
	 */
});

Template.itemProductAdmin.onRendered(function(){

	var endsAtTime = this.data.endsAt.getTime();
	var tmplInstance= this;

	var intervalName = setInterval(function(){
		calculateTimeAndPrice(endsAtTime,tmplInstance);
	},500);
	var objThisTmpl={};
	objThisTmpl.intervalName=intervalName;
	objThisTmpl.productId=this.data._id;
	listIntervalName.push(objThisTmpl);     //// object.push 를 통해서 마치 백터의 pushback과 같은형식으로 삽입이 가능하다.
   });

/**
 *   itemProductAdmin의 onrendered, 여기서 this 는 collection이며, this.data로 접근할 때 도 있다(렌더드에서)
 *   이떄, 라우터에서 넘어온 것 이며, setInterval 안의 함수가 0.5초마다 호출된다. 이때 setinterval 자체는 한번만 호출되므로
 *   intervalname은 등록된 상품 마다 그것에대한 이름을 가지게 되며, 이것은 각각 리스트마다 시간및 가격 정보를 처리하기위함이다.
 *
 */


Template.itemProductAdmin.destroyed = function () {

	var listThis = _.where(listIntervalName,{productId : this.data._id});  /// _.where 를 통해서 listIntervalName 리스트중 productId가 일치하는것만 가지고 온다.
	clearInterval(listThis[0].intervalName);
	listIntervalName = _.without(listIntervalName,_.findWhere(listIntervalName, {productId: this.data._id}));
};          /// _.without 을 통해 배열중에 iD가 일치하는것을 제외하고 가지고온다.

Template.itemProductAdmin.helpers({
	priceCurrent: function () {
		return numberWithCommas(Template.instance().priceCurrent.get());
	}
});

Template.itemProductAdmin.events({
	'click a[name=remove]' : function(){
		Meteor.call("cancelProductOnDiscount", this._id);
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

/**
 * countdown 을 위한 시간과 시간에 따른 가격변화를 계산한다.
 * 서버시간을 이용한다.
 * @param endsAtTime : 상품이 종료되는 시간, time(milliseconds)형식.
 * @param tmplInstance
 */
function calculateTimeAndPrice(endsAtTime,tmplInstance){
	var timeDuration = endsAtTime-Session.get(keyCurrServerTime);
	tmplInstance.$('.countdown').html(moment(timeDuration).utc().format("H:mm:ss"));
	var yIntercept = tmplInstance.data.priceMaxDiscount;  // y절편
	var gradient = (tmplInstance.data.priceNormal - yIntercept) / (tmplInstance.data.discountDuration * 3600);  //기울기
	var totalSec = timeDuration/1000;
	var priceCurrent = gradient * totalSec + yIntercept;
	priceCurrent = Math.round(priceCurrent);  // 소수점은 반올림
	tmplInstance.priceCurrent.set(priceCurrent);
	//console.log(priceCurrent);
}
/**
 * Session내부의
 * Server 시간을 0.5초 단위로 초기화한다.
 */
function countServerTime() {
	var serverTime = Session.get(keyCurrServerTime)+500;
	Session.set(keyCurrServerTime,serverTime);
}

