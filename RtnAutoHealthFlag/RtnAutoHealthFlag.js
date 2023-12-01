var RtnHealthFlag = RtnHealthFlag || (function () {
    'use strict';

    const HEALTH_BAR = 'bar1';

    const updateHealthFlags = async function (token) {

        const character = getObj('character', token.get('_represents'));
        const type = (character.get('controlledby') === '') ? 'Monster' : 'Player';

        if (token.get(`${HEALTH_BAR}_value`) <= 0) {

            if (token.get('status_dead') || token.get('status_death-zone')) return;

            if (type === 'Monster') {

                token.set({
                    'status_dead': true,
                    'status_broken-heart': false
                });

                return sendChat('', `/desc ${token.get('name')} is dead!`);

            } else {

                token.set({
                    'status_death-zone': true
                });

                return sendChat('', `/desc ${token.get('name')} is downed!`);

            }

        } else if (type === 'Player') {

            token.set({
                'status_death-zone': false
            });

            return;
            
        }


        if (token.get('bar1_value') <= token.get('bar1_max') / 2
            && type === 'Monster') {


            if (!token.get('status_broken-heart')) {

                token.set({

                    'status_broken-heart': true,
                    'status_dead': false

                });

                await sendChat('', `/desc ${token.get('name')} is bloodied!`);

            }
        } else {
            token.set({'status_broken-heart': false});
        }
    };

    const handleAddGraphic = function (token) {

        if (token.get('bar1_max') === '') {

            const characterId = getObj('character', token.get('_represents')).id;
            const hpAttributeVal = getAttrByName(characterId, 'hp', 'max');

            token.set(`${HEALTH_BAR}_value`, hpAttributeVal);
            token.set(`${HEALTH_BAR}_max`, hpAttributeVal);
            

        }

    };


    const registerEventHandlers = function () {

        on('add:token', handleAddGraphic);
        on('change:token', updateHealthFlags);

    };

    return {

        registerEventHandlers,
        updateHealthFlags

    };

})();

on('ready', () => {

    RtnHealthFlag.registerEventHandlers();

    log('RT: HealthFlag ready!');

});
