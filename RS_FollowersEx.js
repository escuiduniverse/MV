//================================================================
// RS_FollowersEx.js
// ---------------------------------------------------------------
// The MIT License
// Copyright (c) 2020 biud436
// ---------------------------------------------------------------
// Free for commercial and non commercial use.
//================================================================
/*:
 * @plugindesc <RS_FollowersEx>
 * @author biud436
 *          
 * @param Max Follower Members
 * @type number
 * @desc Specify the max members in followers
 * @default 100
 * 
 * @help
 * 이 플러그인을 사용하면 전투에 참여하지 않는 다양한 팔로워를 추가할 수 있습니다.
 * 게임 시작 시에 팔로워를 추가하고자 한다면 [데이터베이스-액터]의 메모 란에 
 * 다음과 같은 노트 태그를 추가하시기 바랍니다.
 * 
 *  <FOLLOWER>
 * 
 * 게임 시작 직후, 동적으로 추가하고자 한다면 다음과 같은 플러그인 명령을 사용하세요.
 * 
 * AddFollower actorId
 * Removefollower actorId
 * 
 * 또는 스크립트 명령어를 사용하시기 바랍니다.
 * 
 * $gameParty.addFollowerEx(actorId);
 * $gameParty.removeFollowerEx(actorId);
 * 
 */

var Imported = Imported || {};
Imported.RS_FollowersEx = true;

var RS = RS || {};
RS.FollowersEx = RS.FollowersEx || {};

