const { getVoiceConnection, joinVoiceChannel } = require("@discordjs/voice");
const {Permissions} = require("discord.js");
module.exports = {
    name: "skip",
    description: "Skip the song being played atm",
    aliases: ["s"],
    run: async (client,interaction,args,prefix) => {
        if(!interaction.member.voice.channelId) return interaction.reply({ ephemeral: true, content: `**👎 Connect to a Voice Channel first**`}).catch(() => null); ;

        const oldConnection= getVoiceConnection(interaction.guild.id);
        if(!oldConnection ) return interaction.reply({ephemeral: true, content: `**👎 I'm not connected at any Voice Channel!**`}).catch(() => null); ;

        if(oldConnection && oldConnection.joinConfig.channelId!=interaction.member.voice.channelId) return interaction.reply({ephemeral: true, content: `**👎 I'm  in a different Voice Channel!**`});

        let queue = client.queues.get(interaction.guild.id);
        if (!queue) return interaction.reply({ephemeral: true, content: `**👎 There isn't any song being played**`}).catch(() => null); 
        if(!queue.tracks || queue.tracks.length <= 1){
            return interaction.reply({ ephemeral: true, content: `👎 **Nothing to skip**`}).catch(() => null); 
        }
        console.log(queue.tracks[0]);
        console.log(oldConnection);
        let song = queue.tracks[0].title;

        queue.skipped= true;

        oldConnection.state.subscription.player.stop();

        interaction.reply({ephemeral: false, content: `** :wave: Skipped song ${song}**`});

    },
}