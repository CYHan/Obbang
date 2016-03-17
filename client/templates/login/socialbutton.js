Template.registerHelper("social_unconfigured", function() {
  return ServiceConfiguration.configurations.find({
        service: this.toString()
      }).fetch().length === 0;
});
Template.registerHelper("google", function() {
  if (this[0] === 'g' && this[1] === 'o') {
    return true;
  }
});
Template.registerHelper("social_icon", function() {
  switch (this.toString()) {
    case 'google':
      return 'google-plus';
    case 'meteor-developer':
      return 'rocket';
    default:
      return this;
  }
});

capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
};

_socialClickButton = function (event, templateAfterSuccess) {
  var callback, loginWithService, options, serviceName;
  event.preventDefault();
  console.log($(event.target).attr('id'));
  serviceName = $(event.target).attr('id').replace('entry-', '');
  callback = function(err) {
    Session.set('talkingToServer', false);
    if (!err) {
      /*if (Session.get('fromWhere')) {
        Router.go(Session.get('fromWhere'));
        return Session.set('fromWhere', void 0);
      } else {*/
        return Router.go(templateAfterSuccess);
      //}
    } else if (err instanceof Accounts.LoginCancelledError) {

    } else if (err instanceof ServiceConfiguration.ConfigError) {
      return Accounts._loginButtonsSession.configureService(serviceName);
    } else {
      return Accounts._loginButtonsSession.errorMessage(err.reason || t9n("error.unknown"));
    }
  };
  if (serviceName === 'meteor-developer') {
    loginWithService = Meteor["loginWithMeteorDeveloperAccount"];
  } else {
    loginWithService = Meteor["loginWith" + capitalize(serviceName)];
  }
  options = {};
  if (Accounts.ui._options.requestPermissions[serviceName]) {
    options.requestPermissions = Accounts.ui._options.requestPermissions[serviceName];
  }
  if (Accounts.ui._options.requestOfflineToken && Accounts.ui._options.requestOfflineToken[serviceName]) {
    options.requestOfflineToken = Accounts.ui._options.requestOfflineToken[serviceName];
  }
  Session.set('talkingToServer', true);
  return loginWithService(options, callback);
};

Template.socialLogin.events({
  'click .btn': function (event) {
    _socialClickButton(event, '/');
  }
});

Template.socialAdmin.events({
  'click .btn': function (event) {
    _socialClickButton(event, '/registerAdmin');
  }
});