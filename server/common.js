// 사용자 권한 목록
var roles = [
    "Customer",         // 구매자 권한
    "Admin_Pending",    // 판매자로 신청은 했지만 아직 수락을 받지 못함
    "Admin",            // 판매자 권한
    "Root"              // 판매자 승인을 줄 수 있는 권한
];

// 등록한 권한이 없으면 권한을 등록한다.
if(Meteor.roles.find().count() === 0) {
    _.forEach(roles, function(role) {
        Roles.createRole(role)
    });
}