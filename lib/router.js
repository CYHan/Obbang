Router.configure({
    layoutTemplate: 'layout'
});


//////////////////////////////////////////////////CUSTOMER//////////////////////////////////////////////////////////////

var _productOnDiscountHandle = null;
Router.route('/', {
    name: 'customer.go',
    template: 'customer',
    layoutTemplate: 'layoutCustomer',
    waitOn: function () {
        return [Meteor.subscribe("ProductOnDiscountCustomer")];
    },
    data: function () {
        if (!this.ready()) return;

        var cursor = getProductOnDiscountCustomer();
        if (_productOnDiscountHandle) _productOnDiscountHandle.stop();

        _productOnDiscountHandle = cursor.observe({
            changed: function (newDocument) {
                onProductOnDiscountSold(newDocument);
            },
            removed: function (oldDocument) {
                onProductOnDiscountRemoved(oldDocument);
            }
        });

        return {
            dataCustomer: cursor.fetch()
        };
    },
    unload: function () {
        _productOnDiscountHandle.stop();
        _productOnDiscountHandle = null;
    }
});


//////////////////////////////////////////////////ADMIN/////////////////////////////////////////////////////////////////

Router.route('/admin', {
    template: 'admin',
    layoutTemplate: 'layoutAdmin',
    waitOn: function () {
        return [Meteor.subscribe("ProductOnDiscountAdmin")];
    },
    data: function () {
        return {dataAdmin: getProductOnDiscountAdmin(Meteor.user()).fetch()}
    }
});

Router.route('/saleManage/:_id', {
    name:'sale.show',
    template: 'saleManage',
    layoutTemplate: 'layoutAdmin',
    waitOn: function () {
        var currentTime = this.params._id;
        currentTime = Number(currentTime);
        var currentDate =  new Date(currentTime);
        var currentDateTemp = moment(currentDate).subtract(3, 'year');
        return [Meteor.subscribe("TradeAdmin", currentDateTemp.toDate(), currentDate)];
    },
    data: function () {
        var currentTime = this.params._id;
        currentTime = Number(currentTime);
        var currentDate =  new Date(currentTime);
        var currentDateThreeYearPre = moment(currentDate).subtract(3, 'year');
        return {
            saleManage: getTradeAdmin(Meteor.user(), currentDateThreeYearPre.toDate(), currentDate).fetch(),
            currentDate : currentDate
        };
    }
});

Router.route('/registerProduct', {
    template: 'registerProduct',
    layoutTemplate: 'layoutRegisterProduct',
    waitOn: function () {
        return [Meteor.subscribe("ProductAdmin")];
    },
    data: function () {
        return {
            dataRegister: getProduct(Meteor.user()).fetch()
        };
    }
});

Router.route('/insertProduct', {
    template: 'insertProduct',
    layoutTemplate: 'layoutInsertProduct'
});

Router.route('/detailProduct/:_id', {
    name: 'detail.show',
    template: 'detailProduct',
    layoutTemplate: 'layoutDetailProduct',
    waitOn: function () {
        return [Meteor.subscribe("ProductOnDiscountCustomer")];
    },
    data: function () {
        var productId = this.params._id;
        return {
            item: ProductOnDiscount.findOne({_id: productId})
        }
    }
});
//////////////////////////////////////////////////ACCOUNT///////////////////////////////////////////////////////////////

Router.route('/root', {
    template: 'rootPage',
    waitOn: function () {
        return [Meteor.subscribe("PendingAdminUsers")];
    },
    data: function () {
        return getPendingAdmin().fetch();
    }
});

Router.route('/registerAdmin', {
    template: 'registerAdmin',
    layoutTemplate: 'layoutRegisterAdmin'
});

Router.route('/login', {
    template: 'login',
    layoutTemplate: 'layoutLogin'
});

//////////////////////////////////////////////////AND SO ON...//////////////////////////////////////////////////////////
Router.map(function () {
    // About Route
    this.route('about', {
        layoutTemplate: 'about'
    });
});

Router.route('/landing', {
    layoutTemplate: 'landing',
    waitOn: function () {
        return [Meteor.subscribe("LandingEmails")];
    },
    data: function () {
        return {
            listEmail : LandingEmails.find().fetch()
        }
    }
});
