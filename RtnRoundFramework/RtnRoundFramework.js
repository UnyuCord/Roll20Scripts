var RtnRoundFramework = RtnRoundFramework || (function () {

    const options = {
        // Clears turnOrder after ending the encounter.
        clearTurnOrderPostStopTrack: true
    }

    const handleApiCommand = async function (msg) {

        if (msg.type === 'api' && msg.content.includes('!combat')) {

            const command = msg.content.replace('!combat ', '');

            switch (command) {

                case 'init':

                    if (!playerIsGM(msg.playerid)) return;

                    state.rtnEncounter = {

                        combatRound: 1,
                        turn: 1,
                        numOfCombatants: 0,
                        trackingActive: false

                    };

                    turnOrder = getTurnOrder();

                    await sendChat('', '/desc Combat has started!\n/desc Roll for initiative!');
                    await sendChat('', '/w gm [Start Tracking](!combat startTrack)');
                    break;

                case 'startTrack':

                    if (!playerIsGM(msg.playerid)) return;

                    turnOrder = getTurnOrder();

                    if (!turnOrder) return sendChat('Error', '/w gm The turn order is empty! Roll for initiative!');

                    state.rtnEncounter.numOfCombatants = turnOrder.length;
                    state.rtnEncounter.trackingActive = true;


                    await sendChat('', `/desc The battle has started!\n`);

                    outputEndOfRoundInfo();
                    break;


                case 'nextRound':

                    if (!state.rtnEncounter.trackingActive) return;

                    turnOrder = getTurnOrder();
                    state.rtnEncounter.numOfCombatants = turnOrder.length;

                    /* 
                    The turnorder could be empty when the GM removes every token, in that case
                    we simply end the encounter
                    */
                    if (state.rtnEncounter.numOfCombatants <= 0) {

                        state.rtnEncounter.trackingActive = false;
                        return sendChat('Error', '/w gm The turn order is empty! Ending combat...');
                    }

                    const turnOf = getObj('graphic', turnOrder[state.rtnEncounter.turn - 1].id);

                    if (!playerIsGM(msg.playerid) && msg.playerid !== turnOf.get('controlledby')) return;

                    state.rtnEncounter.turn++;

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

                    if (options.clearTurnOrderPostStopTrack) {

                        turnOrder = null;
                        Campaign().set('turnorder', JSON.stringify(turnOrder));

                    }

                    break;

                default:
                    return;
            }

        }
    }

    const outputEndOfRoundInfo = async function () {

        turnOrder = getTurnOrder();

        const turnOf = getObj('graphic', turnOrder[state.rtnEncounter.turn - 1].id);

        await sendChat('', `/desc ROUND: ${state.rtnEncounter.combatRound}`);
        await sendChat('', `/desc It is ${turnOf.get('name')}'s turn\n[Next turn](!combat nextRound) [End Encounter](!combat stopTrack)`);

        sendPing(turnOf.get('left'), turnOf.get('top'), Campaign().get('playerpageid'));

    }

    const orderTurnOrder = function (currentState, previousState) {

        if (currentState.get('turnorder') === previousState.turnorder) return;

        const sortedTurnOrder = getTurnOrder().sort((a, b) => b.pr - a.pr);

        currentState.set('turnorder', JSON.stringify(sortedTurnOrder));

    }

    const removeFromTurnOrder = function (token) {

        let entry;
        turnOrder = getTurnOrder();

        if (entry = _.find(turnOrder, function (turnOrderEntry) { return turnOrderEntry.id == token.get('_id') })) {


            const newTurnOrder = _.without(turnOrder, entry);

            if (!turnOrder[state.rtnEncounter.turn - 1].id) {
                state.rtnEncounter.combatRound++;
                state.rtnEncounter.turn = 1;
            }

            Campaign().set('turnorder', JSON.stringify(newTurnOrder));


        }
    }


    const getTurnOrder = function () {
        return JSON.parse(Campaign().get('turnorder'));
    }

    const registerEventHandlers = function () {

        on('chat:message', handleApiCommand);
        on('change:campaign:turnorder', (obj, prev) => orderTurnOrder(obj, prev));
        /*
         For some reason, when a token gets removed, it removes it from the 
         turnorder on the tabletop but api-side it doesn't, thats why we remove
         it ourselves
        */
        on('destroy:token', removeFromTurnOrder)

    }

    return {

        registerEventHandlers

    }


})();

on('ready', () => {

    if (!state.rtnEncounter) {

        state.rtnEncounter = {

            // Increases after all turns were made
            combatRound: 1,
            // Increases upon clicking the "Next turn" button
            turn: null,
            // Tracks the total number of tokens in the turnOrder
            numOfCombatants: 0,
            // If set to false: will make some commands not do anything
            trackingActive: false

        };
    }

    RtnRoundFramework.registerEventHandlers();
    log('RT: RoundFramework ready!');

});
