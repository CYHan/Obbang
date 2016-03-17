/**
 * Created by quki on 2015-11-25.
 */

Template.insertProduct.onCreated(function(){
    this.limittime = new ReactiveVar(1);
});

Template.insertProduct.events({

    'click button[id=btn-complete-insertProduct]' : function(evt,tmpl){


        var discountDuration = tmpl.limittime.get();
        var selectedImage;
        var imgPath;
        var imgSelect = document.getElementsByName("img-select-insertProduct");

        for(var i=0; i<imgSelect.length;i++){
            if(imgSelect[i].checked == true){
                selectedImage = i+1;
            }
        }

        if(selectedImage == 1){
            imgPath = "/resources/img/1.jpg";
        } else if(selectedImage == 2){
            imgPath = "/resources/img/2.jpg";
        } else if(selectedImage == 3){
            imgPath = "/resources/img/3.jpg";
        }else if(selectedImage == 4){
            imgPath = "/resources/img/1.jpg";
        }

        Meteor.call("addProduct", {

            name : tmpl.find('input[name=input-name-insertProduct]').value,
            priceNormal : tmpl.find('input[name=input-price-insertProduct]').value,
            priceMaxDiscount : tmpl.find('input[name=input-maxdiscount-insertProduct]').value,
            discountDuration : discountDuration,
            imageId : imgPath,
            storeId : Meteor.user().profile.store.id,
            storeName : Meteor.user().profile.store.name,
            description : tmpl.find('input[name=input-description-insertProduct]').value

        },function(err){
            if(err) alert(err);
            Router.go('/registerProduct');
        })
        /**
       *  생성된 insertProduct page에서 완료버튼을 눌렀을 떄 동작하며
        *   addProdect Method가 호출되어  입력한 값과 이미지가 db에 insert된다.
        */
    },
    'click div[name=select-duration-insertProdcut]' :function(event,tmpl){

        var thisObj = $(event.target);
        $('div[name=select-duration-insertProdcut]').removeClass('btn-selected-insertProduct');
        thisObj.addClass('btn-selected-insertProduct');
        var thisContent = thisObj.attr('content');
        tmpl.limittime.set(thisContent);
    }
    /**
     *   선택한 시간의 값으로 limittime을 set한다.
     */

});

