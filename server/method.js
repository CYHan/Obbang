// Method internal functions




// 로그인 중인지 검사한다.
function authorize() {
    if (!Meteor.userId()) throw new Meteor.Error("not-authorized");
}

// 로그인 중인지 검사하고, 그리고 권한이 있는지 검사한다.
function authorizeWithRole(role) {
    if (!Meteor.userId() || !Roles.userIsInRole(Meteor.userId(), [role]))
        throw new Meteor.Error("not-authorized");
}

// 판매중인 상품을 취소한다.
function _cancelProductOnDiscount(productOnDiscountId) {
    ProductOnDiscount.update({_id: productOnDiscountId}, {
        $set: {isCancelled: true}
    });
}

// 주어진 판매중 상품이 구매 가능한지 확인한다.
function _isProdutOnDiscountAvailable(productOnDiscount, requiredQuantity) {
    return moment().isBefore(moment(productOnDiscount.endsAt)) &&
        !productOnDiscount.isCancelled &&
        (!requiredQuantity || productOnDiscount.quantityLeft >= requiredQuantity);
}

// Method implementations

Meteor.methods({
    /**
     * 서버의 현재 시각을 구한다.
     * @returns {Date} 서버 시각
     */
    getTime: function(){
        return new Date();
    },
    /**
     * 판매자 권한을 신청한다.
     * 사용자는 Admin_Pending이 된다.
     * @param {Object} store 점포 정보
     *     name, phone, password(암호화 된)를 반드시 포함한다.
     *     longitude, latitude는 선택적으로 포함할 수 있다.
     *     users의 store에 관한 schema를 지킬 것.
     */
    applyAdmin: function(store) {
        authorize();

        // clean params
        if (!store.name || !store.phone || !store.password) {
            throw new Meteor.Error("essential-field-not-exists");
        }
        store = _.omit(store, "id");

        // check role
        var userId = Meteor.userId();
        if (Roles.userIsInRole(userId, ["Admin_Pending"])) {
            throw new Meteor.Error("already-admin-pending");
        }

        // add role
        Roles.addUsersToRoles(userId, "Admin_Pending");

        // assign store info
        Meteor.users.update({_id: userId}, {
            $set: {
                "profile.store.name": store.name,
                "profile.store.phone": store.phone,
                "profile.store.password": store.password
            }
        });
    },
    /**
     * 사용자를 판매자로 승인한다.
     * 사용자는 {@link applyAdmin}을 호출했었으며, Admin_Pending 중이어야 한다.
     * 사용자는 Admin_Pending이 해제되고 Admin이 된다.
     * 필요 권한: Root
     * @param {String} userId 승인할 사용자의 _id
     */
    acceptAdmin: function(userId) {
        authorizeWithRole("Root");

        // check role
        if (!Roles.userIsInRole(userId, ["Admin_Pending"])) {
            throw new Meteor.Error("not-pending-admin");
        }

        // change role to Admin
        Roles.removeUsersFromRoles(userId, "Admin_Pending");
        Roles.addUsersToRoles(userId, "Admin");

        // assign store info
        var id = Meteor.users.find({"profile.store.id": {$exists: true}}).count();
        Meteor.users.update({_id: userId}, {
            $set: {"profile.store.id": id}
        });
    },
    /**
     * 사용자를 판매자로 승인 <b>거부</b>한다.
     * 사용자는 {@link applyAdmin}을 호출했었으며, Admin_Pending 중이어야 한다.
     * 사용자는 Admin_Pending이 해제되고 임시로 저장했던 store 정보가 사라진다.
     * 필요 권한: Root
     * @param {String} userId 승인 거부할 사용자의 _id
     */
    declineAdmin: function(userId) {
        authorizeWithRole("Root");

        // check role
        if (!Roles.userIsInRole(userId, ["Admin_Pending"])) {
            throw new Meteor.Error("not-pending-admin");
        }

        // remove role
        Roles.removeUsersFromRoles(userId, "Admin_Pending");

        // unset store info
        Meteor.users.update({_id: userId}, {
            $unset: {"profile.store": ""}
        });
    },
    /**
     * 신규 상품을 추가한다.
     * 필요 권한: Admin
     * @param {Object} product 새로 추가할 상품 정보
     *     name, priceNormal, priceMaxDiscount, discountDuration, storeId, imageId를 포함하고,
     *     Product에 관한 schema를 지킬 것. description은 추가하지 않아도 된다.
     *     또한, priceMaxDiscount는 priceNormal을 넘지 않아야 한다.
     */
    addProduct: function(product){
        authorizeWithRole("Admin");
        if (parseInt(product.priceNormal) < parseInt(product.priceMaxDiscount)) {
            throw new Meteor.Error("price-discount-exceeds-normal");
        }
        Product.insert(product);
    },
    /**
     * 올라간 상품을 삭제한다.
     * 필요 권한: Admin
     * @param {String} productId 삭제할 상품의 _id
     */
    removeProduct: function(productId){
        authorizeWithRole("Admin");
        Product.remove({_id: productId});
    },
    /**
     * 할인상품을 등록한다.
     * 필요 권한: Admin
     * @param {Array} items 등록할 상품의 정보 배열
     *     배열의 각 원소는 <b>단일 Product의</b> _id와, quantity를 포함하고,
     *     ProductOnDiscount에 관한 schema를 지킬 것.
     *     예: [{name: "~~", priceNormal: 123, quantity: 3 ...}, {name: "..." ...}]
     */
    addProductOnDiscount: function(items){
        authorizeWithRole("Admin");

        _.forEach(items, function(item){
            var itemWithQuantity = Product.findOne({_id: item._id});
            _.extend(itemWithQuantity, {quantity: item.quantity});
            itemWithQuantity = _.omit(itemWithQuantity, "_id"); // prevent duplicate _id


            ProductOnDiscount.insert(itemWithQuantity, function (error, _id) {
                var inserted = ProductOnDiscount.findOne(_id);
                Meteor.setTimeout(function () {
                    _cancelProductOnDiscount(inserted._id);
                }, 1000 * 60 * 60 * inserted.discountDuration);
            });
        });
    },
    /**
     * 등록한 할인상품을 취소한다.
     * 필요 권한: Admin
     * @param {String} productOnDiscountId 취소할 상품의 _id
     */
    cancelProductOnDiscount: function(productOnDiscountId){
        authorizeWithRole("Admin");
        _cancelProductOnDiscount(productOnDiscountId);
    },
    /**
     * 등록한 할인상품을 구매한다.
     * 구매한 수량만큼 ProductOnDisount에 등록한 상품의 수량이 감소하고, 구매 내역이 Trade에 추가된다.
     * @param {Array} items 구매할 상품의 정보 배열
     *     배열의 각 원소는 productOnDiscountId, quantity, price(한 상품 종류에 대한 가격)를 포함하고,
     *     ProductOnDiscount에 관한 schema를 지킬 것.
     *     예: [{productOnDiscountId: "~~", quantity: 1, price: 2500}, {productOnDiscountId: "..." ...}]
     * @param {String} password 구매 비밀번호, 암호화해서 보낼 것.
     */
    buyProduct: function(items, password){
        var productOnDiscountItems = [];

        // fetch productOnDiscount docs
        _.forEach(items, function (item) {
            var doc = ProductOnDiscount.findOne({_id: item.productOnDiscountId});
            productOnDiscountItems.push(doc);
            _.extend(item, {productOnDiscountName: doc.name, productOnDiscountImageId: doc.imageId});
        });

        var representativeItem = productOnDiscountItems[0];
        var store = Meteor.users.findOne({"profile.store.id": representativeItem.storeId}).profile.store;

        // check schema
        var trade = {
            storeId: store.id,
            storeName: store.name,
            products: items
        };
        check(trade, Trade.simpleSchema());

        // check password
        if (store.password !== password)
            throw new Meteor.Error("password-incorrect");

        _.forEach(items, function (item, index) {
            // check availability
            if (!_isProdutOnDiscountAvailable(productOnDiscountItems[index], item.quantity))
                throw new Meteor.Error("product not available");

            // deduct quantity
            ProductOnDiscount.update({_id: item.productOnDiscountId}, {
                $inc: {quantityLeft: -item.quantity}
            });
        });

        // add trade
        Trade.insert({
            storeId: store.id,
            storeName: store.name,
            products: items
        });
    },

    registerEmailForLanding :  function(email){
        LandingEmails.insert({
            email : email
        });
    }


});