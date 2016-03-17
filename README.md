# 삼김 - 프로젝트 기본 설정

## Folder
* client - for Clients
* server - for Server
* public - for Clients's Image and resources
* lib - Addon Package

## Installed Packages
* meteor add underscore
* meteor add twbs:bootstrap
* meteor add iron:router
* meteor add accounts-ui accounts-password
* meteor add accounts-facebook
* meteor add service-configuration
* meteor add joshowens:accounts-entry(or meteor add joshowens:accounts-entry@=1.0.3)
 * packages
 * git clone https://github.com/jakubbilko/accounts-entry.git
* meteor add check
* meteor add cfs:standard-packages
* meteor add cfs:gridfs
* meteor add aldeed:collection2
* meteor add aldeed:autoform
* meteor add alanning:roles
* meteor add reactive-var
* meteor add manuel:reactivearray

## Remove Packages
* meteor remove insecure
* meteor remove autopublish

## Publish on AWS
* meteor bundle cvs.tar.gz
* tar -xzvf cvs.tar.gz
* cd ~/bundle/programs/server 
* npm install
* ~/fs.sh

## DB Schemas
★ 는 자동 생성되거나, 선택 항목임(인자로 넘길 필요가 없음).
### Product
* ★_id: String
* name: String
* priceNormal: Number
* priceMaxDiscount: Number // 최대 할인 가격
* discountDuration: Number // 할인 시간
* storeId: Number
* storeName: String
* imageId: String
* ★description: String
### ProductImage
* storeId: String
* ★나머지는 CFS 관련 속성들
### ProductOnDiscount
* ★_id: String
* name: String
* priceNormal: Number
* priceMaxDiscount: Number // 최대 할인 가격
* discountDuration: Number // 할인 시간
* storeId: Number
* storeName: String
* imageId: String
* ★description: String
**여기까지는 Product와 동일**
* ★createdAt: Date
* ★endsAt: Date // 판매 종료 시간
* quantity: Number // 전체 수량
* ★quantityLeft: Number // 남은 수량
* ★isCancelled: Boolean // 등록 취소시 true

### users
* ★_id: String
* ★username: String
* ★emails: String // 자체 로그인 사용시
* ★createdAt: Date
* ★services: Object // OAuth 사용시 추가정보 및 비밀번호
  * facebook: Object
        * id: String
        * email: String
        * name: String
        * link: String
        * gender: String
        * locale: String
* profile: Object // Custom field 저장되는 곳
    * store: Object // Admin일 때만 존재
        * id: Number (Auto Increment)
        * name: String
        * phone: String
        * password: String // 암호화되어있음
        * ★latitude: Number
        * ★longitude: Number
    * ★name: String
* ★roles: Array[String] // 아래의 값중 하나만 사용
    * Customer // 지금은 사용하지 않음
    * Admin_Pending
    * Admin
    * Root
### Trade
* ★_id: String
* ★customerId: String
* storeId: Number
* storeName: String
* products: Array[Object]
    * productOnDiscountId: String
    * productOnDiscountName: String
    * productOnDiscountImageId: String
    * quantity: Number
    * price: Number
* ★createdAt: Date

## Naming Rule
Naming Rule을 최대한 따르는 것을 원칙으로 하되, 예외적인 사항이 있거나 더 효과적인 naming 규칙이 필요할 경우
문서 최 하단부(Naming Issue)에 append 형식으로 써주시기 바랍니다.

### Common
* Naming 정의 시 prefix/subfix/suffix를 최대한 활용한다.
* 가급적 '형태/의미/구분자' 순서로 조합하며, 3단계를 넘어가지 않도록 한다.
* **prefix** : 주로 type이나 개괄적 의미를 나타내는데 사용한다.
```shell
list, btn, price, quantity
```
* **subfix** : 주로 부가설명 용도로 사용한다.
```shell
product, buy, total, left
```
* **suffix** : 주로 식별자(Template 명)를 나타내는데 사용한다, 식별자가 없어도 구분이 가능한 경우 naming이 길어지는 것을 막기 위해 무분별한 사용은 지양한다.
```shell
customer, admin, registerProduct
```
* 가독성을 위해, prefix의 단독사용은 지양한다.
```javascript
list(X)
listStore(O)
```
* 의미가 드러나는 축약어는 사용이 가능하다.
```javascript
object -> obj, reactive -> rct, template -> tmpl
```


### HTML / CSS
* 부트스트랩 naming 형태와 유사하게 적용하는 것을 원칙으로 한다.
* hyphen을 이용하여 prefix/subfix/suffix를 구분하며 모두 소문자를 사용한다.
* 단, Template명은 대소문자를 구분하여 표기한다.
```HTML
nav-top-customer, container-registerProduct
```

### JavaScript
* lowerCamelCase 방식을 이용하여 prefix/subfix/suffix를 구분한다.
**lowerCamelCase(LCC)** : 단어의 가장 첫 문자는 소문자, 이후부터 구분되는 단어의 시작은 대문자로 표기하는 방식.
```javascript
itemProductCustomer
```
* 자주 사용하는 변수
```javascript
productId // product 객체의 id
priceNormal // 원가
priceMaxDiscount // 최대로 할인된 가격
priceCurrent // 할인 중인 상태에서 현재의 가격
priceTotal // 현재 순간의 가격 * 개수 들의 합
priceTotalNormal // 원가 * 개수 들의 합 (할인율 계산시 분모로 쓰임)
```

### Naming Issue
*
```shell

```