'use strict'

on('ready', () => {
    log(('RT: CombatBlood ready!'));
});

// Options
const combatBloodOptions = {
    HEALTH_BAR: 'bar1',
    BLOOD_TYPES: {
        RESOURCE_BLOOD: ['https://s3.amazonaws.com/files.d20.io/images/324305850/gD0DRRM1qG4b11_3P2Tqfg/thumb.png?1674474005',
                        'https://s3.amazonaws.com/files.d20.io/images/324305981/06BnVUK87ka-sev1hSgagA/thumb.png?1674474172',
                        'https://s3.amazonaws.com/files.d20.io/images/324305875/lyGFgvMgtimuysfZ1MsRsA/thumb.png?1674474033']
    },
    MAXIMUM_SIZE: {
        WIDTH: 400,
        HEIGHT: 400
    },
    MAXIMUM_BLOOD: 0
};

on(`change:graphic:${combatBloodOptions.HEALTH_BAR}_value`, function(obj, prev) {

    const graphic = _.clone(obj);

    const currentHealthVal = graphic.get(`${combatBloodOptions.HEALTH_BAR}_value`);
    const prevHealthVal = prev[`${combatBloodOptions.HEALTH_BAR}_value`];
    const character = getObj('character', graphic.get('_represents'));
    const damageDealt = currentHealthVal - prevHealthVal;

    if (damageDealt < 0 && getAttrByName(character.id, 'canBleed')) {

        const bloodScaleMultiplier = Math.abs(damageDealt / graphic.get(`${combatBloodOptions.HEALTH_BAR}_max`));

        let bloodWidth = graphic.get('width') * bloodScaleMultiplier;
        let bloodHeight = graphic.get('height') * bloodScaleMultiplier;

        if (bloodWidth > combatBloodOptions.MAXIMUM_SIZE.WIDTH || bloodHeight > combatBloodOptions.MAXIMUM_SIZE.HEIGHT && combatBloodOptions.MAXIMUM_SIZE.WIDTH > 0) {

            bloodWidth = combatBloodOptions.MAXIMUM_SIZE.WIDTH;
            bloodHeight = combatBloodOptions.MAXIMUM_SIZE.HEIGHT;
        }
        const MAX_ROTATION = 360;
        log(bloodScaleMultiplier);

        toFront(createObj('graphic',  {
            name: 'rtnCombatBlood',
            imgsrc: combatBloodOptions.BLOOD_TYPES.RESOURCE_BLOOD[randomInteger(combatBloodOptions.BLOOD_TYPES.RESOURCE_BLOOD.length) - 1],
            left: graphic.get('left'),
            top: graphic.get('top'),
            width: bloodWidth,
            height: bloodHeight,
            rotation: randomInteger(MAX_ROTATION),
            layer: 'map',
            pageid: graphic.get('_pageid')
        }));

        log('Created blood under graphic');
        
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

on('add:character', function(character) {

    createObj('attribute', {
        name: 'canBleed',
        current: 1,
        characterid: character.id
    });
    createObj('attribute', {
        name: 'bleedingType',
        current: 'default',
        characterid: character.id
    });
});
