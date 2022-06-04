const { getVoiceConnection, joinVoiceChannel } = require("@discordjs/voice");
const {Permissions} = require("discord.js");
module.exports = {
    name: "skip",
    description: "Skip the song being played atm",
    aliases: ["s"],
    run: async (client,message,args,prefix) => {
        try{
        if(!message.member.voice.channelId) return message.reply({content: `**👎 Connect to a Voice Channel first**`});

        const oldConnection= getVoiceConnection(message.guild.id);
        if(!oldConnection ) return message.reply({content: `**👎 I'm not connected at any Voice Channel!**`})

        if(oldConnection && oldConnection.joinConfig.channelId!=message.member.voice.channelId) return message.reply({content: `**👎 I'm  in a different Voice Channel!**`})

        let queue = client.queues.get(message.guild.id);
        if (!queue) return message.reply({content: `**👎 There isn't any song being played**`});

        if(!queue.tracks || queue.tracks.length <= 1){
            return interaction.reply({ ephemeral: true, content: `👎 **Nothing to skip**`}).catch(() => null); 
        };

        console.log(queue.tracks[0]);
        console.log(oldConnection);
        let song = queue.tracks[0].title;

        queue.skipped= true;

        oldConnection.state.subscription.player.stop();

        message.reply({content: `** :wave: Skipped song ${song}**`});
        } catch (error){
            console.log(error);
            message.reply({content: `**❌ Couldn't skip the song due to:  \`\`\` ${String(error?.message || error).substring(0,1900)} \`\`\` `}).catch(()=> null);
        }
    }
}