class Promise {
    constructor(executor) {
        //Init state & result & callback(defined in then(), executed when state change)
        this.PromiseState = 'pending'
        this.PromiseResult = null
        this.callbacks = []

        const resolve = data => {
            // Can only change state once
            if (this.PromiseState !== 'pending') return
            // Change promiseState
            this.PromiseState = 'fulfilled'
            // Change promiseResult
            this.PromiseResult = data
            // Execute callbacks
            setTimeout(() => {
                this.callbacks.map((callback) => {
                    callback.onResolved(data)
                })
            })
        }
        const reject = data => {
            // Can only change state once
            if (this.PromiseState !== 'pending') return
            // Change promiseState
            this.PromiseState = 'rejected'
            // Change promiseResult
            this.PromiseResult = data
            // Execute callbacks
            setTimeout(() => {
                this.callbacks.map((callback) => {
                    callback.onRejected(data)
                })
            })
        }
        try {
            executor(resolve, reject)
        } catch (e) {
            reject(e)
        }
    }

    // Add then() method
    then(onResolved, onRejected) {
        const self = this
        // In error handling, to pass the 2rd param
        if (typeof onRejected !== 'function') {
            onRejected = reason => {
                throw reason
            }
        }
        // To pass value with void then param
        if (typeof onResolved !== 'function') {
            onResolved = value => value
        }
        return new Promise((resolve, reject) => {
            function callback(resultType) {
                try {
                    // Get the return value of callback
                    let result = resultType(self.PromiseResult)
                    // Return value is promise, new promise state & result as return promise
                    if (result instanceof Promise) {
                        result.then(value => {
                            resolve(value)
                        }, reason => {
                            reject(reason)
                        })
                    } else {
                        // Return value is not promise, new promise state as fulfilled, result as return value
                        resolve(result)
                    }
                } catch (e) {
                    reject(e)
                }
            }
            if (this.PromiseState === 'fulfilled') {
                setTimeout(() => {
                    callback(onResolved)
                })
            }
            if (this.PromiseState === 'rejected') {
                setTimeout(() => {
                    callback(onRejected)
                })
            }
            // For async, define callbacks before state change
            if (this.PromiseState === 'pending') {
                // Use push to accept multiple callbacks
                this.callbacks.push({
                    onResolved: () => {
                        callback(onResolved)
                    },
                    onRejected: () => {
                        callback(onRejected)
                    }
                })
            }
        })
    }

    // Add catch() method
    catch(onRejected) {
        return this.then(undefined, onRejected)
    }

    // Add resolve() method
    static resolve(value) {
        return new Promise((resolve, reject) => {
            if (value instanceof Promise) {
                value.then(value => {
                    resolve(value)
                }, reason => {
                    reject(reason)
                })
            } else {
                resolve(value)
            }
        })
    }

    // Add reject() method
    static reject(reason) {
        return new Promise((resolve, reject) => {
            reject(reason)
        })
    }

    // Add all() method  
    static all(promiseArr) {
        return new Promise((resolve, reject) => {
            let newPromiseArr = []
            let count = 0
            const length = promiseArr.length
            promiseArr.forEach((promise, index) => {
                promise.then(value => {
                    count++
                    newPromiseArr[index] = value
                    if (count === length) {
                        resolve(newPromiseArr)
                    }
                }, reason => {
                    reject(reason)
                })
            })
        })
    }

    // Add race() method
    static race(promiseArr) {
        return new Promise((resolve, reject) => {
            promiseArr.map((promise) => {
                promise.then(value => {
                    resolve(value)
                }, reason => {
                    reject(reason)
                })
            })
        })
    }
}

