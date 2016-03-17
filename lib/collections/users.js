Meteor.users.attachSchema(new SimpleSchema({
    username: {
        type: String,
        optional: true
    },
    emails: {
        type: Array,
        optional: true
    },
    "emails.$": {
        type: Object
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    createdAt: {
        type: Date
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    profile: {
        type: Object,
        optional: true,
        blackbox: true
    },
    "profile.store.id": {
        type: Number,
        min: 0,
        index: true,
        sparse: true
    },
    "profile.store.name": {
        type: String,
        max: 50,
        optional: true
    },
    "profile.store.password": {
        type: String,
        optional: true
    },
    "profile.store.phone": {
        type: String,
        min: 8,
        max: 11,
        regEx: /[0-9]+/,
        optional: true
    },
    "profile.store.longitude": {
        type: Number,
        decimal: true,
        optional: true
    },
    "profile.store.latitude": {
        type: Number,
        decimal: true,
        optional: true
    },
    roles: {
        type: [String],
        optional: true
    }
}));

Meteor.users.allow({
    update: function (userId, user) {
        return userId === user._id;
    }
});

getPendingAdmin = function() {
    return Roles.getUsersInRole("Admin_Pending", null, {"profile.name":true, "profile.store":true});
};