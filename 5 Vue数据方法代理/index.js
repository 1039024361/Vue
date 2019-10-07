(function (global, factory) {
  typeof exports === 'object' && typeof moudle !== 'undefined' ? moudle.exports = factory :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Svue = factory())
}(this, function () {
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
    // return Object.prototype.toString.call(val) === '[object Object]'
    // 上一种方法会将数组排除在object之外
    return val !== null && typeof val === 'object'
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

    // 订阅
  // exp: 实际的订阅者，即对相关变量进行订阅，以其再数据更新的时候，更新表达式的值
  // scope：表达式作用域范围
  // callback：回调函数，一般用于再变量更新之后，更新视图
  function Watcher (exp, scope, callback) {
    this.exp = exp
    this.scope = scope
    this.callback = callback
    this.value = undefined
    // 初始化收集依赖
    Dep.target = this
    this.update()
    Dep.target = null
  }
  Watcher.prototype = {
    get: function () {
      // eval执行表达式的时候，会触发变量的get函数，将exp添加到变量的dep依赖中去
      return computeExpression(this.exp, this.scope)
    },
    update: function () {
      var value = this.get()
      this.value = value
      this.callback && this.callback.call(this.scope, value)
    }
  }


  /*
  *  编译Vue的模板，实现Vue模板语法的自动订阅
  */ 
  function complier (selector, vm) {
    var node = document.querySelector(selector)
    if (!node) return
    processNode(node, vm)
  }
  // 递归遍历节点
  function processNode (node, vm) {
    // 文本节点
    if (node.nodeType == 3) {
      var text = node.textContent.trim()
      var exp = getTextExpression(text)
      new Watcher(exp, vm, function (value) {
        // 注意node值传递用的是闭包
        console.log(node)
        node.textContent = value
      })
    } else if (node.nodeType == 1) {
      var childNodes = node.childNodes
      var length = childNodes.length
      for (var i = 0; i < length; i++) {
        processNode(childNodes[i], vm)
      }
    }
  }

  // 解析文本节点
  // 将{{ expression }}中的expression提取出来
  function getTextExpression (text) {
    var reg = /\{\{((.*?))\}\}/g
    var result = text.replace(reg, `'+$2+'`)
    return `'` + result + `'`
  }

  // // 调试代码
  // var data = {
  //   name: 'ZhongDerer',
  //   age: 18
  // }

  // var observer = new Observer(data)
  // complier('#container1')

  function Svue (options) {
    this.$data = options.data || {}
    this.$el = options.el ||''
    this.$options = Object.assign(
      {
        computed: {},
        methods: {}
      },
      options
    )
    
    this.init()
  }
  Svue.prototype = {
    init: function () {
      this._proxy(this.$options)
      new Observer(this.$data)
      complier(this.$el, this)
    },
    // 将data中的数据代理到vue对象上，以便于通过this.XXXX的方法去访问变量
    _proxy: function (options) {
    var self = this
    var PROXY = ['data', 'computed']
    PROXY.forEach(function (type) {
      Object.keys(options[type]).forEach(key => {
        Object.defineProperty(self, key, {
          enumerable: true,
          configurable: false,
          get: function () {
            if (typeof options[type][key] !== undefined) {
              if (type === 'data') {
                return this.$data[key]
              } else if (type === 'computed') {
                return options[type][key].call(self)
              }          
            } else {
              return undefined
            }
          },
          set: function (newValue) {
            if (options[type].hasOwnProperty(key)) {
                options[type][key] = newValue     
            } else {
              console.log('There is no ' + key + ' instance.')
            }
          }
        })
      })
    })
  }
  }

  return Svue
}))

