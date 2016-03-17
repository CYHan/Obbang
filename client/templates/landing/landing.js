var listEmail;

Template.landing.helpers({
    listEmail: function () {
        var listEmailTemp = [];
        listEmail = this.listEmail
        $.each(listEmail, function (index, element) {
            var original = element.email;
            listEmailTemp.push({
                email: replaceEmailToStar(original)
            })
        });
        return listEmailTemp;
    }
});

Template.landing.events({
    'click a[id=registerUser]': function (event, tmpl) {

        var email = $('#inputEmail').val();
        if (isEmailType(email) && !isAlreadyRegisterd(email)) {
            Meteor.call('registerEmailForLanding', email, function (err) {

                if (err)
                    alert(err);
            })
        }
    }
});
/**
 * Email 형식이 맞는지 체크한다.
 * @param email
 * @returns {boolean}
 */
function isEmailType(email) {
    var regExp = /[0-9a-zA-Z][_0-9a-zA-Z-]*@[_0-9a-zA-Z-]+(\.[_0-9a-zA-Z-]+){1,2}$/;

    //이메일 형식에 맞지않으면
    if (!email.match(regExp)) {
        toastr.error("이메일 형식이 아닙니다.", "잘못된 이메일 형식");
        return false;
    }
    return true;
}
/**
 * 이미 등록되어있는 이메일인지 확인한다.
 * @param email
 * @returns {boolean} 이미 등록되있으면 true
 */
function isAlreadyRegisterd(email){

   var list =  _.findWhere(listEmail,{email : email});
    if(list){
        toastr.warning(email+"은(는) 이미 등록된 이메일입니다.");
        return true
    }else{
        return false
    }

}


/**
 * Email 의 @앞자리 2,3 자리를 *로 replace 한다.
 * @param email
 * @returns {string}
 */
function replaceEmailToStar(email) {
    var endIndex = email.indexOf('@');
    if (endIndex < 5) {
        email = email.substring(0, endIndex - 2) + '**' + email.substring(endIndex);
    } else {
        email = email.substring(0, endIndex - 3) + '***' + email.substring(endIndex);
    }
    return email;
}

