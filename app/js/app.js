class Helpers{
    grab(id){
        return document.getElementById(id);
    }
    
    grabC(clas){
        return document.getElementsByClassName(clas);
    }
    
    handleC(clas, fn){
        let elements = this.grabC(clas);
        for(let item of elements){
            fn(item);   
        }
    }
    
    listen(elementId, event, fn){
        this.grab(elementId).addEventListener(event, fn);
    }
}

class Card{
    constructor(_data){
        let data = _data.split("-");
        this.type = data[1];
        this.nr = data[0];
    }
}

class Hand{
    
}

class KaardiRakendus{
    constructor(){
        firebase.initializeApp(firebaseConfig);
        this.h = new Helpers();
        this.db = firebase.database();
        this.bindEvents();
        this.state = 0; //0 -doing nothing, 1-joining, 2-playing, 3-waiting
        this.currId = this.idGen();
        this.gameId = 0;
        this.turn = false;
    }
    
    showMessage(message, hide = false, duration = -1){
        let messageBox = this.h.grab("message")
        messageBox.textContent = message;
        messageBox.style.display = "block";
        
        if(duration != -1){
            setTimeout(()=>{
                messageBox.style.display = "none";
                messageBox.textContent = "";
            },duration); 
        }
        if(hide){
            messageBox.style.display = "none";
            messageBox.textContent = "";
        }
    }
    
    draw(type, nr){
        return "<div class='card "+type+"'>"+
            "<p class='upperLeft'>"+nr+type+"</p>"+
            "<p class='lowerRight'>"+type+nr+"</p>"+
            "</div>";          
    }
    
    initDeck(){
        let p1 = [];
        let p2 = [];
        let availCards = startCards.slice(0);
        
        for(let i = 0; i < 26; i++){
            let p1rand = Math.floor(Math.random()*availCards.length);
            let p2rand = Math.floor(Math.random()*availCards.length);
            while(p1rand == p2rand){
                p2rand = Math.floor(Math.random()*availCards.length);
            }
            p1.push(availCards[p1rand]);
            p2.push(availCards[p2rand]);
            availCards.splice(p1rand, 1);
            availCards.splice(p2rand, 1);
        }
        
        return [p1,p2];
    }
    
    playGame(){
        this.state = 2;
        this.h.grab("newGame").disabled = true;
        this.h.grab("joinGame").disabled = true;
        
        this.h.handleC("hand", (item)=>{
            item.style.display = "block";
        });
        
        this.h.listen("move", "click",(e)=>{
             
        });
        
        this.db.ref(this.gameId).on("value",()=>{
            if(!this.turn){
                
            }
        });
    }
    
    buildGame(){
        this.gameId = "game"+this.idGen();
        this.turn = true;
        this.showMessage("Waiting for another player! Give this key to the other player: "+this.gameId);
        let [p1Cards, p2Cards] = this.initDeck();
        
        this.db.ref(this.gameId).set({
            player1 : this.currId,
            p1Cards: p1Cards,
            p2Cards: p2Cards,
            turn: 0
        }).then(()=>{
            let count = 0;
            this.db.ref(this.gameId+"/player2").on("value",()=>{
                if(count != 0){
                    this.showMessage("", true);
                    this.playGame();
                }
                count++;
            });
        });
    }
    
    joinGame(){
        this.h.grab("joinGameInput").style.display = "block";
        this.h.listen("join", "click",(e)=>{
            console.log("joining on "+ this.h.grab("joinGameInputKey").value);
            let inputVal = this.h.grab("joinGameInputKey").value;
            this.db.ref(inputVal).once("value").then((s)=>{
                if(s.val() == null){
                    this.showMessage("No game with such id!", false, 2000);
                }else{
                    this.gameId = inputVal;
                    this.db.ref(inputVal).update({player2 : this.currId});
                    this.h.grab("joinGameInput").style.display = "none";
                    this.playGame();
                }
            });
        });
    }
    
    bindEvents(){
        
        this.h.listen("newGame", "click", (e)=>{
            this.state = 3;
            this.h.grab("exitGame").style.display = "block";
            e.target.disabled = true;
            this.h.grab("joinGame").disabled = true;
            this.buildGame();
        });
        
        this.h.listen("joinGame", "click", (e)=>{
            this.state = 1;
            this.h.grab("exitGame").style.display = "block";
            this.h.grab("newGame").disabled = true;
            e.target.disabled = true;
            this.joinGame();
        });
        
        this.h.listen("exitGame", "click", (e)=>{
            if(this.state == 3){
                this.db.ref(this.gameId).set(null);
                this.gameId = 0;
                this.turn = false;
                this.showMessage("", true);
            }
            if(this.state == 1){
                this.h.grab("joinGameInput").style.display = "none";
            }
            if(this.state == 2){
                this.db.ref(this.gameId).set(null);
                this.h.handleC("hand", (item)=>{
                    item.style.display = "none";
                });
            } 
            
            this.h.grab("newGame").disabled = false;
            this.h.grab("joinGame").disabled = false;
            this.state = 0;
            this.h.grab("exitGame").style.display = "none";
        });
        
    }
    
    idGen(){
        return Math.floor(Math.random()*10)+""+
               Math.floor(Math.random()*10)+""+
               Math.floor(Math.random()*10)+""+
               Math.floor(Math.random()*10)+"-"+
               Math.floor(Math.random()*10)+""+
               Math.floor(Math.random()*10)+""+
               Math.floor(Math.random()*10)+""+
               Math.floor(Math.random()*10)+"";
    }    
}

new KaardiRakendus();