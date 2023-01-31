var RtnCombatBlood = RtnCombatBlood || (function() {
    'use strict';

    const options = {

        // Dictates which bar is seen as the health bar
        HEALTH_BAR: 'bar1',
        // A prefix to mark blood graphics in the journal, put '' if you don't want a prefix
        BLOOD_TYPE_PREFIX: 'blood_',
        // Name of the default blood graphic
        DEFAULT_BLOOD_GRAPHIC_NAME: 'blood_default',
        // Minimum needed multiplier to create a blood graphic, change to 0 to allow any value
        MIN_ALLOWED_MULTIPLIER: 0.10,
        // This multiplier dictates the maximum size of a blood graphic, the max blood size is calculated by multiplying the 
        // tokens size by the multiplier
        MAX_SIZE_MULTIPLIER: 1.5,
        // The base width and height of the token before any calculations
        BLOOD_BASE_SIZE: {
            WIDTH: 400,
            HEIGHT: 400
        }
    };

    const createBlood = function(origGraphic, prevHealthVal) {

        const graphic = _.clone(origGraphic);
        const character = getObj('character', graphic.get('_represents'));

        if (!character) return;

        const currentHealthVal = graphic.get(`${options.HEALTH_BAR}_value`);
        const damageDealt = currentHealthVal - prevHealthVal;
        const characterBleeds = getAttrByName(character.id, 'canBleed') || 1;

        if (damageDealt < 0 && characterBleeds == 1) {

            const bloodScaleMultiplier = Math.abs(damageDealt / graphic.get(`${options.HEALTH_BAR}_max`));
            if (bloodScaleMultiplier < options.MIN_ALLOWED_MULTIPLIER) return;

            const characterBleedType = getAttrByName(character.id, 'bleedType') || 'default';

            let bloodGraphics = findObjs({
                _type: 'handout',
                name: options.BLOOD_TYPE_PREFIX + characterBleedType
            });

            if (!bloodGraphics.length) {

                log(`RT: Did not find bloodgraphic ${options.BLOOD_TYPE_PREFIX + characterBleedType}, attempting default ${options.DEFAULT_BLOOD_GRAPHIC_NAME}`);

                bloodGraphics = findObjs({
                    _type: 'handout',
                    name: options.DEFAULT_BLOOD_GRAPHIC_NAME
                });

                if (!bloodGraphics.length) return log('RT: No bloodgraphics found!');
            }

            let bloodWidth = options.BLOOD_BASE_SIZE.WIDTH * bloodScaleMultiplier;
            let bloodHeight = options.BLOOD_BASE_SIZE.HEIGHT * bloodScaleMultiplier;

            const maximumWidth = graphic.get('width') * options.MAX_SIZE_MULTIPLIER;
            const maximumHeight = graphic.get('height') * options.MAX_SIZE_MULTIPLIER;

            if (bloodWidth > maximumWidth || bloodHeight > maximumHeight && options.BLOOD_BASE_SIZE.WIDTH > 0) {

                bloodWidth = maximumWidth;
                bloodHeight = maximumHeight;
            }
            const MAX_ROTATION = 360;

            toFront(createObj('graphic', {

                name: 'rtnCombatBlood',
                imgsrc: bloodGraphics[randomInteger(bloodGraphics.length) - 1].get('avatar').replace('med', 'thumb'),
                left: graphic.get('left') + getRandomSignedNumber(graphic.get('width')),
                top: graphic.get('top') + getRandomSignedNumber(graphic.get('height')),
                width: bloodWidth,
                height: bloodHeight,
                rotation: randomInteger(MAX_ROTATION),
                layer: 'map',
                pageid: graphic.get('_pageid')
            }));

            log(`RT: Created blood under graphic ${graphic.get('name')}`);
        }

        function getRandomSignedNumber(max) {

            return randomInteger(max) * (Math.random() < 0.5 ? -1 : 1);

        }

    };

    const handleChatMessage = function(origMsg) {

        const msg = _.clone(origMsg);
        if (msg.type === 'api' && msg.content.includes('!blood') && playerIsGM(msg.playerid)) {

            const command = msg.content.replace('!blood ', '');

            if (command === 'clear') {
                const bloodGraphicsOnPlayerPage = findObjs({
                    _pageid: Campaign().get('playerpageid'),
                    _type: 'graphic',
                    name: 'rtnCombatBlood'
                });

                _.each(bloodGraphicsOnPlayerPage, function (bloodGraphic) {
                    bloodGraphic.remove();
                });
            }
        }
    };

    const handleAddCharacter = function(character) {

        createObj('attribute', {
            name: 'canBleed',
            current: 1,
            characterid: character.id
        });
        createObj('attribute', {
            name: 'bleedType',
            current: 'default',
            characterid: character.id
        });

    };

    const registerEventHandlers = function() {

        on(`change:graphic:${options.HEALTH_BAR}_value`, (graphic, prev) => createBlood(graphic, prev[`${options.HEALTH_BAR}_value`]));
        on('chat:message', handleChatMessage);
        on('add:character', handleAddCharacter);

    };

    return {

        createBlood,
        registerEventHandlers

    };

})();

on('ready', () => {
    'use strict';

    RtnCombatBlood.registerEventHandlers();
    log(('RT: CombatBlood ready!'));

});
