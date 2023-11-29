class ApiError extends Error{
    constructor(status,message="Something went wrong",errors = [],stack=""){
        super(message)
        this.message = message
        this.status = status
        this.data = null
        this.errors = errors
        this.success = false
        
        if (stack) {
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}