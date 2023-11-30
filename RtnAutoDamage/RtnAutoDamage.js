var RtnAutoDamage = RtnAutoDamage || (function () {

    const options = {

        HEALTH_BAR: 'bar1',
        ANNOUNCE_PLAYER_DAMAGE: true,
        ANNOUNCE_MONSTER_DAMAGE: true

    };

    const handleChatMessage = async function (origMsg) {

        const message = _.clone(origMsg);

        if (message.inlinerolls && (/{{dmg\d=/).test(message.content)) {

            handleInlineDamageRoll(message);

        }

        if (message.type === 'api' && message.content.includes('!autoDamage')) {

            handleApiCommand(message);

        }



    };

    function handleInlineDamageRoll(message) {

        const extractedRoll = extractRoll(message);
        const [dmg1, dmg2, dmg1type, dmg2type] = getMultipleValFromExtractedRoll(
            extractedRoll,
            ['dmg1', 'dmg2', 'dmg1type', 'dmg2type']);

        let crit1 = 0;
        let crit2 = 0;

        if (getValueFromExtractedRoll(message.content, 'crit')) {

            [crit1, crit2] = getMultipleValFromExtractedRoll(extractedRoll, ['crit1', 'crit2']);

        }

        const ACTION_BASIC_ATTACK = `\n[Attack selected](&#96;!autoDamage regularAttack ${message.playerid} ${dmg1} ${dmg2} ${dmg1type} ${dmg2type} ${crit1} ${crit2} " style="font-size:16px"><img src="https://s3.amazonaws.com/files.d20.io/images/19/Vp6EsSd3aGqqL78ZPmw1WQ/icon.png?1575370629)`;
        const ACTION_HEAL = `\n[\tHeal selected](&#96;!autoDamage heal ${message.playerid} ${dmg1} ${dmg2} ${dmg1type} ${dmg2type} ${crit1} ${crit2} " style="font-size:16px"><img src="https://s3.amazonaws.com/files.d20.io/images/9/Ocz5uo9OTzzqpVHfOEYqqQ/icon.png?1575370618)`;

        return sendChat('Combat Menu', `${ACTION_BASIC_ATTACK + ACTION_HEAL}`);

    }

    function handleApiCommand(message) {

        const args = message.content.replace('!autoDamage ', '').split(' ');
        if (args[1] !== message.playerid || !playerIsGM(message.playerid)) return;

        const targets = message.selected;

        const apiButtonData = {

            command: args[0],
            sentBy: args[1],
            primaryDamage: parseInt(args[2]),
            secondaryDamage: parseInt(args[3]),
            primaryDamageType: args[4],
            secondaryDamageType: args[5],
            primaryCritDamage: parseInt(args[6]),
            secondaryCritDamage: parseInt(args[7])

        };

        switch (apiButtonData.command) {

            case 'regularAttack':
                executeRegularAttack(targets, apiButtonData);                

                break;

            case 'heal':
                log('Heal');
                break;

            default: return;

        }
    };

    function executeRegularAttack(targets, apiButtonData) {

        targets.forEach(async target => {

            const graphic = getObj('graphic', target._id);
            const character = getObj('character', graphic.get('_represents'));
            const type = (character.get('controlledby') === '') ? 'Monster' : 'Player';
            const currentHealth = graphic.get(`${options.HEALTH_BAR}_value`);
            const totalDamage = apiButtonData.primaryDamage + apiButtonData.secondaryDamage + apiButtonData.primaryCritDamage + apiButtonData.secondaryDamage;

            log(currentHealth - totalDamage);
            log(currentHealth);
            graphic.set(`${options.HEALTH_BAR}_value`, currentHealth - totalDamage);

            if (typeof RtnCombatBlood !== 'undefined') {

                log('Found RtnCombatBlood');
                RtnCombatBlood.createBlood(graphic, currentHealth);
            }

            if (typeof RtnHealthFlag !== 'undefined') {

                log('Found RtnHealthFlag');
                RtnHealthFlag.updateHealthFlags(graphic);
            }

            if (options.ANNOUNCE_MONSTER_DAMAGE && type === 'Monster') {
                return await sendChat('', `/desc ${character.get('name')} received ${totalDamage} ${apiButtonData.primaryDamageType}/${apiButtonData.secondaryDamageType} damage!`);
            }

            if (options.ANNOUNCE_PLAYER_DAMAGE && type === 'Player') {
                return await sendChat('', `/pdesc ${character.get('name')} received ${totalDamage} ${apiButtonData.primaryDamageType}/${apiButtonData.secondaryDamageType} damage!`);
            }

        });


    }

    function extractRoll(msg) {

        return _.chain(msg.inlinerolls)
            .reduce(function (m, v, k) {
                m['$[[' + k + ']]'] = v.results.total || 0;
                return m;
            }, {})
            .reduce(function (m, v, k) {
                return m.replace(k, v);
            }, msg.content)
            .value();
    }

    function getValueFromExtractedRoll(msgContent, rollProperty) {

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

    function getMultipleValFromExtractedRoll(extractedRoll, fieldsToBeExtracted) {

        const extractedValues = [];

        fieldsToBeExtracted.forEach(field => {

            extractedRoll.replace(new RegExp('{{' + field + '=(.*?)}}'), (_match, result) => {

                if ((/^\d+$/).test(result)) {

                    extractedValues.push(parseInt(result));

                } else {

                    extractedValues.push(result);

                }
            });
        });

        return extractedValues;
    }

    const registerEventHandlers = function () {
        on('chat:message', handleChatMessage);
    };

    return {

        registerEventHandlers

    };

})();


on('ready', () => {

    RtnAutoDamage.registerEventHandlers();
    log('RT: AutoDamage ready!');

});
