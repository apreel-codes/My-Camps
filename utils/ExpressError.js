class ExpressError extends Error { //Error here is the regular built-in error
  constructor(message, statusCode){
    super();
    this.message = message;
    this.statusCode = statusCode;
  }

} 

//then export ExpressError
module.exports = ExpressError;