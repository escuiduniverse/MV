//================================================================
// RS_EX_ToolKit.js
// ---------------------------------------------------------------
// The MIT License
// Copyright (c) 2020 biud436
// ---------------------------------------------------------------
// Free for commercial and non commercial use.
//================================================================
/*:
 * @plugindesc <RS_EX_ToolKit>
 * @author biud436
 *          
 * @help
 *
 */

var Imported = Imported || {};
Imported.RS_EX_ToolKit = true;

var RS = RS || {};
RS.EX_ToolKit = RS.EX_ToolKit || {};

(function ($) {

    "use strict";

    var parameters = $plugins.filter(function (i) {
        return i.description.contains('<RS_EX_ToolKit>');
    });

    parameters = (parameters.length > 0) && parameters[0].parameters;

    if (Imported.RS_HangulInput) {

        /**
         * This function allows you to type the event name 
         * and then get an event object that has a certain name into the map. 
         * it shows the message and does scroll the screen as target event.
         */
        Game_Interpreter.prototype.moveToTargetEvent = function () {
            let joinedText = $gameVariables.value(RS.HangulInput.Params.variableId);
            let ret = $gameMap.events().filter(e => e.event().name === joinedText);
            if (ret && ret[0]) {
                const target = ret[0];

                var sx = $gameMap.deltaX($gamePlayer.x, target.x);
                var sy = $gameMap.deltaY($gamePlayer.y, target.y);

                var dir = 0;
                var dist = 0;
                var speed = 6;
                var minDist = 6;

                var dist2 = $gameMap.distance($gamePlayer.x, $gamePlayer.y, target.x, target.y);

                var addScroll = (...args) => {

                    this._list.push({ // 화면의 스크롤
                        "code": 204,
                        "indent": 0,
                        "parameters": [
                            args[0],
                            args[1],
                            args[2]
                        ]
                    });

                };

                var addList = (...args) => {
                    args.forEach(e => {
                        this._list.push(e);
                    })
                };

                if (dist2 >= minDist) {

                    this._list.splice(-1, 1);

                    if (Math.abs(sx) >= minDist) {
                        dir = sx < 0 ? 6 : sx > 0 ? 4 : 0;
                        dist = Math.abs(sx);
                        addScroll(dir, dist, speed);
                    }

                    if (Math.abs(sy) >= minDist) {
                        dir = sy < 0 ? 2 : sy > 0 ? 8 : 0;
                        dist = Math.abs(sy);
                        addScroll(dir, dist, speed);
                    }

                    addList({
                        "code": 230, // 대기
                        "indent": 0,
                        "parameters": [60]
                    }, {
                        "code": 101, // 문장의 표시
                        "indent": 0,
                        "parameters": [
                            "",
                            0,
                            0,
                            2
                        ]
                    }, {
                        "code": 401,
                        "indent": 0,
                        "parameters": [
                            `\\말풍선[${target.eventId()}] 아니 내 이름을 어떻게 알았지?`
                        ]
                    }, { // 끝
                        "code": 0,
                        "indent": 0,
                        "parameters": []
                    });
                }
            }
        };
    }

    /**
     * This function allows you to gain a certain item randomly.
     * 
     * @param {Number} min 아이템 인덱스 최소 범위
     * @param {Number} max 아이템 인덱스 최대 범위
     * @param {Number} type 아이템의 타입 (1: 아이템, 2: 무기구, 3: 방어구)
     * @param {Number} amount 획득할 아이템의 갯수
     */
    Game_Party.prototype.gainRandomItem = function (min, max, type, amount) {
        if (min <= 0) min = 1;
        if ((max - min) <= 0) {
            console.warn("아이템 범위를 잘못 적었습니다. 최소값이 최대치를 넘어갑니다.");
            return;
        }
        let choose = (min, max) => {
            return Math.floor(Math.random() * (max - min + 1) + min)
        };
        if (type <= 0) type = choose(1, 3); // type가 0인 경우, 무기구, 아이템, 방어구 중에 램덤 선택
        let item = null;
        let isValid = () => {
            return false;
        }
        if (type === 1) {
            item = $dataItems;
            isValid = DataManager.isItem;
        } else if (type === 2) {
            item = $dataWeapons;
            isValid = DataManager.isWeapon;
        } else if (type === 3) {
            item = $dataArmors;
            isValid = DataManager.isArmor;
        }
        if (!item) {
            console.warn("아이템 컨테이너가 아직 로드되지 않았습니다.");
            return;
        }
        let idx = choose(min, max);
        if (idx > item.length - 1) idx = item.length - 1;
        if (isValid(item[idx])) {
            this.gainItem(item[idx], amount);
        }
    };

    //==================================================================
    // Plugin Command
    //==================================================================    

    var alias_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        alias_pluginCommand.call(this, command, args);

        if (command === "gain" || command === "획득") {
            min = Number(args[0]);
            max = Number(args[1]);
            type = Number(args[2]);
            amount = Number(args[3]);
            $gameParty.gainRandomItem(min, max, type, amount);
        }
    };

})(RS.EX_ToolKit);