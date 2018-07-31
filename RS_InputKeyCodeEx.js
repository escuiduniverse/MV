/*:
 * @plugindesc <RS_InputKeyCodeEx>
 * @author biud436
 * @help
 * 
 */
/*:ko
 * @plugindesc 전체키 입력을 지원합니다. 영문자 및 한글 자모음 포함. <RS_InputKeyCodeEx>
 * @author 러닝은빛(biud436)
 * @help
 * 
 */

var Imported = Imported || {};
Imported.RS_InputKeyCodeEx = true;

var RS = RS || {};
RS.InputKeyCodeEx = RS.InputKeyCodeEx || {};

(function($) {
    
    $.keyMapper = {
        16: ["shift"],
        17: ["ctrl"],
        18: ["alt"],
        35: ["end"],
        36: ["home"],
        49: ["1", "!"],
        50: ["2", "@"],
        51: ["3", "#"],
        52: ["4", "$"],
        53: ["5", "%"],
        54: ["6", "^"],
        55: ["7", "&"],
        56: ["8", "*"],
        57: ["9", "("],
        48: ["0", ")"],
        45: ["-", "_"],
        43: ["+", "="],        
        65: ["a", "A"],
        66: ["b", "B"],
        67: ["c", "C"],
        68: ["d", "D"],
        69: ["e", "E"],
        70: ["f", "F"],
        71: ["g", "G"],
        72: ["h", "H"],
        73: ["i", "I"],
        74: ["j", "J"],
        75: ["k", "K"],
        76: ["l", "L"],
        77: ["m", "M"],
        78: ["n", "M"],
        79: ["o", "O"],
        80: ["p", "P"],
        81: ["q", "Q"],
        82: ["r", "R"],
        83: ["s", "S"],
        84: ["t", "T"],
        85: ["u", "U"],
        86: ["v", "V"],
        87: ["w", "W"],
        88: ["x", "X"],
        89: ["y", "Y"],
        90: ["z", "Z"],     
        96: ["0"],
        97: ["1"],
        98: ["2"],
        99: ["3"],
        100: ["4"],
        101: ["5"],
        102: ["6"],
        103: ["7"],
        104: ["8"],
        105: ["9"],
        106: ["*"],
        107: ["+"],
        109: ["-"],
        110: ["."],
        111: ["/"],       
        112: ["F1"],
        113: ["F2"],
        114: ["F3"],
        115: ["F4"],
        116: ["F5"],
        117: ["F6"],
        118: ["F7"],
        119: ["F8"],
        120: ["F9"],
        121: ["F10"],
        122: ["F11"],
        123: ["F12"],                            
        186: [";", ":"],
        188: [",", "<"],
        190: [".", ">"],
        191: ["/", "?"],
        219: ["[", "{"],
        220: ["\\", "|"],
        221: ["]", "}"],
        222: ["'", "\""]
    };

    $.keySym = {
        "debug": "F9",
        "ㅁ": "a",
        "ㅠ": "b",
        "ㅊ": "c",
        "ㅇ": "d",
        "ㄷ": "e",
        "ㄸ": "E",
        "ㄹ": "f",
        "ㅎ": "g",
        "ㅗ": "h",
        "ㅑ": "i",
        "ㅓ": "j",
        "ㅏ": "k",
        "ㅣ": "l",
        "ㅡ": "m",
        "ㅐ": "o",
        "ㅒ": "O",
        "ㅔ": "p",
        "ㅖ": "P",
        "ㅂ": "q",
        "ㅃ": "Q",
        "ㄱ": "r",
        "ㄲ": "R",
        "ㄴ": "s",
        "ㅅ": "t",
        "ㅆ": "T",
        "ㅕ": "u",
        "ㅍ": "v",
        "ㅈ": "w",
        "ㅉ": "W",
        "ㅌ": "x",
        "ㅛ": "y",
        "ㅋ": "z",
        "q": 'pageup',   // Q
        "w": 'pagedown', // W
        "x": 'escape',   // X
        "z": 'ok',       // Z
        "0": 'escape',   // numpad 0
        "2": 'down',     // numpad 2
        "4": 'left',    // numpad 4
        "6": 'right',   // numpad 6
        "8": 'up'      // numpad 8                
    };

    Input.getButtonName = function(event) {
        var keyCode = event.which || event.keyCode;
        var mapper = $.keyMapper;
        var hans = Object.keys(mapper);
        var c =  mapper[keyCode];
        var buttonName = "";

        if(hans.indexOf(String(keyCode)) >= 0) {
            if(c instanceof Array) {
                buttonName = (event.shiftKey && c.length > 1) ? c[1] : c[0];        
            } else {
                buttonName = this.keyMapper[keyCode];
            }
        }

        return buttonName;
    };

    var alias_Input_onKeyDown = Input._onKeyDown;
    Input._onKeyDown = function(event) {
        alias_Input_onKeyDown.call(this, event);
        var buttonName = this.getButtonName(event);
        if (buttonName) {
            this._currentState[buttonName] = true;
        }
    };

    var alias_Input_onKeyUp = Input._onKeyUp;
    Input._onKeyUp = function(event) {
        alias_Input_onKeyUp.call(this, event);
        var buttonName = this.getButtonName(event);
        if (buttonName) {
            this._currentState[buttonName] = false;
        }
    };    

    var alias_Input_isTriggered = Input.isTriggered;
    Input.isTriggered = function(keyName) {
        var baseSymbol;
        if(baseSymbol = $.keySym[keyName]) {
            keyName = baseSymbol;
        }
        return alias_Input_isTriggered.call(this, keyName);
    };

    var alias_Input_isPressed = Input.isPressed;
    Input.isPressed = function(keyName) {
        var baseSymbol;
        if(baseSymbol = $.keySym[keyName]) {
            keyName = baseSymbol;
        }        
        return alias_Input_isPressed.call(this, keyName);
    };

    var alias_Input_isRepeated = Input.isRepeated;
    Input.isRepeated = function(keyName) {
        var baseSymbol;
        if(baseSymbol = $.keySym[keyName]) {
            keyName = baseSymbol;
        }                
        return alias_Input_isRepeated.call(this, keyName);
    };

    var alias_Input_LongPressed = Input.isLongPressed;
    Input.isLongPressed = function(keyName) {
        var baseSymbol;
        if(baseSymbol = $.keySym[keyName]) {
            keyName = baseSymbol;
        }                
        return alias_Input_LongPressed.call(this, keyName);
    };

})(RS.InputKeyCodeEx);