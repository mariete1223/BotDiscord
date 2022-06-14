const Discord = require("discord.js");
const { inplace } = require("stable");
module.exports = {
    name: "help",
    description: "Provide information about bot usage",
    aliases: ["h","hp"],
    run: async (client,message,args,prefix) => {
        let runesMessage = new Discord.MessageEmbed()
                                    .setTitle(`Command List`)
                                    .setColor("FUCHSIA")
                                    //con inline varios comandos en la misma linea
                                    .addFields(client.commands.map((e) => {
                                        return {
                                            name : `${prefix}${e.name}`,
                                            value : `> ${e.description}`,
                                            inline: true,
                                        }
                                    }));
        message.reply({embeds: [runesMessage]});
        return;
    }
}