(function($) {
    
    "use strict";

    var parameters = $plugins.filter(function (i) {
      return i.description.contains('<RS_FollowersEx>');
    });
    
    parameters = (parameters.length > 0) && parameters[0].parameters;

    RS.FollowersEx.Params = {
        maxFollowersMembers: Number(parameters["Max Follower Members"] || 100),
        isPassable: false,
    };

    /**
     * Test Case
     */
    RS.FollowersEx.finder = {

        readAllFiles(root, ext, files) { 
            if(!Utils.isNwjs()) return;
            const fs = require('fs');
            const path = require('path');

            if(!root) return;
            if(!fs.existsSync(root)) return;
            let contents = fs.readdirSync(root, 'utf8');
    
            contents = contents.map(e => {
                return path.join(root, e);
            });
            contents.forEach(sub => {
                if(fs.statSync(sub).isDirectory()) {
                    this.readAllFiles(sub, ext, files);
                } else if(fs.statSync(sub).isFile()) {
                    if(ext.indexOf(path.extname(sub)) >= 0) {
                        files.push(sub.replace(/\\/g, "/"));
                    }
                }
            });
        },

        readCharacterData() {
            if(!Utils.isNwjs()) return;
            if(!Utils.isOptionValid("test")) return;
            const fs = require('fs');
            const path = require('path');
            const mainPath = path.dirname(process.mainModule.filename);
            const imgPath = path.join(mainPath, "img", "characters");
            
            let files = [];

            this.readAllFiles(imgPath.replace(/\\/g, "/"), [".png"], files);

            const types = [".rpgmvp"];
            
            let items = [];

            files.forEach(file => {
                let rootFilename = file;

                if(!fs.lstatSync(rootFilename).isFile()) {
                    return;
                }

                // 전체 경로를 포함하지 않은 순수 파일명
                let tempFileName = file.split("/").slice(-1)[0];
                var ext = path.extname(file);

                // 암호화된 파일인가?
                if(types.indexOf(ext) > -1) {
                    throw new Error("암호화된 파일은 읽을 수 없습니다.");
                }

                let filename = tempFileName.split(".")[0];

                if(ImageManager.isBigCharacter(filename)) {
                    items.push({
                        characterName: filename, 
                        characterIndex: 0
                    });
                } else {
                    for(var i = 0; i < 8; i++) {
                        items.push({
                            characterName: filename, 
                            characterIndex: i
                        });
                    }
                }
            });

            return items;
        }

    }

    if(Utils.isOptionValid("test")) {
        RS.FollowersEx.Params.dataActors = RS.FollowersEx.finder.readCharacterData();
        RS.FollowersEx.Params.counter = 0;
    }

    //================================================================
    // Game_Player
    //================================================================     
    var alias_Game_Player_canPass = Game_Player.prototype.canPass;
    Game_Player.prototype.canPass = function(x, y, d) {
        var x2 = $gameMap.roundXWithDirection(x, d);
        var y2 = $gameMap.roundYWithDirection(y, d);
        if(this.isFollowerPassable(x2, y2) && !RS.FollowersEx.Params.isPassable) {
            return false;
        }
        return alias_Game_Player_canPass.call(this, x, y, d);
    }
  
    Game_Player.prototype.isFollowerPassable = function (x, y) {
        return this._followers.isFollowerPassable(x, y);
    };    

    //================================================================
    // Game_Party
    //================================================================ 

    var alias_Game_Party_initialize = Game_Party.prototype.initialize;
    Game_Party.prototype.initialize = function() {
        alias_Game_Party_initialize.call(this);
        this._followersEx = this.followerMembers() || [];
    };

    /**
     * Find out the Note Tag from the Database.
     */
    Game_Party.prototype.followerMembers = function() {
        const actors = $dataActors.slice(1);
        actors.filter(e => {
            if(!e) return false;
            const note = e.note || "";
            const lines = e.note.split(/[\r\n]+/).map(i => i.trim());
            const matched = lines.filter(j => /\<(?:FOLLOWER)\>/i.exec(j));
            if(matched && matched[0]) {
                return true;
            }
            return false;
        });
        return actors.map(e => e.id);
    };

    /**
     * Add a new follower in members array.
     */
    Game_Party.prototype.addFollowerEx = function(actorId) {
        const actor = $dataActors[actorId];
        if(actor) {
            this._followersEx.push(actorId);
        }
    };

    /**
     * Expect removing a new follower in members array.
     */
    Game_Party.prototype.removeFollowerEx = function(actorId) {
        if(this._followersEx.contains(actorId)) {
            this._followersEx.splice(targetIndex, 1);
        }
    };

    //================================================================
    // Game_FollowerEx
    //================================================================    

    class Game_FollowerEx extends Game_Follower {
        
        constructor(memberIndex) {
            super(memberIndex);
            
            const actorId = $gameParty.followerMembers()[this._memberIndex];

            this._tracedMember = $dataActors[actorId];

            if(Utils.isOptionValid("test") && !this._tracedMember) {
                this._tracedMember = RS.FollowersEx.Params.dataActors[RS.FollowersEx.Params.counter];
                RS.FollowersEx.Params.counter = (RS.FollowersEx.Params.counter + 1) % RS.FollowersEx.Params.dataActors.length;
            }

            this._isMovableIntelligent = false;

            this._lifeTime = 45;
            this._pending = [];
            this._state = "move";
            this._idleTime = performance.now();

            this.setThrough(false);
        }
        
        refresh() {
            const actor = this.actor();
            const isVisible = this.isVisible();

            let characterName = isVisible ? actor.characterName : '';
            let characterIndex = isVisible ? actor.characterIndex : 0;

            this.setImage(characterName, characterIndex);            
        }
        
        actor() {
            return this._tracedMember;
        }

        update() {
            super.update();
        }

        moveToTarget(character) {
            var sx = this.deltaXFrom(character.x);
            var sy = this.deltaYFrom(character.y);
            if (sx !== 0 && sy !== 0) {
                this.moveDiagonally(sx > 0 ? 4 : 6, sy > 0 ? 8 : 2);
            } else if (sx !== 0) {
                this.moveStraight(sx > 0 ? 4 : 6);
            } else if (sy !== 0) {
                this.moveStraight(sy > 0 ? 8 : 2);
            }

            const distance = $gameMap.distance(this.x, this.y, $gamePlayer.x, $gamePlayer.y);

            if(distance > 3) {
                this.setMoveSpeed(this._moveSpeed + 2);
                this.setMoveFrequency(this._moveFrequency + 2);
            } else {
                const moveSpeed = Math.min($gamePlayer.realMoveSpeed() - 1, 1);
                this.setMoveSpeed(moveSpeed);
                this.setMoveFrequency($gamePlayer.moveFrequency());
            }           

        }

        chaseCharacter(character) {
            this.moveToTarget(character);
        }
    };

    //================================================================
    // Game_Followers
    //================================================================
    
    /**
     * This doesn't expect to call previous function that didn't change, 
     * So it can even conflict with other follower plugins.
     */
    Game_Followers.prototype.initialize = function() {

        const max = RS.FollowersEx.Params.maxFollowersMembers;

        this._visible = $dataSystem.optFollowers;
        this._gathering = false;
        this._data = [];

        for (let i = 0; i < max; i++) {
            this._data.push(new Game_FollowerEx(i));
        }

    };

    Game_Followers.prototype.isFollowerPassable = function(x, y) {
        let result = this._data.some(function(follower) {
          return follower.posNt(x, y);
        }, this);
        return result;
    };

    //================================================================
    // Game_Interpreter
    //================================================================    

    var alias_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        alias_Game_Interpreter_pluginCommand.call(this, command, args);
        switch(command.toLowerCase()) {
            case "addfollower":
                $gameParty.addFollowerEx(Number(args[0]));
                break;
            case "removefollower":
                $gameParty.removeFollowerEx(Number(args[0]));
                break;                
        }
    };
    
})(RS.FollowersEx);