const {Client, Intents, Collection, MessageEmbed } = require('discord.js');
const {getVoiceCOnnection} = require("@discordjs/voice")


const client = new Client(ClientSettingObject());

client.deploySlash = {
    enabled: true,
    guilds: ["965670982507438110"],
}

client.config = require("./config/config.json");

client.commands = new Collection();
client.slashCommands = new Collection();
client.queues = new Collection();

require('./util/handler.js')(client);
require('./util/musicUtils.js')(client);

client.login(client.config.BOT_TOKEN);



function ClientSettingObject(){
    return {
        intents: [
            Intents.FLAGS.GUILDS, 
            Intents.FLAGS.GUILD_MESSAGES, 
            Intents.FLAGS.GUILD_VOICE_STATES
        ],
        partials: ["MESSAGE","CHANNEL","REACTION"],
        //si hay un fallo al responder al mensaje no mostrar error
        failIfNotExists: false,
        //permitir menciones como @everyone
        allowedMentions: {
            parse: [ "roles", "users"],
            repliedUser:false,
        },
        //division de las funciones del bot en varios archivos
        shards: "auto"
    }
}