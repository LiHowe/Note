# Vue 数据绑定原理

* Observer : 数据观察者，让数据对象的读写都在监控之下
* Watcher : 数据订阅者，当订阅的数据变化的时候会通知Watcher进行相应操作, 同样用于$watch()与指令当中
* Dep: 通知传递者，当Observer监控的数据发生变化的时候会通过Dep通知给对应的Watcher

![dataBinding](../illustrations/img_Vue_1.PNG)
