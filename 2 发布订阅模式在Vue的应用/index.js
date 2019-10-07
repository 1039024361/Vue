// utils
// 执行字符串表达式
function computeExpression (exp, scope) {
  try {
    with (scope) {
      return eval(exp)
    }
  } catch (err) {
    console.log(err)
  }
}
// 判断是否是对象
function isObject (val) {
  return Object.prototype.toString.call(val) === '[object Object]'
}

// Dep依赖原型
function Dep () {
  this.subs = []
}
// 添加订阅
Dep.prototype.addSub = function (target) {
  this.subs.push(target)
}
// 移除订阅
Dep.prototype.remove = function (target) {
  this.subs = this.subs.filter(function (item) {
    return item !== target
  })
}
// 发布更新
Dep.prototype.notify = function () {
  this.subs.map(function (sub) {
    sub.update()
  })
}

// 订阅
// exp: 实际的订阅者，即对相关变量进行订阅，以其再数据更新的时候，更新表达式的值
// scope：表达式作用域范围
// callback：回调函数，一般用于再变量更新之后，更新视图
function Watcher (exp, scope, callback) {
  this.exp = exp
  this.scope = scope
  this.callback = callback
  // 初始化收集依赖
  Dep.target = this
  this.update()
  Dep.target = null
}

// 将变量纳入被观察
function Observer (data) {
  this.observe(data)
}
// 变量纳入观察
Observer.prototype.observe = function (data) {
  var self = this
  if (!isObject(data)) return
  Object.keys(data).forEach(function (key) {
    self.defineReactive(data, key, data[key])
  })
}
// 动态数据响应
Observer.prototype.defineReactive = function (data, key, value) {
  var dep = new Dep()
  this.observe(value)
  Object.defineProperty(data, key, {
    configurable: false,
    enumerable: true,
    get: function () {
      Dep.target && dep.addSub(Dep.target)
      console.log('添加依赖: ', dep)
      return value
    },
    set: function (newValue) {
      // 注意，直接等号相比，无法比较对象是否相等的问题
      if (newValue === value) return
      value = newValue
      console.log('发布更新')
      dep.notify()
    }
  })
}

Watcher.prototype = {
  get: function () {
    // eval执行表达式的时候，会触发变量的get函数，将exp添加到变量的dep依赖中去
    return computeExpression(this.exp, this.scope)
  },
  update: function () {
    var value = this.get()
    this.callback && this.callback(value)
  }
}


// 调试代码
var data = {
  name: 'ZhongDerer',
  age: 18
}

// 表达式 -> 在完整版本vue代码中，表达式通过编译template获取，这里先忽略编译过程，先写一个具体值
var exp1 = "'I am ' + data.name"
var exp2 = "'I am ' + data.age"
// callback -> 回调，会在这里更新视图
function callback1 (value) {
  console.log(value)
  var containter = document.querySelector('#containter1')
  containter.innerHTML = value
}
function callback2 (value) {
  console.log(value)
  var containter = document.querySelector('#containter2')
  containter.innerHTML = value
}


var observer = new Observer(data)
new Watcher(exp1, window, callback1)
new Watcher(exp2, window, callback2)
