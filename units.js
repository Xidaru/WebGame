class Unit {
    constructor(hp,name,poisonOnMe,weakenOnMe,fragileOnMe,pierceOnMe,shieldOnMe,dmgBoostOnMe) {
        this.name = name;
        this.hp = hp;
        //Статус эфекты
        this.poisonOnMe = poisonOnMe; // Урон каждый ход
        
        this.weakenOnMe = weakenOnMe; // Мой урон * 0.5
        this.fragileOnMe = fragileOnMe; // Урон по мне * 1.5
        
        this.pierceOnMe = pierceOnMe; // Урон проходящий по мне игнорирует щиты 
        this.shieldOnMe = shieldOnMe; // Поглящает на себя урон
        this.dmgBoostOnMe = dmgBoostOnMe; // Мой урон * 1.5
    };
    selfHeal(heal) {
        this.hp = this.hp + heal;
        
    };
    selfDamage(dmg) {
        const incomingDmg = (dmg * (1.5*this.fragileOnMe) - (this.shieldOnMe*(1-this.pierceOnMe)));
        this.shieldOnMe = this.shieldOnMe - incomingDmg;
        this.hp = this.hp - incomingDmg;
    };
    enemyDamage(dmg) {
        return dmg * (0.5*this.weakenOnMe + 1.5*this.dmgBoostOnMe)
    }
}

class Knight extends Unit{
    constructor() {
        super(100,'Berserker');
    }
    
    atkSkill() {
        return {'target' : 'enemy',
                'damage' : this.enemyDamage(15),
                'apply'  : {}
        };
    }
    defSkill() {
        return {'target' : 'ally',
                'damage' : 0,
                'apply'  : {'shield' : 15}
        };
    }
    skill1() {
        return {'target' : 'ally',
                'damage' : 0,
                'apply'  : {'shield' : 15}
        };
    }
}