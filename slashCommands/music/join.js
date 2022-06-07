const { getVoiceConnection, joinVoiceChannel } = require("@discordjs/voice");
const {Permissions} = require("discord.js");
module.exports = {
    name: "join",
    description: "Join a Voice Channel",
    aliases: ["enter"],
    run: async (client,interaction,args,prefix) => {
        try{
        if(!interaction.member.voice.channelId) return interaction.reply({ephemeral: true, content: `**👎 Connect to a Voice Channel first**`});

        const oldConnection= getVoiceConnection(interaction.guild.id);
        if(oldConnection) return interaction.reply({ephemeral: true, content: `**👎 I'm already connected in <#${oldConnection.joinConfig.channelId}>!**`})

        if(!interaction.member.voice.channel?.permissionsFor(interaction.guild?.me).has(Permissions.FLAGS.CONNECT)){
            return interaction.reply({ephemeral: true,  content: `**👎 I haven't got permission to Connect to your Voice-Channel!**`});
        }

        if(!interaction.member.voice.channel?.permissionsFor(interaction.guild?.me).has(Permissions.FLAGS.SPEAK)){
            return interaction.reply({ ephemeral: true, content: `**👎 I haven't got permission to Speak in your Voice-Channel!**`});
        }

        await client.joinVoiceChannel(interaction.member.voice.channel);
        interaction.reply({ephemeral: false,content: `**:ballot_box_with_check: Connected succesfully to your channel**`});
        } catch (error){
            console.log(error);
            interaction.reply({ephemeral: true, content: `**❌ Couldn't connect to your VC due to: ** \`\`\` ${String(error?.interaction || error).substring(0,1900)} \`\`\` `}).catch(()=> null);
        }
    }
}