const { getVoiceConnection, joinVoiceChannel } = require("@discordjs/voice");
const {Permissions} = require("discord.js");
module.exports = {
    name: "leave",
    description: "Leave a Voice Channel and stop playing",
    aliases: ["exit"],
    run: async (client,interaction,args,prefix) => {
        try{
        if(!interaction.member.voice.channelId) return interaction.reply({ephemeral: true, content: `**👎 Connect to a Voice Channel first**`});

        const oldConnection= getVoiceConnection(interaction.guild.id);
        if(!oldConnection ) return interaction.reply({ ephemeral: true, content: `**👎 I'm not connected at any Voice Channel!**`})

        await client.leaveVoiceChannel(interaction.member.voice.channel);
        interaction.reply({ ephemeral: false, content: `** :wave: Left your channel succesfully**`});
        } catch (error){
            console.log(error);
            interaction.reply({ ephemeral: true, content: `**❌ Couldn't leave from your VC due to:  \`\`\` ${String(error?.interaction || error).substring(0,1900)} \`\`\` `}).catch(()=> null);
        }
    }
}