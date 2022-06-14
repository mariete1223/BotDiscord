const { getVoiceConnection, joinVoiceChannel } = require("@discordjs/voice");
const Discord = require("discord.js");
module.exports = {
    name: "song",
    description: "Shows info about the currently song being played",
    aliases: ["song","sg"],
    run: async (client,message,args,prefix) => {
        try{
        if(!message.member.voice.channelId) return message.reply({content: `**👎 Connect to a Voice Channel first**`});

        const oldConnection= getVoiceConnection(message.guild.id);
        if(!oldConnection ) return message.reply({content: `**👎 I'm not connected at any Voice Channel!**`})
        if(oldConnection && oldConnection.joinConfig.channelId!=message.member.voice.channelId) return message.reply({content: `**👎 I'm  in a different Voice Channel!**`})

        let queue = client.queues.get(message.guild.id);
        if (!queue) return message.reply({content: `**👎 There isn't any song being played**`});

        if(!queue.tracks){
            return interaction.reply({ ephemeral: true, content: `👎 **There isn't any song being played**`}).catch(() => null); 
        };
        let song = queue.tracks[0];
        let currPos= oldConnection.state.subscription.player.state.resource.playbackDuration;

        let songMessage = new Discord.MessageEmbed()
                                    .setTitle(`Currently playing ${song.name}`)
                                    .setColor("FUCHSIA")
                                    .addField(":person_bald:  **Requester**",`>  ${song.requester}\n`)
                                    .addField(":timer:  **Uploaded-At**",`>  ${song.uploadedAt}**`)
                                    .addField(":timer:  **Duration**",`> ${client.createBar(song.duration,currPos)}\n> **${client.formatDuration(currPos)}/${song.durationFormatted}**`)
        if(song?.thumbnail?.url) songMessage.setImage(`${song?.thumbnail?.url}`);
        message.reply({embeds: [songMessage]});
        } catch (error){
            console.log(error);
            message.reply({content: `**❌ Couldn't show song info due to:  \`\`\` ${String(error?.message || error).substring(0,1900)} \`\`\` `}).catch(()=> null);
        }
    }
}