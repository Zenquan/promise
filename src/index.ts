/**
 * Created by jomsou on 2018/7/31.
 */
interface IExecutor {
    (resolve: Function, reject: Function): void
}

enum STATUS {
    PENDING,
    FULFILLED,
    REJECTED
}

class myPromise {
    private status: STATUS = STATUS.PENDING;
    private value: any;
    private reason: any;
    private onResolveCallBacks: Function[] = [];
    private onRejectCallBacks: Function[] = [];
    private executor: Function;
    private resolve: Function;
    private reject: Function;
    constructor(executor: IExecutor){
        let p = this;
        function resolve(value: any){
            setImmediate(()=>{
                if(p.status===STATUS.PENDING) {
                    p.status = STATUS.FULFILLED;
                    p.value = value;
                    p.onResolveCallBacks.forEach(fun=>fun(value))
                }
            })
        }
        function reject(value: any){
            setImmediate(()=> {
                if (p.status === STATUS.PENDING) {
                    p.status = STATUS.REJECTED;
                    p.value = value;
                    p.onResolveCallBacks.forEach(fun => fun(value))
                }
            })
        }
        executor(resolve, reject)
    }
    public then (onFulfilled: Function, onReject?: Function) {
        let promise2: myPromise;
        const self: myPromise = this;
        if (this.status===STATUS.FULFILLED){
            promise2 = new myPromise((resolve, reject)=>{
                setImmediate(()=>{
                    try {
                        let res = onFulfilled(self.value);
                        resolvePromise(promise2, res, resolve, reject)
                    }catch (error){
                        reject(error);
                    }
                })
            })
        }
        if (this.status===STATUS.REJECTED){
            promise2 = new myPromise((resolve, reject)=>{
                setImmediate(()=>{
                    try {
                        let res = onReject(self.reason);
                        resolvePromise(promise2, res, resolve, reject)
                    }catch (error){
                        reject(error);
                    }
                })
            })
        }
        if (this.status === STATUS.PENDING) {
            promise2 = new myPromise((resolve, reject)=>{
                promise2 = new myPromise((reslove, reject) => {
                    self.onResolveCallBacks.push(value => {
                        try {
                            let res = onFulfilled(value)
                            resolvePromise(promise2, res, reslove, reject)
                        } catch (error) {
                            reject(error)
                        }
                    })
                    self.onRejectCallBacks.push(reason => {
                        try {
                            let res = onReject(reason)
                            resolvePromise(promise2, res, reslove, reject)
                        } catch (error) {
                            reject(error)
                        }
                    })
                })
            })
        }
        return promise2;
    }
    public catch (onReject) {
        const self = this
        const promise = new myPromise((resolve, reject) => {
            setImmediate(() => {
                try {
                    let res = onReject(self.reason)
                    resolvePromise(promise, res, resolve, reject)
                } catch (error) {
                    reject(error)
                }
            })
        })
    }
}
function resolvePromise (promise: myPromise, res: any, resolve: Function, reject: Function) {
    // 暂时不清楚什么情况下会出现循环应用
    if (promise === res) {
        return reject(new TypeError('循环引用'))
    }
    let then
    let called

    // 如果onFulfilled方法返回的res不为空，并且可能是object（可能是一个Promise或者一般对象）或者function
    if (res !== null && ((typeof res === 'object' || typeof res === 'function'))) {
        try {
            then = res.then
            // 如果res具有then属性，并且是一个function，说明可能是一个Promise(这里应该用类型判断)
            if (typeof then === 'function') {
                // 重复调用then方法, 直到res不再是一个Promise
                then.call(res, function (res2) {
                    if (called) return
                    called = true
                    resolvePromise(promise, res2, resolve, reject)
                }, function (err) {
                    if (called) return
                    called = true
                    reject(err)
                })
            } else {
                // 调用resolve
                resolve(res)
            }
        } catch (error) {
            if (called) return
            called = true
            reject(error)
        }
    } else {
        resolve(res)
    }
}
