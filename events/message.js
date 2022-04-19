const {MessageEmbed} = require("discord.js");

module.exports = async (client, message) =>{
    if(message.author.bot || !message.guild) return;
    const {prefix} = client.config;
}