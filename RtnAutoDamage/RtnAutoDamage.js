'use strict';

// Options
const autoDamageOptions = {

    HEALTH_BAR: 'bar1',
    ANNOUNCE_PLAYER_DAMAGE: true,
    ANNOUNCE_MONSTER_DAMAGE: true

}

on('ready', () => {

    log('RtnAutoDamage ready');

});

on('chat:message', origMsg => {

    const message = _.clone(origMsg);

    if (message.inlineRolls && (/{{dmg\d=/).test(message.content)) {

        const roll = extractRoll(message);
    
        log(roll.damage);

    }

});

function extractRoll(msg) {

    return _.chain(msg.inlinerolls)
        .reduce(function(m,v,k){
            m['$[['+k+']]']=v.results.total || 0;
            return m;
        },{})
        .reduce(function(m,v,k){
            return m.replace(k,v);
        },msg.content)
        .value();
}

function getValueFromRoll(msg, field) {

}

