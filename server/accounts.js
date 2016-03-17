// 사용자가 생성될 때 기본 역할 (구매자)를 추가한다.
Accounts.onCreateUser(function(options, user) {
    // We still want the default hook's 'profile' behavior.
    if (options.profile)
        user.profile = options.profile;

    user.roles = ["Customer"];
    return user;
});