var RtnVttText = RtnVttText || (function () {

    let messageQueue = [];

    const options = {
        usePlayerColor: true,
        font: "Arial",
        fontSize: 16,
        fontBlackOutline: true,
        simpleDraw: false,
        fadeAnimations: true,
        lingerDuration: 10
    }

    const drawText = function (text, portrait) {

    }

    const handleChatEvent = function (origMessage) {
        const message = _.clone(origMessage);
        const character = getObj('player', message.playerid);
        const currentPage = Campaign().get('playerpageid');
    
        // Don't handle when message isn't a normal message, has no content or is by a player.
        if (message.type != 'general' || !message.content || _.contains(character.get('speakingas').split('|'), 'player')) return;

        const characterId = character.get('speakingas').split('|')[1];
        log(characterId);
        log(currentPage);


    }

    const registerEventHandlers = function () {
        on('chat:message', handleChatEvent);
    }

    return {
        drawText,
        registerEventHandlers
    }

})();

on('ready', () => {
    RtnVttText.registerEventHandlers();
    log('RTN: RtnVttText ready!');
});