## 发布订阅模式在Vue中的运用
在我了解了发布订阅模式之后，Vue源码中的发布订阅模式应用（Dep，Watcher，Observer）仍然让我摸不着头脑。在精简代码，并反复撸了几遍之后，才有了一点点心得体会。要搞清Vue中的发布订阅模式，首先要想清楚以下几个问题：
1. 订阅者（Watcher/subscribe）是谁？
Vue模板中对变量的引用，比如说页面中的表达式({{ expression }})，订阅之后，变量更新可以自动触发表达式值的更新
2. 发布者（Obsever）是谁？
Vue对象data中的变量，即data中的变量就是消息源头，即变量更新之后，就会主动触发依赖于变量的表达式值的更新
3. 订阅是发生在什么时机？这一点比较复杂、巧妙，需要好好领悟
4. 发布（经纪人发布）发生在什么时机？