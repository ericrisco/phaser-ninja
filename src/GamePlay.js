var levelConfig;
var levelsConfig = [];

GamePlayManager = {

    init: function(){

        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

    },
    preload: function(){

        //Images
        game.load.image("background", "assets/images/background.png");
        game.load.image("objects1", "assets/images/objects1.png");
        game.load.image("objects2", "assets/images/objects2.png");
        game.load.image("ninja", "assets/images/ninja.png");
        game.load.image("ninjaRed", "assets/images/ninjaRed.png");
        game.load.image("iconLive", "assets/images/iconLive.png");

        //Sprites
        game.load.spritesheet("smoke", "assets/images/smoke.png", 125, 125, 20);
        game.load.spritesheet("buttonPlay", "assets/images/buttonPlay.png", 200, 76, 2);
        game.load.spritesheet("buttonContinue", "assets/images/buttonContinue.png", 200, 76, 2);

        //Sounds
        game.load.audio("loopMusic", "assets/sounds/musicLoop.mp3");
        game.load.audio("sfxLoose", "assets/sounds/sfxLoose.mp3");
        game.load.audio("sfxHit", "assets/sounds/sfxHit.mp3");

        //JSON LEVELS
        game.load.json("level0", "assets/config/level0.json");
        game.load.json("level1", "assets/config/level1.json");
        this.levelsConfig = [];
        this.levelsConfig.push("level0");
        this.levelsConfig.push("level1");

        //Fonts
        game.load.bitmapFont("fontWhite", "assets/fonts/bitmapFonts/fontWhite.png", "assets/fonts/bitmapFonts/fontWhite.fnt")
        
    },
    create: function(){

        //Images ORDER of creation matters!!
        game.add.sprite(0, 0, "background");

        this.ninjaGroup = game.add.group();
        this.smokeGroup = game.add.group();

        game.add.sprite(0, 0, "objects1");
        game.add.sprite(0, 0, "objects2");

        //Lives
        this.lives = 3;
        this.arrayIconLives = [];
        this.arrayIconLives[0] = game.add.sprite(200, game.height - 45, "iconLive");
        this.arrayIconLives[1] = game.add.sprite(250, game.height - 45, "iconLive");
        this.arrayIconLives[2] = game.add.sprite(300, game.height - 45, "iconLive");

        //Level Text
        this.txtCurrentLevel = game.add.bitmapText(70, game.height - 20, "fontWhite", "LEVEL 1", 25);
        this.txtCurrentLevel.anchor.setTo(0, 1);

        //Background play button
        var pixel = game.add.bitmapData(1,1);
        pixel.ctx.fillStyle = "#000000";
        pixel.ctx.fillRect(0,0,1,1);
        this.bgMenu = game.add.sprite(1,1,pixel);
        this.bgMenu.width = game.width;
        this.bgMenu.height = game.height;
        this.bgMenu.alpha = 0.5;

        //GAME OVER Text
        this.txtMsgEndLevel = game.add.bitmapText(game.width/2, game.height/2, "fontWhite", "GAME OVER", 55);
        this.txtMsgEndLevel.anchor.setTo(0.5);
        this.txtMsgEndLevel.visible = false;

        //Play Button
        this.buttonPlay = game.add.button(game.width/2, game.height*0.8, "buttonPlay", this.startGame, this, 1, 0 , 1, 0);
        this.buttonPlay.anchor.setTo(0.5);

        //Continue Button
        this.buttonContinue = game.add.button(game.width/2, game.height*0.8, "buttonContinue", this.nextLevel, this, 1, 0 , 1, 0);
        this.buttonContinue.anchor.setTo(0.5);
        this.buttonContinue.visible = false;

        //Score
        this.currentScore = 0;
        this.txtCurrentScore = game.add.bitmapText(100, 35, "fontWhite", this.currentScore.toString(), 55);
        this.txtCurrentScore.anchor.setTo(0.5);
        this.scoreTextTween = game.add.tween(this.txtCurrentScore.scale).to({
            x: [1, 1.5, 1], y: [1, 1.5, 1]
        }, 500, Phaser.Easing.Elastic.Out, false, 0, 0, false);

        //Time left
        this.txtTimeLeft = game.add.bitmapText(950, 35, "fontWhite", "", 55);
        this.txtTimeLeft.anchor.setTo(0.5);

        //Sounds
        this.loopMusic = game.add.audio("loopMusic");
        this.sfxLoose = game.add.audio("sfxLoose");
        this.sfxHit = game.add.audio("sfxHit");

    },
    startGame: function(){
        this.level = 0;
        this.currentScore = 0;
        this.lives = 3;
        this.refreshArrayLives();
        this.prepareLevel();
    },
    refreshArrayLives: function(){
        this.arrayIconLives.forEach(function(element, index){
            element.visible = index < this.lives;
        },this)
    },
    prepareLevel: function(){

        this.loopMusic.loop = true;
        this.loopMusic.play();

        this.buttonPlay.visible = false;
        this.buttonContinue.visible = false;
        this.bgMenu.visible = false;
        this.txtMsgEndLevel.visible = false;

        this.txtCurrentLevel.text = "LEVEL " + (this.level + 1);

        this.txtCurrentScore.text = this.currentScore.toString();

        var levelJSON = this.levelsConfig[this.level];
        this.levelConfig = game.cache.getJSON(levelJSON);

        this.levelConfig.ninjas.forEach(function(actual, index){
            var ninja = new Ninja(index, actual.sprite, actual.x0, actual.y0, actual.x1, actual.y1, actual.scale, actual.angle, actual.timeAnimation, actual.timeDelay);
            this.ninjaGroup.add(ninja);
        },this);

        game.time.events.add(1000, this.callBackShowNinja, this);

        this.timeLeft = this.levelConfig.timeLeft;
        this.txtTimeLeft.text = this.timeLeft.toString();
        this.timerDown = game.time.events.loop(1000, this.callBackTimeDown, this);

    },
    nextLevel: function(){
        this.level++;
        if(this.level >= this.levelsConfig.length){
            this.gameFinished();
        }else{
            this.prepareLevel();
        }
    },
    callBackShowNinja: function(){
        var time = this.levelConfig.minTime + Math.random() * this.levelConfig.deltaTime;
        console.log(time);
        this.timerNinja = game.time.events.add(time, this.callBackShowNinja, this);
        this.showNinja();
    },
    callBackTimeDown: function(){
        this.timeLeft--;
        this.txtTimeLeft.text = this.timeLeft.toString();
        if(this.timeLeft <= 0){
            this.levelComplete();
        }
    },
    showNinja: function(){
        var newNinja = this.getRandomNinja();
        if(newNinja != null){
            newNinja.Appear();
        }
    },
    getRandomNinja: function(){
        var ninjasAvailable = this.ninjaGroup.children.filter(function(element, index){
            return !element.alive;
        });
        console.log(ninjasAvailable);

        if(ninjasAvailable.length == 0){
            return null;
        }

        var randomNinja = ninjasAvailable[game.rnd.integerInRange(0, ninjasAvailable.length - 1)];
        return randomNinja;

        console.log("Available");
    },
    hitNinja: function(id, x, y, scale, angle){
        this.sfxHit.play();
        var currentSmoke = this.smokeGroup.getFirstDead();
        if(currentSmoke==null){
            currentSmoke = this.smokeGroup.create(x, y, "smoke");
            currentSmoke.animations.add("explode", [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]);
            currentSmoke.anchor.setTo(0.5, 1);
        }

        currentSmoke.reset(x, y);
        currentSmoke.scale.setTo(scale);
        currentSmoke.angle = angle;
        currentSmoke.animations.play("explode", 16).onComplete.add(function(sprite, animation){
            sprite.kill();
        });

        this.increaseScore();
    },
    increaseScore: function(){
        this.currentScore += 100;
        this.txtCurrentScore.text = this.currentScore.toString();
        this.scoreTextTween.start();
    },
    looseLive: function() {
        this.sfxLoose.play();
        this.lives--;
        this.refreshArrayLives();
        if(this.lives <= 0){
            this.gameOver();
        }
    },
    levelComplete: function(){
        this.loopMusic.stop();
        this.destroyNinjaGroup();
        this.bgMenu.visible = true;
        this.buttonContinue.visible = true;
        game.time.events.remove(this.timerNinja);
        game.time.events.remove(this.timerDown);
        this.txtMsgEndLevel.visible = true;
        this.txtMsgEndLevel.text = "LEVEL COMPLETE";
    },
    gameOver: function(){
        this.loopMusic.stop();
        this.destroyNinjaGroup();
        this.bgMenu.visible = true;
        this.buttonPlay.visible = true;
        game.time.events.remove(this.timerNinja);
        game.time.events.remove(this.timerDown);
        this.txtMsgEndLevel.visible = true;
        this.txtMsgEndLevel.text = "GAME OVER"; 
    },
    gameFinished: function(){
        this.loopMusic.stop();
        this.destroyNinjaGroup();
        this.bgMenu.visible = true;
        this.buttonContinue.visible = false;
        this.buttonPlay.visible = true;
        game.time.events.remove(this.timerNinja);
        game.time.events.remove(this.timerDown);
        this.txtMsgEndLevel.visible = true;
        this.txtMsgEndLevel.text = "GAME FINISHED";
    },
    destroyNinjaGroup: function(){
        this.ninjaGroup.forEach(function(element){
            element.kill();
        }, this);
        this.ninjaGroup.removeAll(true);
    },
    update: function(){
        
    }

}

var game = new Phaser.Game(1012, 657, Phaser.AUTO);

game.state.add('gameplay', GamePlayManager);

game.state.start('gameplay');