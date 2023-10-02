var RtnVttText = RtnVttText || (function() {

    const options = {
        usePlayerColor: true,
        font: "Arial",
        fontSize: 16,
        fontBlackOutline: true,
        simpleDraw: false,
        fadeAnimations: true,
        lingerDuration: 10
    }

    const drawText = function(text, portrait) {

    }

    const handleChatEvent = function(origMessage) {
        const message = _.clone(origMessage);
        const character = getObj('player', message.playerid);
        const currentPage = Campaign().get('playerpageid');
        const 
        // Don't handle when message isn't a normal message or has no content
        if (message.type != 'general' || !message.content) return;

        log(character.get('speakingas'));
        log(currentPage);

        
    }

    const registerEventHandlers = function() {
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