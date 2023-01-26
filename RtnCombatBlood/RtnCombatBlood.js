'use strict'

// Options
//------------------------------------------------------------------
const combatBloodOptions = {
    
    HEALTH_BAR: 'bar1',
    BLOOD_TYPE_PREFIX: 'blood_',
    DEFAULT_BLOOD_GRAPHIC_NAME: 'blood_default',
    MIN_ALLOWED_MULTIPLIER: 0.10,
    MAX_SIZE_MULTIPLIER: 1.5,
    BLOOD_BASE_SIZE: {
        WIDTH: 400,
        HEIGHT: 400
    }
};
//------------------------------------------------------------------

on('ready', () => {

    log(('RT: CombatBlood ready!'));

    on('add:character', function(character) {

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
    });
});

on(`change:graphic:${combatBloodOptions.HEALTH_BAR}_value`, function(obj, prev) {

    const graphic = _.clone(obj);

    const currentHealthVal = graphic.get(`${combatBloodOptions.HEALTH_BAR}_value`);
    const prevHealthVal = prev[`${combatBloodOptions.HEALTH_BAR}_value`];
    const character =  getObj('character', graphic.get('_represents'));

    if (!character) return;

    const damageDealt = currentHealthVal - prevHealthVal;
    const characterBleeds = getAttrByName(character.id, 'canBleed') || 1;

    if (damageDealt < 0 && characterBleeds == 1) {

        const bloodScaleMultiplier = Math.abs(damageDealt / graphic.get(`${combatBloodOptions.HEALTH_BAR}_max`));
        if (bloodScaleMultiplier < combatBloodOptions.MIN_ALLOWED_MULTIPLIER) return;

        const characterBleedType = getAttrByName(character.id, 'bleedType') || 'default';

        let bloodGraphics = findObjs({
            _type: 'handout',
            name: combatBloodOptions.BLOOD_TYPE_PREFIX + characterBleedType
        });

        if (!bloodGraphics.length) {

            log(`RT: Did not find bloodgraphic ${combatBloodOptions.BLOOD_TYPE_PREFIX + characterBleedType}, attempting default ${combatBloodOptions.DEFAULT_BLOOD_GRAPHIC_NAME}`);

            bloodGraphics = findObjs({
                _type: 'handout',
                name: combatBloodOptions.DEFAULT_BLOOD_GRAPHIC_NAME
            });

            if (!bloodGraphics.length) return log('RT: No bloodgraphics found!');
        }

        let bloodWidth = combatBloodOptions.BLOOD_BASE_SIZE.WIDTH * bloodScaleMultiplier;
        let bloodHeight = combatBloodOptions.BLOOD_BASE_SIZE.HEIGHT * bloodScaleMultiplier;

        const maximumWidth = graphic.get('width') * combatBloodOptions.MAX_SIZE_MULTIPLIER;
        const maximumHeight = graphic.get('height') * combatBloodOptions.MAX_SIZE_MULTIPLIER;

        if (bloodWidth > maximumWidth || bloodHeight > maximumHeight && combatBloodOptions.BLOOD_BASE_SIZE.WIDTH >  0) {

            bloodWidth = maximumWidth;
            bloodHeight = maximumHeight;
        }
        const MAX_ROTATION = 360;

        toFront(createObj('graphic',  {
            
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

});

on('chat:message', function(obj) {

    const msg = _.clone(obj);
    if (msg.type === 'api' && msg.content.includes('!blood') && playerIsGM(msg.playerid)) {

        const command = msg.content.replace('!blood ', '');

        if (command === 'clear') {
            const bloodGraphicsOnPlayerPage = findObjs({
                _pageid: Campaign().get('playerpageid'),
                _type: 'graphic',
                name: 'rtnCombatBlood'
            });

            _.each(bloodGraphicsOnPlayerPage, function(bloodGraphic) {
                bloodGraphic.remove();
            });
        }
    }
});
