function Main(config){
    this.config=config;
}
Main.prototype.log={
    show:function(){
        console.log(this.prototype);
    }
}

let main=new Main(1);
main.log.show();