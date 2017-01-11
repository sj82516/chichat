# Chichat v1  

[操作影片](https://vimeo.com/198997203)

如果要安裝可以下載，跑
$ yarn install
//執行伺服器
$ cd server
$ yarn install
//預設端口 4200
$ ./node_modules/.bin/nodemon server
我已將把React App編譯好的bundle.min.js與index.html放入/server中
直接跑應該沒問題

### Recap
1.使用React + Redux實作頁面與狀態管理
2.使用SocketIO實作Web Socket即時通訊  

###反省
####前端
1.在分割Redux的Reducer與Action時，我一開始是以頁面劃分，Index一個Main一個，但是這樣非常噁心...
理想上要以邏輯區分，例如使用者帳號相關、本地端儲存相關、每個頁面的UI控制，全部都切開會比較好管理  
2.因為是第一次使用Redux，所以使用最基本的Redux-Promise + Redux-Thunk處理Async資料流
但也因此很難寫測試，所以就都不寫了XD 爬文一陣子，發現有兩個更好的middleware- Redux-Saga和Redux-Observable
這兩者取代Redux-Thunk的共通性在於 **可測試、聲明式、可取消非同步動作**  
先說**Redux-Observable**，他其實就是原RxJS的人用Observable概念套用於Redux，好處是原RxJS豐富的Operator都可以套用，讓UX操作更豐富
缺點是 習慣的Promise都要先轉為Observable物件，而且關於 Async Flow的Sequential、Parrel等控制有點複雜 OTZ 上手難度有點大啊  
另一個**Redux-Saga**，採用generator方式操作非同步，坦白說我還在釐清他的核心觀念，不過單看官方文件的操作再套用修改其實難度不大
而且使用yeild讓非同步流程跟寫同步函式一樣的簡潔，測試也相當簡易！ 所以下一步決定先用用看  
3.關於UI，手刻很浪漫，但也很辛苦，非常的花時間，所以我決定下一個版本改用Material-UI實作，把時間省下來實作其他的功能
4.因為先前資料流沒有處理好，所以沒有完整實作PWA中的Offline Service，目前我只有在本地端儲存帳號資料而已
目前使用的是MDN出產的**localforage**，沒有太多fancy的功能但時有提供Promise-base API和良好的瀏覽器支援
接下來要完整的實作本地端資料儲放的功能

####後端
採用中規中矩的Express以及相關middleware，驗證套用passport，DB Client採用mongoose和通訊用的socketIO
1.Passport驗證真的很方便，但是如果錯誤不自己處理的話，有時會直接返回伺服器Debug錯誤訊息到Client，這其實蠻難搞的
之後還是要自己做錯誤處理比較優
2.目前SocketIO我是讓Client端建立連線後主動發送訊息，接著伺服器端收到後，將Cleint中的SocketID加入以使用者帳號為名的Room中
這樣之後我直接用 io.to(user.account).emit就可以發送訊息，比較方便
缺點是使用者disconnect再reconnect時，如果沒有再主動發送訊息且Server重新加回Room的話，會找不到人OTZ
另外在SocketIO的官網有說可以加入 req.session等，結果發現沒人知道怎麼做(查SF和Github上的Issue...)
所以要讓Server知道此Socket屬於哪個使用者的現行解法要用 **DB(Redis)儲存Socket.id <-map-> User.account**

#### Next
下一個專案再來挑戰IM網頁服務，希望可以完整實現PWA且加入視通訊完整服務，並加入HTTP2/Server Rendering，最後放到AWS上跑
如果可以的話加入自動化流程試試看

