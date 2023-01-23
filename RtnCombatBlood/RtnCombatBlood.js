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
    MAXIMUM_SIZE: 0,
    MAXIMUM_BLOOD: 0
};

on(`change:graphic:${combatBloodOptions.HEALTH_BAR}_value`, function(obj, prev) {

    const graphic = _.clone(obj);

    const currentHealthVal = graphic.get(`${combatBloodOptions.HEALTH_BAR}_value`);
    const prevHealthVal = prev[`${combatBloodOptions.HEALTH_BAR}_value`]
    const character = getObj('character', graphic.get('_represents'));
    const damageDealt = currentHealthVal - prevHealthVal;

    if (damageDealt < 0 && getAttrByName(character.id, 'canBleed')) {

        const bloodScaleMultiplier = graphic.get(`${combatBloodOptions.HEALTH_BAR}_max`) / damageDealt;
        log(bloodScaleMultiplier);

        toFront(createObj('graphic',  {
            name: 'rtnCombatBlood',
            imgsrc: combatBloodOptions.BLOOD_TYPES.RESOURCE_BLOOD[randomInteger(combatBloodOptions.BLOOD_TYPES.RESOURCE_BLOOD.length) - 1],
            left: graphic.get('left'),
            top: graphic.get('top'),
            width: graphic.get('width') * bloodScaleMultiplier,
            height: graphic.get('height') * bloodScaleMultiplier,
            layer: 'map',
            pageid: graphic.get('_pageid')
        }));

        log('Created blood under graphic');

    }

});

on('chat:message', function(msg) {

});

on('add:character', function(character) {

    createObj('attribute', {
        name: "canBleed",
        current: 1,
        characterid: character.id
    });
    createObj('attribute', {
        name: "bleedingType",
        current: 'default',
        characterid: character.id
    })
});
