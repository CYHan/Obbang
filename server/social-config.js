// Social login OAuth 설정
ServiceConfiguration.configurations.upsert(
  { service: "facebook" },                      // 지원하는 OAuth 서비스 (Facebook, Google ..)
  {
    $set: {
      appId: "771108559701059",                 // Facebook App ID
      loginStyle: "popup",                      // redirect는 접속한 Meteor을 종료시켜 버린다
      secret: "d135907565f8695b11c5867fcfe8abb7"// Facebook App secret key
    }
  }
);



