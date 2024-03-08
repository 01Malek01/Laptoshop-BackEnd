//the (req,res,next) are passed in from the passed controller, otherwise it will throw an error as they wont be defined or accessible
module.exports = (passedController) => (req,res,next) => { // the passedController is the controller that we want to catch errors for.
 passedController(req,res,next).catch(next); // passes the error to the express error handler
}