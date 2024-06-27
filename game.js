// game.js
$(document).ready(function() {
    let isAllySelected = false;
    let isSkillSelected = false;
    let isGameOnPause = false;

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    window.playOut = function(moves) {
        for(action of moves) {
            if (action[1] == 'damage'){
                damage(action[2],action[3])
                delay(2000);
            } else {
                applyStatus(action[2],action[3],action[4])
                delay(2000);
            }
        }
            moves = {
                'knight' : {
                    'skill': null,
                    'target': null
                },
                'mage': {
                    'skill': null,
                    'target': null
                },
                'archer': {
                    'skill' : null,
                    'target': null,
                }
              };

              $('.disabled').removeClass('disabled');
              $('.targetedBymKnight').removeClass('targetedBymKnight');
              $('.targetedBymMage').removeClass('targetedBymMage');
              $('.targetedBymArcher').removeClass('targetedBymArcher');
              isGameOnPause = false;
              clearTargets();
        
    }

    function sendState() {
        let knightState = {
            'HP'    : $('.knight').find('.hp').text(),
            'RAGE'  : $('.knight').find('.rage').text(),

            'POSION': $('.knight').find('.poison').text(),
            'WEAKEN': $('.knight').find('.weaken').text(),
            'FRAGILE': $('.knight').find('.fragile').text(),
            'PIERCE': $('.knight').find('.pierce').text(),
            'SHIELD': $('.knight').find('.shield').text(),
            'POWER' : $('.knight').find('.power').text()    
        }
        let mageState = {
            'HP'    : $('.mage').find('.hp').text(),
            'MANA'  : $('.mage').find('.mana').text(),

            'POSION': $('.mage').find('.poison').text(),
            'WEAKEN': $('.mage').find('.weaken').text(),
            'FRAGILE': $('.mage').find('.fragile').text(),
            'PIERCE': $('.mage').find('.pierce').text(),
            'SHIELD': $('.mage').find('.shield').text(),
            'POWER' : $('.mage').find('.power').text()    
        }
        let archerState = {
            'HP'    : $('.archer').find('.hp').text(),
            'CONCENTRATION'  : $('.archer').find('.concentration').text(),

            'POSION': $('.archer').find('.poison').text(),
            'WEAKEN': $('.archer').find('.weaken').text(),
            'FRAGILE': $('.archer').find('.fragile').text(),
            'PIERCE': $('.archer').find('.pierce').text(),
            'SHIELD': $('.archer').find('.shield').text(),
            'POWER' : $('.archer').find('.power').text()    
        }

        let enemyKnightState = {
            'HP'    : $('#eKnight').find('.hp').text(),
            'RAGE'  : $('#eKnight').find('.rage').text(),

            'POSION': $('#eKnight').find('.poison').text(),
            'WEAKEN': $('#eKnight').find('.weaken').text(),
            'FRAGILE': $('#eKnight').find('.fragile').text(),
            'PIERCE': $('#eKnight').find('.pierce').text(),
            'SHIELD': $('#eKnight').find('.shield').text(),
            'POWER' : $('#eKnight').find('.power').text()    
        }

        let enemyMageState = {
            'HP'    : $('#eMage').find('.hp').text(),
            'MANA'  : $('#eMage').find('.mana').text(),

            'POSION': $('#eMage').find('.poison').text(),
            'WEAKEN': $('#eMage').find('.weaken').text(),
            'FRAGILE': $('#eMage').find('.fragile').text(),
            'PIERCE': $('#eMage').find('.pierce').text(),
            'SHIELD': $('#eMage').find('.shield').text(),
            'POWER' : $('#eMage').find('.power').text()    
        }

        let enemyArcherState = {
            'HP'    : $('#eArcher').find('.hp').text(),
            'CONCENTRATION'  : $('#eArcher').find('.concentration').text(),

            'POSION': $('#eArcher').find('.poison').text(),
            'WEAKEN': $('#eArcher').find('.weaken').text(),
            'FRAGILE': $('#eArcher').find('.fragile').text(),
            'PIERCE': $('#eArcher').find('.pierce').text(),
            'SHIELD': $('#eArcher').find('.shield').text(),
            'POWER' : $('#eArcher').find('.power').text()    
        }

        let send = { // Статус всей игры
            'knightState'   : knightState,
            'mageState'     : mageState,
            'archerState'   : archerState,

            'enemyKnightState': enemyKnightState,
            'enemyMageState'  : enemyMageState,
            'enemyArcherState': enemyArcherState,

            'moves'         : moves
        }
        $('.unitSprite.ally').addClass('disabled');
        isGameOnPause = true;
        return send;
    }

    $('#readyButton').on('click', function() {
        getStateToServer(sendState());
    })

    function damage(unitId, amount) {  
        let element;
        if (unitId.startsWith('m')) {
            element = $('#' + unitId).siblings('.unitSprite').find('.meter.hp');
            damageElement($('#' + unitId).parent());
        } else {
            element = $('#' + unitId).find('.meter.hp');
            damageElement($('#' + unitId));
        }
        let currentHP = parseInt(element.text());
        if (currentHP - amount > 0) {
            element.text(currentHP - amount);
        } else {
            element.text(0)
            $('#' + unitId).addClass('dead')
        }

    }

    function applyStatus(unitId, effect, amount) {
        let element;
        if (unitId.startsWith('m')) {
            element = $('#' + unitId).siblings('.unitSprite').find(`.status .${effect}`);
        } else {
            element = $('#' + unitId).find(`.status .${effect}`);
        }
        let currentAmount = parseInt(element.text());
        if (currentAmount+amount > 0) {
            element.css('display', '');
            element.text(currentAmount + amount);
            shakeElement(element);
        } else {
            element.text(0);
            element.css('display', 'none');
        }
        
    }
    
    
    $('#test').on('click', function() {
        applyStatus('mMage', 'shield', 10);
        applyStatus('mMage', 'poison', 15);
        applyStatus('eKnight', 'pierce', 20)
    });

    let moves = {
        'knight' : {
            'skill': null,
            'target': null
        },
        'mage': {
            'skill': null,
            'target': null
        },
        'archer': {
            'skill' : null,
            'target': null,
        }
      };

    
    function damageElement(element) {
        element.addClass('takeDamage');
        setTimeout(function() {
            element.removeClass('takeDamage');
        }, 200);
    }

    function shakeElement(element) {
        element.addClass('shake');
        setTimeout(function() {
            element.removeClass('shake');
        }, 500);
    }

    function resetButtons() {
        $('#eKnight').off('click');
        $('#eMage').off('click');
        $('#eArcher').off('click');

        $('#mKnight').off('click');
        $('#mMage').off('click');
        $('#mArcher').off('click');
    }
    function clearTargets(target){
        $('#eKnight').removeClass(target);
        $('#eMage').removeClass(target);
        $('#eArcher').removeClass(target);

        $('#mKnight').removeClass(target);
        $('#mMage').removeClass(target);
        $('#mArcher').removeClass(target);
    }
    function playClick() {
        var audio = document.getElementById('click-sound');
        audio.currentTime = 0;
        audio.play();
    }
    function playClickDenied() {
        var audio = document.getElementById('clickDenied-sound');
        audio.currentTime = 0;
        audio.play();
    }

    $('.unitSprite.ally').on('click', function() {
        if ($(this).parent().find('.allySelector').hasClass('dead') || isGameOnPause) {
            playClickDenied();
        } else {
        isAllySelected = true;
        const selectedUnit = $(this).siblings('.allySelector').attr('id');
        $('.unitSprite.ally').removeClass('active');
        $('.skill').removeClass('active');
        isSkillSelected = false;
        $('.unitSprite.enemy').removeClass('selectable');
        $('.allySelector').removeClass('selectable');
        $(this).addClass('active');
        shakeElement($(this));
        playClick();
        
        if (selectedUnit == 'mKnight') {
            $('#defoultSkills').replaceWith($('<div id="defoultSkills"><div id="skillAtk" class="skill targeEnemy">Slash</div><div id="skillDef" class="skill targetAlly">Shield</div></div>'))
            $('#bonusSkills').replaceWith($('<div id="bonusSkills"><div id="skill1" class="skill targeEnemy">Strong slash</div><div id="skill2" class="skill targetAlly">Anger</div><div id="skill3" class="skill targeEnemy">Sacrafice</div></div>'))
        } else if (selectedUnit == 'mMage'){
            $('#defoultSkills').replaceWith($('<div id="defoultSkills"><div id="skillAtk" class="skill targeEnemy">Punch</div><div id="skillDef" class="skill targetAlly">Shield</div></div>'))
            $('#bonusSkills').replaceWith($('<div id="bonusSkills"><div id="skill1" class="skill targeEnemy">Posion</div><div id="skill2" class="skill targetAlly">Heal</div><div id="skill3" class="skill targeEnemy">Fireball</div></div>'))
        } else {
            $('#defoultSkills').replaceWith($('<div id="defoultSkills"><div id="skillAtk" class="skill targeEnemy">Shoot</div><div id="skillDef" class="skill targetAlly">Shield</div></div>'))
            $('#bonusSkills').replaceWith($('<div id="bonusSkills"><div id="skill1" class="skill targeEnemy">Concentrate</div><div id="skill2" class="skill targeEnemy">Weaken</div><div id="skill3" class="skill targeEnemy">Pierce</div></div>'))
        }
        
        $('.skill').on('click', function() {
            if (isAllySelected) {
                isSkillSelected = true;
                let selectedSkill = $(this).attr('id')
                $('.skill').removeClass('active');
                $(this).addClass('active');
                shakeElement($(this));
                playClick();
                const target = $(this).attr('class').split(' ')[1]; // Получаем класс который отвечает за то, на кого скил направлен
                if          (target == 'targeEnemy') {
                    $('.unitSprite.enemy').addClass('selectable');
                    $('.allySelector').removeClass('selectable');
                } else if   (target == 'targetAlly') {
                    $('.unitSprite.enemy').removeClass('selectable');
                    $('.allySelector').addClass('selectable');
                    
                }

                $('.selectable').on('click', function() {
                    if ($(this).hasClass('dead')) {
                        playClickDenied();
                    } else {
                    if (isSkillSelected) {
                        let selectedTarget = $(this).attr('id');
                        console.log(selectedUnit,selectedSkill,selectedTarget);
                        clearTargets(`targetedBy${selectedUnit}`);
                        $(this).addClass(`targetedBy${selectedUnit}`);
                        console.log(this);
                        $(`#${selectedUnit}`).siblings().addClass(`targetedBy${selectedUnit}`);
                        console.log(selectedUnit);
                        
                        shakeElement($(this));
                        playClick();
                        moves[selectedUnit.slice(1).toLowerCase()].skill = selectedSkill;
                        moves[selectedUnit.slice(1).toLowerCase()].target = selectedTarget;
                        resetButtons();
                        $('.unitSprite.ally').removeClass('active');
                        $('.skill').removeClass('active');
                        $('.unitSprite.enemy').removeClass('selectable');
                        $('.allySelector').removeClass('selectable');
                        isSkillSelected = false;
                        isAllySelected = false;
                    }
                    }
                })
                
            } else {
                playClickDenied()
                
            };
            
        });

    }});
});