Family nucleic acid test
家庭核酸检测

西安疫情期间，居家隔离，封门，防疫人员上门做核酸。

西安一码通，二维码暂不过期，防疫人员建议 由一个人保存所有家人的一码通截图，他们逐一扫码，无需每个人拿手机过来，以此加快效率。

遂，做了个这个小页面。


`mv data.js.template data.js`

qr-codes 里存放每个人的二维码截图，注意命名和 data.js 里的 key 对应。

对于没有二维码的人，可以设置 `noQRCode, id` 展示身份证号