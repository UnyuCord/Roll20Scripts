var RtnRoundFramework = RtnRoundFramework || (function () {

    const handleApiCommand = async function (msg) {

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

                    }

                    await sendChat('', '/desc Combat has started!\n/desc Roll for initiative!');
                    await sendChat('', '/w gm [Start Tracking](!combat startTrack)');
                    break;

                case 'startTrack':

                    if (!playerIsGM(msg.playerid)) return;

                    turnOrder = JSON.parse(Campaign().get('turnorder'));

                    if (!turnOrder) return sendChat('Error', '/w gm The turn order is empty! Roll for initiative!');

                    state.rtnEncounter.numOfCombatants = turnOrder.length;
                    state.rtnEncounter.trackingActive = true;


                    await sendChat('', `/desc The battle has started!\n`);

                    outputEndOfRoundInfo();
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

                    outputEndOfRoundInfo();
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
    }

    const outputEndOfRoundInfo = async function () {

        const turnOf = getObj('graphic', turnOrder[state.rtnEncounter.turn - 1].id);

        await sendChat('', `/desc ROUND: ${state.rtnEncounter.combatRound}`);
        await sendChat('', `/desc It is ${turnOf.get('name')}'s turn\n[Next turn](!combat nextRound) [End Encounter](!combat stopTrack)`);

        sendPing(turnOf.get('left'), turnOf.get('top'), Campaign().get('playerpageid'));

    }

    const orderTurnOrder = function (currentState, previousState) {

        if (currentState.get('turnorder') === previousState.turnorder) return;

        const sortedTurnOrder = JSON.parse(currentState.get('turnorder')).sort((a, b) => b.pr - a.pr);

        currentState.set('turnorder', JSON.stringify(sortedTurnOrder));
    }

    const registerEventHandlers = function () {

        on('chat:message', handleApiCommand);
        on('change:campaign:turnorder', (obj, prev) => orderTurnOrder(obj, prev));

    }

    return {

        registerEventHandlers

    }


})();

on('ready', () => {

    if (!state.rtnEncounter) {

        state.rtnEncounter = {

            combatRound: 1,
            turn: null,
            numOfCombatants: 0,
            trackingActive: false

        };
    }

    RtnRoundFramework.registerEventHandlers();
    log('RT: RoundFramework ready!');

});
