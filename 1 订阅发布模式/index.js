// 经纪人（Broker）
function Broker () {
    this.subs = {}
}
// 订阅
Broker.prototype.addSub = function (subscriber, type) {
    (this.subs[type] || (this.subs[type] = [])) &&
    this.subs[type].push(subscriber)
}
// 发布
Broker.prototype.notify = function (type, msg) {
    console.log('经纪人依次向订阅者推送消息')
    // (this.subs[type] || (this.subs[type] = [])).forEach(function (sub) {
    //     sub.update(msg)
    // })
    if (this.subs[type] || (this.subs[type] = [])) {
        this.subs[type].forEach(function (sub) {
            sub.update(type, msg)
        })
    }
}

// 发布者（Publisher）
function Publisher (broker) {
    this.broker = broker
}
// 发布消息
Publisher.prototype.publish = function (type, msg) {
    // Publisher发布
    console.log('Publisher发布消息, 调用经纪人的发布消息方法')
    this.broker.notify(type, msg)
}

// 订阅者
function Subscriber (name, broker) {
    this.broker = broker
    this.name = name
}
// 订阅消息
Subscriber.prototype.subscribe = function (type) {
    this.broker.addSub(this, type)
}
// 更新消息
Subscriber.prototype.update = function (type, msg) {
    console.log(this.name, type, msg)
}

// 测试代码
var title = [
    'news',
    'jobs',
    'love',
    'learning'
]
var broker = new Broker()
var publisher = new Publisher(broker)
var zhongderer = new Subscriber('zhongderer', broker)
zhongderer.subscribe(title[1])
zhongderer.subscribe(title[3])
var yijiaqi = new Subscriber('yijiaqi', broker)
yijiaqi.subscribe(title[3])
publisher.publish(title[3], 'I love you')