const { getVoiceConnection, joinVoiceChannel } = require("@discordjs/voice");
const {Permissions} = require("discord.js");
const Discord = require("discord.js");
module.exports = {
    name: "queue",
    description: "Show the song current song queue",
    aliases: ["tail"],
    run: async (client,message,args,prefix) => {
        try{
        if(!message.member.voice.channelId) return message.reply({content: `**👎 Connect to a Voice Channel first**`});

        const oldConnection= getVoiceConnection(message.guild.id);
        if(!oldConnection ) return message.reply({content: `**👎 I'm not connected at any Voice Channel!**`})

        if(oldConnection && oldConnection.joinConfig.channelId!=message.member.voice.channelId) return message.reply({content: `**👎 I'm  in a different Voice Channel!**`})

        let queue = client.queues.get(message.guild.id);
        if (!queue) return message.reply({content: `**👎 There isn't any queue being played**`});

        if(!queue.tracks ){
            return interaction.reply({ ephemeral: true, content: `👎 **Nothing to skip**`}).catch(() => null); 
        };

        let queueString = "";
        queue.tracks.forEach( (song,index,array) => {
          
            if(index==0){
                queueString+= `\n> **${index+1}.**`  + ` ${song.title}\n` 
            }else {
                queueString+= `> **${index+1}.**` + ` ${song.title}\n` 
            }
            
        });
   

        let queueMessage = new Discord.MessageEmbed()
                                    .setTitle(`Current queue has ${queue.tracks.length} songs `)
                                    .setColor("FUCHSIA")
                                    .addField(":notes:   **Queue Songs:**",`>  ${queueString}\n`)
                             
                                    
        message.reply({embeds: [queueMessage]});

        } catch (error){
            console.log(error);
            message.reply({content: `**❌ Couldn't show the queue due to:  \`\`\` ${String(error?.message || error).substring(0,1900)} \`\`\` `}).catch(()=> null);
        }
    }
}