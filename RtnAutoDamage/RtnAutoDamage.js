// Options
var RtnAutoDamage = RtnAutoDamage || {};

RtnAutoDamage.Options = {

    HEALTH_BAR: 'bar1',
    // Turn track makes it so that the damage interface is only sent to the player whose turn it is. 
    // Requires RtnRoundFramework!!!
    //TODO: Dont forget to turn the default to false after script is done!!!
    ENABLE_TURN_TRACK: true,
    ANNOUNCE_PLAYER_DAMAGE: true,
    ANNOUNCE_MONSTER_DAMAGE: true,
}

RtnAutoDamage.AutoDamage = {

    enabled: true,
    lastDamage: [],
    lastDamageTypes: [],

}

if (!RtnRoundFramework) {

    RtnAutoDamage.AutoDamage.enabled = false;
    log('RtnAutoDamage: No RtnRoundFramework found!');

}

on('ready', () => {

    log('RT: RtnAutoDamage ready!');

});

on('chat:message', async origMsg => {

    if (!RtnAutoDamage.AutoDamage.enabled) return;

    const message = _.clone(origMsg);

    if (message.inlinerolls && (/{{dmg\d=/).test(message.content)) {

        RtnAutoDamage.AutoDamage.lastDamage, RtnAutoDamage.AutoDamage.lastDamageTypes =  [];
        
        message.content = extractRoll(message);

        const buttons = `[Attack](!autoDamage regularAttack " style="font-size:0px"><img src="https://s3.amazonaws.com/files.d20.io/images/19/Vp6EsSd3aGqqL78ZPmw1WQ/icon.png?1575370629)
        [CritAttack](!autoDamage critAttack " style="font-size:0px"><img src="https://s3.amazonaws.com/files.d20.io/images/45/WqJ5IsRZ6gqwkicslVkRuQ/icon.png?1575370659)
        [Heal](!autoDamage heal " style="font-size:0px"><img src="https://s3.amazonaws.com/files.d20.io/images/9/Ocz5uo9OTzzqpVHfOEYqqQ/icon.png?1575370618)`

        await sendChat('', buttons);


    } else return;

    if (message.type === 'api' && message.content.includes('!autoDamage')) {

        const command = message.content.replace('!autoDamage ', '');

        switch (command) {

            case 'regularAttack':
                log('regular Attack');
                break;
            
            case 'critAttack':
                log('critAttack');
                break;
            
            case 'heal':
                log('heal');
                break;

            default: return;

        }
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

    function getValueFromExtractedRoll(msgContent, rollProperty){

        const pattern = new RegExp('{{' + rollProperty + '=(.+?)}}');
        let propertyValue;

        msgContent.replace(pattern, (_match, result) => {

            if ((/^\d+$/).test(result)) {

                 propertyValue = parseInt(result);

            } else {

                propertyValue = result;

            } 
        });

        return propertyValue;

    }
});
