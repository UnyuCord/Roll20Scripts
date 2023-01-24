'use strict';

on('chat:message', function(obj) {
    
    const msg = _.clone(obj);

    if (msg.type === 'api' && playerIsGM(msg.playerid)) {

        const args = (msg.content.replace('!rtnfunc ', '')).split(' ');

        if (args[0] === 'removeattr' && args.length > 0) {

            let numOfRemovedOccurences = 0;
            const attributeToBeRemoved = args[1];
            const attributes = findObjs({
                name: attributeToBeRemoved,
                _type: 'attribute'
            });

            _.each(attributes, function(attribute) {

                attribute.remove();
                numOfRemovedOccurences++;
                
            });

            log(`RT: Removed ${numOfRemovedOccurences} occurences of attribute ${attributeToBeRemoved}`);

            return;
        }

        if (args[0] === 'addattr' && args.length > 0) {

            let numOfAddedAttr = 0;

            const attributeToBeAdded = args[1];
            const currentValue = args[2] || '';
            const maxValue = args[3] || '';

            const characters = findObjs({
                _type: 'character'
            });

            _.each(characters, function(character){

                if (!findObjs({_characterid: character.id, _type: 'attribute', name: attributeToBeAdded}).length) {
                    
                    createObj('attribute', {
                        name: attributeToBeAdded,
                        current: currentValue,
                        max: maxValue,
                        characterid: character.id
                    });

                    numOfAddedAttr++;
                    log(`RT: Added attribute ${attributeToBeAdded} to character ${character.get('name')}`);
            }
            });

            log(`RT: Added ${numOfAddedAttr} occurences of attribute ${attributeToBeAdded}`);
            return;
        }
    }
});
