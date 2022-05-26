const { getVoiceConnection, joinVoiceChannel } = require("@discordjs/voice");
const {Permissions} = require("discord.js");
module.exports = {
    name: "join",
    description: "Join a Voice Channel",
    aliases: ["enter"],
    run: async (client,message,args,prefix) => {
        try{
        if(!message.member.voice.channelId) return message.reply({content: `**👎 Connect to a Voice Channel first**`});

        const oldConnection= getVoiceConnection(message.guild.id);
        if(oldConnection) return message.reply({content: `**👎 I'm already connected in <#${oldConnection.joinConfig.channelId}>!**`})

        if(!message.member.voice.channel?.permissionsFor(message.guild?.me).has(Permissions.FLAGS.CONNECT)){
            return message.reply({ content: `**👎 I haven't got permission to Connect to your Voice-Channel!**`});
        }

        if(!message.member.voice.channel?.permissionsFor(message.guild?.me).has(Permissions.FLAGS.SPEAK)){
            return message.reply({ content: `**👎 I haven't got permission to Speak in your Voice-Channel!**`});
        }

        await client.joinVoiceChannel(message.member.voice.channel);
        message.reply({content: `**:ballot_box_with_check: Connected succesfully to your channel**`});
        } catch (error){
            console.log(error);
            message.reply({content: `**❌ Couldn't connect to your VC due to: ** \`\`\` ${String(error?.message || error).substring(0,1900)} \`\`\` `}).catch(()=> null);
        }
    }
}