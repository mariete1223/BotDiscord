module.exports = {
    name: "ping",
    description: "Shows the bot´s ping",
    aliases: ["latency"],
    run: async (client,message,args,prefix) => {
        message.reply({
            content: `:ping_pong: ++My ping is ${client.ws.ping}ms`
        }).catch(() => null);
        return;
    }
}