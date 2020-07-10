# 微信小程序地图相关
> [官网地图组件](https://developers.weixin.qq.com/miniprogram/dev/component/map.html)
> | 
> [腾讯位置服务](https://lbs.qq.com/miniProgram/jsSdk/jsSdkGuide/methodGeocoder)
---

## 基础使用
基础map能获取位置的经纬度, 但是无法获取经纬度对应的地址以及建筑名称

+ wxml
```html
<map id="map"
    longitude="{{ position.longitude }}"
    latitude="{{ position.latitude }}"
    scale="16"
    bindregionchange="regionchange"
    show-location
    style="width: 100%; height: 800rpx;">
    <cover-image src="../../../../static/image/icon/marker.png" class="marker"></cover-image>
</map>

```
+ js
```javascript
regionchange(e) {
  // 地图发生变化的时候，获取中间点，也就是用户选择的位置toFixed
  if (e.type == 'end' && (e.causedBy == 'scale' || e.causedBy == 'drag')) {
    this.mapCtx = wx.createMapContext("map"); // 对应map的id
    this.mapCtx.getCenterLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          'position.latitude': res.latitude,
          'position.longitude': res.longitude
        })
      }
    })
  }
 }
```

## 腾讯位置服务
为了获取经纬度对应的位置名称使用该库

### 使用步骤
1. 申请开发者密钥（key）：申请密钥

2. 开通webserviceAPI服务：控制台 -> key管理 -> 设置（使用该功能的key）-> 勾选webserviceAPI -> 保存
(小程序SDK需要用到webserviceAPI的部分服务，所以使用该功能的KEY需要具备相应的权限)

3. 下载微信小程序JavaScriptSDK，微信小程序JavaScriptSDK v1.2

4. 安全域名设置，在“设置” -> “开发设置”中设置request合法域名，添加https://apis.map.qq.com

### 基础使用

```javascript
// 引入SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({
    onLoad: function () {
        // 实例化API核心类
        qqmapsdk = new QQMapWX({
            key: '申请的key'
        });
    },
    onShow: function () {
        // 调用接口
        qqmapsdk.search({
            keyword: '酒店',
            success: function (res) {
                console.log(res);
            },
            fail: function (res) {
                console.log(res);
            },
        complete: function (res) {
            console.log(res);
        }
    });
})
```
```javascript
// 解析
encodeAddress(e) {
    this.data.qqmapsdk.geocoder({
      address: e.detail.value, // 地址名称, 如: 辽宁省大连市
      success: ({ result: { location : { lng, lat }} }) => {
        this.setData({
          data: {
            latitude: lng,
            longitude: lat
          }
        })
      }
    })
 },
// 逆向解析
 decodeAddress({ latitude, longitude }) {
  this.data.qqmapsdk.reverseGeocoder({
    location: {
      latitude,
      longitude
    },
    success: ({ result }) => {
      const { city } = result.address_component
      this.setData({
        'data.address':`${city}${result.formatted_addresses.recommend}`
      })
    },
  })
 },
```
