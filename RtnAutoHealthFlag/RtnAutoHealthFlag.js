on('change:graphic', async function(obj) {

  const character = getObj('character', obj.get('_represents'));
  const type = (character.get('controlledby') === '') ? 'Monster' : 'Player';

  if (obj.get('bar1_max') === '') {

      const hpAttributeVal = getAttrByName(character.id, 'hp', 'max');
      
      obj.set('bar1_value', hpAttributeVal);
      obj.set('bar1_max', hpAttributeVal);

    }
   
    if (obj.get('bar1_value') <= obj.get('bar1_max') / 2 
        && type === 'Monster') {


      if (obj.get('status_broken-heart') === false) {

        obj.set({

          'status_broken-heart': true
  
        });

        await sendChat('', `/desc ${obj.get('name')} is bloodied!`);

      }

    } else {

        obj.set({

            'status_broken-heart': false

        });

    }

    if (obj.get('bar1_value') <= 0
      	&& obj.get('status_dead')) {

      if (type === 'Monster') {

        obj.set({
          'status_dead': true,
          'status_broken-heart': false
       });

       await sendChat('', `/desc ${obj.get('name')} is dead!`);

      } else {

        obj.set({

          'status_death-zone': true,
          'status_broken-heart': false

        });

        await sendChat('', `/desc ${obj.get('name')} is downed!`);

      }
      
    } else {

      obj.set({
        'status_dead': false
      });

    }

});
