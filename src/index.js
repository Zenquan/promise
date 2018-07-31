var STATUS;
(function (STATUS) {
    STATUS[STATUS["PENDING"] = 0] = "PENDING";
    STATUS[STATUS["FULFILLED"] = 1] = "FULFILLED";
    STATUS[STATUS["REJECTED"] = 2] = "REJECTED";
})(STATUS || (STATUS = {}));
var myPromise = (function () {
    function myPromise(executor) {
        this.status = STATUS.PENDING;
        this.onResolveCallBacks = [];
        this.onRejectCallBacks = [];
        var p = this;
        function resolve(value) {
            setImmediate(function () {
                if (p.status === STATUS.PENDING) {
                    p.status = STATUS.FULFILLED;
                    p.value = value;
                    p.onResolveCallBacks.forEach(function (fun) { return fun(value); });
                }
            });
        }
        function reject(value) {
            setImmediate(function () {
                if (p.status === STATUS.PENDING) {
                    p.status = STATUS.REJECTED;
                    p.value = value;
                    p.onResolveCallBacks.forEach(function (fun) { return fun(value); });
                }
            });
        }
        executor(resolve, reject);
    }
    myPromise.prototype.then = function (onFulfilled, onReject) {
        var promise2;
        var self = this;
        if (this.status === STATUS.FULFILLED) {
            promise2 = new myPromise(function (resolve, reject) {
                setImmediate(function () {
                    try {
                        var res = onFulfilled(self.value);
                        resolvePromise(promise2, res, resolve, reject);
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            });
        }
        if (this.status === STATUS.REJECTED) {
            promise2 = new myPromise(function (resolve, reject) {
                setImmediate(function () {
                    try {
                        var res = onReject(self.reason);
                        resolvePromise(promise2, res, resolve, reject);
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            });
        }
        if (this.status === STATUS.PENDING) {
            promise2 = new myPromise(function (resolve, reject) {
                promise2 = new myPromise(function (reslove, reject) {
                    self.onResolveCallBacks.push(function (value) {
                        try {
                            var res = onFulfilled(value);
                            resolvePromise(promise2, res, reslove, reject);
                        }
                        catch (error) {
                            reject(error);
                        }
                    });
                    self.onRejectCallBacks.push(function (reason) {
                        try {
                            var res = onReject(reason);
                            resolvePromise(promise2, res, reslove, reject);
                        }
                        catch (error) {
                            reject(error);
                        }
                    });
                });
            });
        }
        return promise2;
    };
    myPromise.prototype.catch = function (onReject) {
        var self = this;
        var promise = new myPromise(function (resolve, reject) {
            setImmediate(function () {
                try {
                    var res = onReject(self.reason);
                    resolvePromise(promise, res, resolve, reject);
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    };
    return myPromise;
}());
function resolvePromise(promise, res, resolve, reject) {
    // 暂时不清楚什么情况下会出现循环应用
    if (promise === res) {
        return reject(new TypeError('循环引用'));
    }
    var then;
    var called;
    // 如果onFulfilled方法返回的res不为空，并且可能是object（可能是一个Promise或者一般对象）或者function
    if (res !== null && ((typeof res === 'object' || typeof res === 'function'))) {
        try {
            then = res.then;
            // 如果res具有then属性，并且是一个function，说明可能是一个Promise(这里应该用类型判断)
            if (typeof then === 'function') {
                // 重复调用then方法, 直到res不再是一个Promise
                then.call(res, function (res2) {
                    if (called)
                        return;
                    called = true;
                    resolvePromise(promise, res2, resolve, reject);
                }, function (err) {
                    if (called)
                        return;
                    called = true;
                    reject(err);
                });
            }
            else {
                // 调用resolve
                resolve(res);
            }
        }
        catch (error) {
            if (called)
                return;
            called = true;
            reject(error);
        }
    }
    else {
        resolve(res);
    }
}
