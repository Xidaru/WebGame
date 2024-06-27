$(document).ready(function() {
    let isAllySelected = false;
    let isSkillSelected = false;

    function damage(unitId, amount) {  
        if (unitId.startsWith('m')) {
            damageElement($('#' + unitId).parent());
            let currentHP = parseInt($('#' + unitId).siblings('.unitSprite').find('.meter.hp').text());
            $('#' + unitId).siblings('.unitSprite').find('.meter.hp').text(currentHP - amount);
        } else {
            damageElement($('#' + unitId));
            let currentHP = parseInt($('#' + unitId).find('.meter.hp').text());
            $('#' + unitId).find('.meter.hp').text(currentHP - amount);
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
        element.text(currentAmount + amount);
        shakeElement(element);
        if (currentAmount+amount > 0) element.css('display', '');
    }
    
    
    $('#test').on('click', function() {
        applyStatus('eMage', 'poison', 15);
        applyStatus('mMage', 'shield', 10);
        applyStatus('mMage', 'poison', 15);
        applyStatus('eKnight', 'pierce', 20)
        damage("mMage", 15)
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
                })
                
            } else {
                playClickDenied()
            };
            
        });

    });
});