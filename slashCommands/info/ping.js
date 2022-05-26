module.exports = {
    name: "ping",
    description: "Shows the bot´s ping",
    run: async (client,interaction,args,prefix) => {
        interaction.reply({
            //solo el desencadenante puede verlo
            ephemeral: true,
            content: `:ping_pong: ++My ping is ${client.ws.ping}ms`
        }).catch(() => null);
        return;
    }
}