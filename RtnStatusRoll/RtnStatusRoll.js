'use strict';

on('ready', () => {
    log('Status Roll ready');
});

on('chat:message', async origMsg => {

    const msg = _.clone(origMsg);

    if (msg.inlinerolls && (/{{dmg\d=/).test(msg.content)) {

        let totalDamage = 0;
        msg.inlinerolls.forEach(roll => {
            
            totalDamage += roll.results.total; 
        });
        log(totalDamage);
        msg.content = extractRoll(msg);
        const damageType = getValueFromRoll(msg, 'dmg1type');
        log(`Regex damage: ${getValueFromRoll(msg, 'dmg1') + getValueFromRoll(msg, 'dmg2')}`);

        await sendChat('', `/desc Damage: ${totalDamage}\n/desc Damage type: ${damageType}!`);
        
    }
});

function extractRoll(msg) {

    return _.chain(msg.inlinerolls)
        .reduce(function(m,v,k){
            m[`$[[${k}]]`]=v.results.total || 0;
            return m;
        },{})
        .reduce(function(m,v,k){
            return m.replace(k,v);
        },msg.content)
        .value();
}

function getValueFromRoll(msg, field){
    const pattern = new RegExp(`{{${field}=(.+?)}}`);
    let result;

    msg.content.replace(pattern, (_match, fieldValue) => {
        result = fieldValue;
    });

    if (/^\d+$/.test(result)) {
        return parseInt(result);
    } else {
        return result;
    }
}
