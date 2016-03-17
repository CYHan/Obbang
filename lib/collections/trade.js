Trade = new Mongo.Collection("Trade");

Trade.attachSchema(new SimpleSchema({
    customerId: {
        type: String,
        optional: true
    },
    storeId: {
        type: Number
    },
    storeName: {
        type: String,
        max: 50
    },
    products: {
        type: [Object],
        minCount: 1
    },
    "products.$.productOnDiscountId": {
        type: String
    },
    "products.$.productOnDiscountName": {
        type: String,
        max: 50,
        min: 1
    },
    "products.$.productOnDiscountImageId": {
        type: String
    },
    "products.$.quantity": {
        type: Number,
        min: 1
    },
    "products.$.price": {
        type: Number,
        min: 0
    },
    createdAt: {
        type: Date,
        optional: true,
        autoValue: function(){if (this.isInsert) return new Date()}
    }
}));

Trade.allow({
    insert: function () {return false},
    update: function () {return false},
    remove: function () {return false}
});

getTradeCustomer = function(userId, dateFrom, dateTo) {
    return Trade.find({
        customerId: userId,
        createdAt: {$gte: dateFrom, $lte: dateTo}
    });
};

getTradeAdmin = function(user, dateFrom, dateTo) {
    return Trade.find({
        storeId: user.profile.store.id,
        createdAt: {$gte: dateFrom, $lte: dateTo}
    });
};