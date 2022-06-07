const Discord = require("discord.js");
module.exports = {
    name: "runes",
    description: "Shows the bot´s ping",
    aliases: ["latency"],
    run: async (client,message,args,prefix) => {

        
        let {url, champion} = client.getUrlRunes(args);
        console.log(url);
        if(url != -1 ){
            let runesMessage = new Discord.MessageEmbed()
                                    .setTitle(`Runes of ${args.join(" ")} `)
                                    .setColor("FUCHSIA")
                                    .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion}_0.jpg`)
                                    .setURL(url)
                                    .addField("\u200B",url)
                                    .addField("\u200B","\u200B")
                                    .setFooter({text: 'LOLvvv', iconURL: 'https://styles.redditmedia.com/t5_iitf0/styles/communityIcon_cv3xoqopakp51.png?width=256&s=174554c65fe02c4c596a547b0f4f193e5cbb7162'})
            message.reply({embeds: [runesMessage]});
        }
        else{
            message.reply({content: `**❌ Couldn't find the Champio u are looking for, maybe you missplelled it, pay attention to capital letters!!**`}).catch(()=> null);
        }
        
        return;
    }
}
//https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg
//https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg
//https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Kaisa_0.jpg
//https://ddragon.leagueoflegends.com/cdn/img/champion/splash/DrMundo_0.jpg