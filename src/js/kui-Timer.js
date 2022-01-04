function Timer(option) {
    this.timer=null
    this.runFunction=option.runFunction
    this.timeOut=option.timeOut||(1000*60)*6
    console.log(option)
}

Timer.prototype.start = function () {
    console.log(this.runFunction)
    if( this.runFunction){
        this.timer=setInterval(this.runFunction,this.timeOut)
    }
};

Timer.prototype.stop = function () {
    if(this.timer!=null){
        clearInterval(this.timer)
    }
};