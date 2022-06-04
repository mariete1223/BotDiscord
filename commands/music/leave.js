const { getVoiceConnection, joinVoiceChannel } = require("@discordjs/voice");
const {Permissions} = require("discord.js");
module.exports = {
    name: "leave",
    description: "Leave a Voice Channel and stop playing",
    aliases: ["exit"],
    run: async (client,message,args,prefix) => {
        try{
        if(!message.member.voice.channelId) return message.reply({content: `**👎 Connect to a Voice Channel first**`});

        const oldConnection= getVoiceConnection(message.guild.id);
        if(!oldConnection ) return message.reply({content: `**👎 I'm not connected at any Voice Channel!**`})

        await client.leaveVoiceChannel(message.member.voice.channel);
        message.reply({content: `** :wave: Left your channel succesfully**`});
        } catch (error){
            console.log(error);
            message.reply({content: `**❌ Couldn't leave from your VC due to:  \`\`\` ${String(error?.message || error).substring(0,1900)} \`\`\` `}).catch(()=> null);
        }
    }
}