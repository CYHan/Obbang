Product = new Mongo.Collection("Product");

Product.attachSchema(new SimpleSchema({
    name: {
        type: String,
        max: 30
    },
    priceNormal: {
        type: Number,
        max: 50000
    },
    priceMaxDiscount: {
        type: Number,
        max: 50000
    },
    discountDuration: {
        type: Number,
        max: 24,
        decimal: true
    },
    storeId: {
        type: Number
    },
    storeName:{
        type:String
    },
    imageId: {
        type: String
    },
    description: {
        type: String,
        max: 255,
        optional: true
    }
}));

Product.allow({
    insert: function () {return false},
    update: function () {return false},
    remove: function () {return false}
});

ProductOnDiscount = new Mongo.Collection("ProductOnDiscount");

ProductOnDiscount.attachSchema(new SimpleSchema({
    name: {
        type: String,
        max: 50,
        min: 1
    },
    priceNormal: {
        type: Number,
        max: 50000,
        min: 0
    },
    priceMaxDiscount: {
        type: Number,
        max: 50000,
        min: 0
    },
    discountDuration: {
        type: Number,
        max: 24,
        decimal: true
    },
    storeId: {
        type: Number
    },
    storeName: {
        type: String,
        max: 50
    },
    imageId: {
        type: String
    },
    createdAt: {
        type: Date,
        autoValue: function(){if (this.isInsert) return new Date()}
    },
    endsAt: {
        type: Date,
        autoValue: function(){

            if (this.isInsert){
                return moment().add(this.field("discountDuration").value, "hours").toDate();
            }

        }
    },
    quantity: {
        type: Number,
        min: 0
    },
    quantityLeft: {
        type: Number,
        min: 0,
        autoValue: function(doc){if (this.isInsert) return this.field("quantity").value}
    },
    isCancelled: {
        type: Boolean,
        autoValue: function(){if (this.isInsert) return false}
    },
    description: {
        type: String,
        max: 255,
        optional: true
    }
}));

ProductOnDiscount.allow({
    insert: function () {return false},
    remove: function () {return false},
    update: function () {return false}
});

ProductImage = new FS.Collection("ProductImage", {
    stores: [new FS.Store.GridFS("ProductImage")]
});

ProductImage.allow({
    insert: function(userId, doc) {
        return Roles.userIsInRole(userId, ["Root"]);
    },
    update: function(userId, doc, fields, modifier) {
        return Roles.userIsInRole(userId, ["Root"]);
    },
    download: function() {
        return true;
    },
    remove: function(userId, doc) {
        return Roles.userIsInRole(userId, ["Root"]);
    }
});

getProduct = function(user) {
    return Product.find({
        storeId: user.profile.store.id
    });
};

getProductImage = function (imageId) {
    return ProductImage.findOne({_id: imageId});
};

getProductOnDiscountCustomer = function() {
    return ProductOnDiscount.find({
        endsAt: {$gt: new Date()},
        quantityLeft: {$gt: 0},
        isCancelled: false
    }, {description: false});
};

getProductOnDiscountAdmin = function(user) {
    return ProductOnDiscount.find({
        storeId: user.profile.store.id,
        endsAt: {$gt: new Date()},
        quantityLeft: {$gt: 0},
        isCancelled: false
    });
};