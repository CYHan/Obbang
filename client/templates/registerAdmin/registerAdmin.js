/**
 * Created by quki on 2015-12-08.
 */
Template.registerAdmin.helpers({

});

Template.registerAdmin.events({


    // @param ( to, from, subject, text )

    'click button[id=apply-admin]' : function(event,template){

        var inputName = $('#store-name');
        var inputPhone = $('#store-tel');
        var pwd='';
        var pwdForCheck='';

        $("#group-pwd-registerAdmin :input").each(function(){
            pwd += $(this).val();
        });

        $("#group-pwdforcheck-registerAdmin :input").each(function(){
            pwdForCheck += $(this).val();
        });

        if(isAvailableStoreName(inputName) && isAvailablePhoneNumber(inputPhone) && isAvailableForPassword(pwd,pwdForCheck)){

            var store =  getStoreItem(inputName.val(), inputPhone.val(), Package.sha.SHA256(pwd));
            Meteor.call('applyAdmin',store,function(err){
                if(!err){
                    toastr.success('점주 등록 대기중...','등록이 요청 되었습니다. 등록이 되면 알려드리겠습니다.');
                    Router.go('/');
                }else{
                    console.log(err);
                }
            });
        }


        /*Meteor.call('sendEmail',
            'quki09@naver.com',
            'quki@favorie.co',
            'Hello from Meteor!',
            'This is a test of Email.send.', function (err) {
                if (err) {
                    alert(err);
                } else {
                    alert('메일성공');
                }
            });*/
    }

});

function isAvailablePhoneNumber(inputPhone){

    var phoneVal = inputPhone.val();
    var regNum = /^[0-9]{8,11}$/;
    if(regNum.test(phoneVal)){
        return true;
    }else{
        inputPhone.focus();
        toastr.error('전화번호를 올바르게 입력하세요.');
        return false;
    }
}

function isAvailableStoreName(inputName){
    if(inputName.val().length != 0){
        return true;
    }else{
        inputName.focus();
        toastr.error('빈칸을 포함해서는 안됩니다.');
        return false;
    }
}

function isAvailableForPassword(pwd,pwdForCheck){

    var regNum = /^[0-9]{4}$/;
    if(regNum.test(pwd) && regNum.test(pwdForCheck)){

        if(pwd===pwdForCheck){
            return true;
        }else{
            setInitPasswordView();
            toastr.error('비밀번호가 서로 불일치합니다.');
            return false;
        }
    }else{
        setInitPasswordView();
        toastr.error('비밀번호는 숫자 4자리만 가능합니다.');
        return false;
    }
}

function getStoreItem(name,phone,password){
    var store = {};
    store.name = name;
    store.phone = phone;
    store.password = password;
    return store;
}

function setInitPasswordView(){

    $('#group-pwd-registerAdmin').find('input').val('');
    $('#group-pwdforcheck-registerAdmin').find('input').val('');
    $('#firstInput').focus();

}
