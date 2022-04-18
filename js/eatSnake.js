
var Snake = function(mapX,mapY,snakeId,speed){
    this.mapX = mapX || 20 ;	//创建地图的行跟列数
    this.mapY= mapY || 20 ;
    this.snakeId = snakeId || 'snake' ;	//创建的表格id
    this.Map = [] ;	//存放td对象的数组(二维)
    this.snakeArray = [] ;	//存放蛇的数组
    this.foodArray = [] ;	//存放食物的数组
    this.directkey = 39 ; 	//按下的方向键
    this.goX = 0 ; 		//蛇横向移动的位移，1或-1
    this.goY = 0 ; 		//蛇纵向移动的位移，1或-1
    this.speed = this.oldSpeed = speed || 10 ;	//蛇移动的速度
    this.stop = true;	//控制蛇开始/暂停
    this.snakeTimer = null ;	//蛇移动主函数的计时器
    this.skin=false;//使用皮肤
    this.Hard=false;//是否为困难模式（方向颠倒）
    this.init();
};

Snake.prototype = {
    //创建二维数组
    multiArray:function(m,n){
        var array = new Array(m);
        for(var i=0;i<m;i++){
            array[i] = new Array(n);
        }
        return array ;
    },
    //给函数绑定作用域(修正this)
    bind:function(fn,context){
        return function(){
            return fn.apply(context,arguments);
        }
    },
    //返回随机点
    randomPoint:function(initX,initY,endX,endY){
        var initx = initX||0;
        var inity = initY||0;
        var endx = endX||(this.mapX-1);
        var endy = endY||(this.mapY-1);
        var p=[];
        p[0] = Math.floor(Math.random()*(endx-initx))+initx;
        p[1] = Math.floor(Math.random()*(endy-inity))+inity;
        return p ;
    },
    //判断点是否在蛇身的任一位置,pos:从身上的哪个位置开始判断
    pointInSnake:function(point,pos){
        var snakeArray= this.snakeArray ;
        if(point instanceof Array){
            var i = pos||0 ;
            for(i;i<snakeArray.length;i++){
                if(point[0]===snakeArray[i][0]&&point[1]===snakeArray[i][1]){
                    return true;
                }
            }
        }
        return false;
    },
    //判断蛇是否撞墙
    isWall:function(point){
        if(point instanceof Array){
            if(point[0]<0||point[0]>this.mapX-1||point[1]<0||point[1]>this.mapY-1){
                return true;
            }
        }
        return false;
    },
    //计算分数(以蛇长度5为分支，如果长12，则score=5*1+5*2+2*3,蛇长于20后的都以5分算)
    getScore:function(){
        var length = this.snakeArray.length;
        var score = 0;
        var i = parseInt(length/5);		//临界分值
        if(i===0){
            score = length ;
        }
        else{
            i = i>4?4:i ;	//若蛇长超过20则临界分值为4
            var j=i;
            while(j>0){
                score += 5*j ;
                j--;
            }
            score+=(length-5*i)*(i+1);	//最大分值为临界分值+1
        }
        return score;
    },
    //创建初始地图
    createMap:function(){
        //用document作为全局变量导入html
        var table = document.createElement("table");
        var tbody = document.createElement("tbody");
        for(var i=0;i<this.mapX;i++){
            var tr = document.createElement("tr");
            for(var j=0;j<this.mapY;j++){
                var td = document.createElement("td");
                this.Map[i][j] = tr.appendChild(td) ;
            }
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        table.id = this.snakeId;
        document.body.appendChild(table);
    },
    //设置蛇的背景色，在这里使用CSS控制样式
    painSnake:function(){
        var snakeArray = this.snakeArray ;
        for(var i=0;i<snakeArray.length;i++){
            var snake_temp1 = snakeArray[i][0],
                snake_temp2 = snakeArray[i][1];
            this.Map[snake_temp1][snake_temp2].className = "snake";
        }
    },
    //初始化蛇的初始位置
    initSnake:function(){
        this.snakeArray = [] ;
        this.snakeArray.push([1,3]);//方法向数组的末尾添加一个或多个元素，并返回新的长度
        this.snakeArray.push([1,2]);
        this.snakeArray.push([1,1]);
        //设置蛇的背景色
        this.painSnake();
        //设置蛇头的背景色,className=css中
        this.Map[this.snakeArray[0][0]][this.snakeArray[0][1]].className = "snake_head";
    },
    //食物
    initfood:function(){
        this.foodArray = this.randomPoint();//随机产生一个食物坐标
        //此处判断随机食物的位置是否就在蛇身位置，如果是的话重新产生食物
        if(this.pointInSnake(this.foodArray)){
            this.initfood();
            return false;
        }
        this.Map[this.foodArray[0]][this.foodArray[1]].className = "food";
    },
    //绑定键盘事件
    keyDown:function(pressKey){
        var Key = pressKey||window.event;
        var keycode = Key?Key.keyCode:0;//得到键盘的Ascall值
        console.log(keycode);
        if(keycode===32){window.location.reload();}	//按下空格键，刷新页面
        if(keycode===13){							//回车键控制开始/暂停
            if(this.stop){
                if(this.Hard){
                    this.directkey=38;
                }
                this.move();
                this.stop=false;
            }
            else{
                if(this.snakeTimer){clearInterval(this.snakeTimer);}//清空计时器
                this.stop=true;
            }
        }
        if(keycode>=37&&keycode<=40){				//方向键改变蛇的移动方向
            if(!this.stop){this.directkey=keycode;}
        }
        //按W加速
        if(keycode===87){
            this.addSpeed();
        }
        //按S减速
        if(keycode===83){
            this.decreaseSpeed();
        }
        //按H增加皮肤
        if(keycode===72){
            if(this.skin) {
            this.skin = false;
            }
            else {
                this.skin = true;
            }
        }
        //按N键困难
        if(keycode===78){
            if(this.Hard){
                this.Hard=false;
            }
            else{
                this.Hard=true;
            }

        }
        return false;
    },
    //减速
    decreaseSpeed:function(){
    if(this.speed-2>=0) {
        this.speed-=2;
    }
    else{
        this.speed=0;
    }
    if(!this.stop) {
        this.move();
       }
    },
    //绑定加速按钮
    addSpeed:function(){
    this.speed+=2;
    if(!this.stop) {
        this.move();
       }
    },
    //实现蛇运动的主函数
    main:function(){
        var	headx = this.snakeArray[0][0],
            heady = this.snakeArray[0][1],
            temp = this.snakeArray[this.snakeArray.length-1] ,
            isEnd = false ,
            msg = '' ;
        //根据方向键的控制确定方向
        //困难模式
        if(this.Hard){
            switch(this.directkey){
                case 37:
                    if(this.goY!==-1){this.goY=1;this.goX=0} 	//防止控制蛇往相反反方向走
                    break;
                case 38:
                    if(this.goX!==-1){this.goX=1;this.goY=0}
                    break;
                case 39 :
                    if(this.goY!==1){this.goY=-1;this.goX=0}
                    break;
                case 40:
                    if(this.goX!==1){this.goX=-1;this.goY=0}
            }
        }
        else {
            switch (this.directkey) {
                case 37:
                    if (this.goY !== 1) {
                        this.goY = -1;
                        this.goX = 0
                    } 	//防止控制蛇往相反反方向走
                    break;
                case 38:
                    if (this.goX !== 1) {
                        this.goX = -1;
                        this.goY = 0
                    }
                    break;
                case 39:
                    if (this.goY !== -1) {
                        this.goY = 1;
                        this.goX = 0
                    }
                    break;
                case 40:
                    if (this.goX !== -1) {
                        this.goX = 1;
                        this.goY = 0
                    }
            }
        }
        headx += this.goX;
        heady += this.goY;
        //判断是否吃到食物
        if(headx===this.foodArray[0]&&heady===this.foodArray[1]){
            this.snakeArray.unshift(this.foodArray);	//将食物插入到蛇头位置
            this.initfood();		//生成另一个食物
            if(this.snakeArray.length>4){		//控制蛇加速
                if(this.snakeArray.length===5){
                    this.speed += 5;
                }
                else if(this.snakeArray.length===10){
                    this.speed += 3;
                }
                else if(this.snakeArray.length===20){
                    this.speed += 3;
                }
                else if(this.snakeArray.length===30){
                    this.speed += 3;
                }
                this.move();
            }
        }
        else{
            for(var i=this.snakeArray.length-1;i>0;i--){
                this.snakeArray[i] = this.snakeArray[i-1] ;
            }
            this.snakeArray[0] = [headx,heady];
            //判断是否吃到自己
            if(this.pointInSnake(this.snakeArray[0],1)){
                isEnd=true;
                msg = "很不幸你把自己吃了";
            }
            //判断是否撞墙
            else if(this.isWall(this.snakeArray[0])){
                isEnd =true;
                msg = "你咋撞墙了？？";
            }
            //判断游戏是否结束
            if(isEnd){
                if(this.snakeTimer){clearInterval(this.snakeTimer)}
                var score = this.getScore();
                if(confirm(msg+"你的分数是："+score+"！ 是否重新开始？")){
                    this.reset();
                }
                return false;
            }
            if(this.skin) {
                this.Map[temp[0]][temp[1]].className = "notsnake_hard";
            }
            else{
                this.Map[temp[0]][temp[1]].className = "notsnake_easy";
            }
        }
        this.painSnake();
        this.Map[headx][heady].className = "snake_head";

    },
    //控制蛇运动的函数
    move:function(){
        var _this = this;
        if(_this.snakeTimer){clearInterval(_this.snakeTimer);}
        _this.snakeTimer = setInterval(_this.bind(_this.main,_this),Math.floor(3000/this.speed));
    },
    //重置
    reset:function(){
        this.directkey = 39 ; 	//按下的方向键
        this.goX = 0 ; 		//蛇横向移动的位移，1或-1
        this.goY = 0 ; 		//蛇纵向移动的位移，1或-1
        this.speed = this.oldSpeed ;
        this.stop = true ;
        this.Hard=false;
        this.init();
    },

    //函数入口
    init:function(){
        var _this = this,
            snake_id = document.getElementById(_this.snakeId)||0 ;
        if(snake_id){
            document.body.removeChild(snake_id);
        }
        _this.Map = _this.multiArray(_this.mapX,_this.mapY);
        _this.createMap();	//创建地图
        _this.initSnake();	//初始化蛇
        _this.initfood();		//生成食物
        document.onkeydown = _this.bind(_this.keyDown,_this);	//绑定键盘事件
    },

};

var SNAKE=new Snake(20,20,'eatSnake',10);

