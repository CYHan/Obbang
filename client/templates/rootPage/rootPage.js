Template.acceptAdmin.helpers({
    listPendingAdmin :  function() {
        return getPendingAdmin();
    }
});

Template.acceptAdminItem.events({
    'click #admin-accept' : function(event){
        Meteor.call("acceptAdmin", this._id);
    },
    'click #admin-decline' : function(event){
        Meteor.call("declineAdmin", this._id);
    }
});

Template.uploadImage.events({
    "submit .uploadImage": function(event) {
        var file = $('#productImage').get(0).files[0];
        if(file) {
            var fsFile = new FS.File(file);
            var storeId = Roles.userIsInRole(Meteor.userId(), ["Admin"])
                ? Meteor.user().profile.store.id + "" : Meteor.userId();
            _.extend(fsFile, {storeId: storeId});
            ProductImage.insert(fsFile, function(err, result) {
                if (err) {
                    alert("Failed!: " + err);
                }
            });
        }
        return false;
    },
    "click .apply-admin": function() {
        Meteor.call("applyAdmin", {name: "OPS", phone: "(051)-123-4567", password: Package.sha.SHA256("0000")},
            function (err) {alert(err ? "Fail.. :" + err : "Success!");}
        );
    },
    "click .accept-admin": function() {
        var userId = Meteor.userId();
        Meteor.call("acceptAdmin", userId, function (err) {
            alert(err ? "Fail.. :" + err : "Success!");
        });
    },
    "click .insert-default": function() {
        Meteor.call("addProductOnDiscount", [
            {
                name: "방귀",
                priceNormal: 2000,
                priceMaxDiscount: 1000,
                discountDuration: 0.0025,
                storeId: 1,
                storeName: "OPS",
                imageId: "/resources/img/3.jpg",
                description: "수 초 안에 증발하는 방귀",
                quantity: 2
            }
        ]);
    }
});

Template.uploadImage.helpers({
    uploadedImages : function(){
        return ProductImage.find();
    }
});
