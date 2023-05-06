function Promise(executor) {
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
        this.callbacks.map((callback) => {
            callback.onResolved(data)
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
        this.callbacks.map((callback) => {
            callback.onRejected(data)
        })
    }
    try {
        executor(resolve, reject)
    } catch (e) {
        reject(e)
    }
}

Promise.prototype.then = function (onResolved, onRejected) {
    const self = this
    if (typeof onRejected !== 'function') {
        onRejected = reason => {
            throw reason
        }
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
            callback(onResolved)
        }
        if (this.PromiseState === 'rejected') {
            callback(onRejected)
        }
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

Promise.prototype.catch = function (onRejected) {
    return this.then(undefined, onRejected)
}