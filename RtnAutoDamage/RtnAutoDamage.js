'use strict';

// Options
const autoDamageOptions = {

    HEALTH_BAR: 'bar1',
    ANNOUNCE_PLAYER_DAMAGE: true,
    ANNOUNCE_MONSTER_DAMAGE: true,

};

on('ready', () => {

    log('RtnAutoDamage ready');

});

on('chat:message', origMsg => {

    const message = _.clone(origMsg);

    if (message.inlinerolls && (/{{dmg\d=/).test(message.content)) {


        message.content = extractRoll(message);
        log();

    }

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

    function getValueFromRoll(msg, rollname, isString = 0){
        const pattern = new RegExp('{{' + rollname + '=(.+?)}}');
        let result = 0;
        if (isString > 0) {
            msg.content.replace(pattern,(match,rollResult)=>{
                result = rollResult;
            });
        } else {
            msg.content.replace(pattern,(match,rollResult)=>{
            result = parseInt(rollResult);
            });
        }
        return result;
    }

});
