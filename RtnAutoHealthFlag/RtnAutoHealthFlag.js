var RtnHealthFlag = RtnHealthFlag || (function () {
    'use strict';

    const HEALTH_BAR = 'bar1';

    const updateHealthFlags = async function (graphic) {

        const character = getObj('character', graphic.get('_represents'));
        const type = (character.get('controlledby') === '') ? 'Monster' : 'Player';

        if (graphic.get(`${HEALTH_BAR}_value`) <= 0) {

            if (graphic.get('status_dead') || graphic.get('status_death-zone')) return;

            if (type === 'Monster') {

                graphic.set({
                    'status_dead': true,
                    'status_broken-heart': false
                });

                return sendChat('', `/desc ${graphic.get('name')} is dead!`);

            } else {

                graphic.set({
                    'status_death-zone': true
                });

                return sendChat('', `/desc ${graphic.get('name')} is downed!`);

            }

        } else if (type === 'Player') {

            graphic.set({
                'status_death-zone': false
            });

            return;
            
        }


        if (graphic.get('bar1_value') <= graphic.get('bar1_max') / 2
            && type === 'Monster') {


            if (!graphic.get('status_broken-heart')) {

                graphic.set({

                    'status_broken-heart': true,
                    'status_dead': false

                });

                await sendChat('', `/desc ${graphic.get('name')} is bloodied!`);

            }
        } else {
            graphic.set({'status_broken-heart': false});
        }
    };

    const handleAddGraphic = function (graphic) {

        if (graphic.get('bar1_max') === '') {

            const characterId = getObj('character', graphic.get('_represents')).id;
            const hpAttributeVal = getAttrByName(characterId, 'hp', 'max');

            graphic.set(`${HEALTH_BAR}_max`, hpAttributeVal);
            graphic.set(`${HEALTH_BAR}_value`, hpAttributeVal);
            

        }

    };


    const registerEventHandlers = function () {

        on('add:graphic', handleAddGraphic);
        on('change:graphic', updateHealthFlags);

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
