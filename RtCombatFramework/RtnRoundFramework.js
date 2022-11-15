on('ready', () => {
    
    log('RT: RoundFramework ready!');

    if (!state.rtnEncounter) {

        state.rtnEncounter = {

            combatRound: 1,
            turn: null,
            numOfCombatants: 0,
            trackingActive: false

        };
    }

    let turnOrder = JSON.parse(Campaign().get('turnorder'));

    on('chat:message', async msg => {

        if (msg.type === 'api' && msg.content.includes('!combat')) {

            const option = msg.content.replace('!combat ', '');

            switch (option) {

                case 'init':

                if (!playerIsGM(msg.playerid)) return;

                    state.rtnEncounter = {

                        combatRound: 1,
                        turn: 1,
                        numOfCombatants: 0,
                        trackingActive: false

                    };

                    turnOrder = JSON.parse(Campaign().get('turnorder'));

                    if (turnOrder) {

                        turnOrder = null;

                        Campaign().set('turnorder', JSON.stringify(turnOrder));

                        log('RT: Emptied the turn order!');

                    }

                    await sendChat('', `/desc Combat has started!!!\n/desc Roll for initiative!\n[Start Tracking](!combat startTrack)`);
                    break;

                case 'startTrack':
                    

                    log(`Is player gm? ${playerIsGM(msg.playerid)}, Player id: ${msg.playerid}`);

                    if(!playerIsGM(msg.playerid)) return;

                    log('Before if empty turnorder query');
                    turnOrder = JSON.parse(Campaign().get('turnorder'));
                    log('Got turnOrder obj!');
                    if (!turnOrder) return sendChat('', '/desc The turn order is empty! Roll for initiative!');
                    log('After if empty turnorder query');

                    state.rtnEncounter.numOfCombatants = turnOrder.length;
                    state.rtnEncounter.trackingActive = true;

                    outputRoundInfo(turnOrder);
                    break;


                case 'nextRound':

                    turnOrder = JSON.parse(Campaign().get('turnorder'));
                    const turnOf = getObj('graphic', turnOrder[state.rtnEncounter.turn - 1].id);

                    if (!state.rtnEncounter.trackingActive || !playerIsGM(msg.playerid) && msg.playerid !== turnOf.get('controlledby')) return;

                    state.rtnEncounter.turn++;
                    state.rtnEncounter.numOfCombatants = turnOrder.length;

                    if (state.rtnEncounter.numOfCombatants < state.rtnEncounter.turn) {

                        state.rtnEncounter.combatRound++;
                        state.rtnEncounter.turn = 1;

                    }

                    outputRoundInfo(turnOrder);
                    break;


                case 'stopTrack':
                    if (!state.rtnEncounter.trackingActive || !playerIsGM(msg.playerid)) return;
                    await sendChat('', '/desc Combat has ended!');
                    state.rtnEncounter.trackingActive = false;
                    break;

                default:
                    return;
            }
        }
    });

    on('change:campaign:turnorder', (obj, prev) => {

        if (obj.get('turnorder') === prev.turnorder) return;

        const turnOrder = JSON.parse(obj.get('turnorder')).sort((a, b) => { 
            return b.pr - a.pr;
        });

        obj.set('turnorder', JSON.stringify(turnOrder));

    });

    async function outputRoundInfo(turnOrder) {

        const turnOf = getObj('graphic', turnOrder[state.rtnEncounter.turn - 1].id);

        await sendChat('', `/desc ROUND: ${state.rtnEncounter.combatRound}`);
        await sendChat('', `/desc It is ${turnOf.get('name')}'s turn\n[Next turn](!combat nextRound) [End Encounter](!combat stopTrack)`);

        sendPing(turnOf.get('left'), turnOf.get('top'), Campaign().get('playerpageid'));

    }
});


