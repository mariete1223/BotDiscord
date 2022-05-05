
const { Permissions } = require("discord.js");
const {getVoiceConnection} = require("@discordjs/voice");
//modulos para dividir el programa, se devuelve cuando se hace require de otro programa
module.exports = async (client, oldState, newState) => {
    //Stage channel self supressing false
    //Si el id es el del bot, entramos en un canal y el tipo de canal es guild_stage, para conferencias y nos quieren suprimir
    if(newState.id === client.user.id && newState.channelId && newState.channel.type == "GUILD_STAGE_VOICE" && newState.suppress){
        //si tengo permisos me quito la supresion
        if(newState.channel?.permissionsFor(newState.guild.me)?.has(Permissions.FLAGS.MUTE_MEMBERS)){
            await newState.guild.me.voice.setSuppressed(false).catch(() => null);
        }
    }

    //si el cambio de estado es del bot ignoramos
    if(newState.id == client.user.id) return;

    function stateChange(one, two){
        if(one === true && two === false || one === false && two === true ) return true;
        else return false;
    }

    const o = oldState,  n = newState;

    //si los cambios no son de cambios de canales los ignoramos
    if(stateChange(o.streaming, n.streaming) ||
    stateChange(o.serverDeaf, n.serverDeaf) ||
    stateChange(o.serverMute, n.serverMute) ||
    stateChange(o.selfDeaf, n.selfDeaf) ||
    stateChange(o.selfMute, n.selfMute) ||
    stateChange(o.selfVideo, n.selfVideo) ||
    stateChange(o.suppress, n.suppress)  ) return;

    if(!o.channelId && n.channelId) {
        return;
    }
    
    //si alguien se sale de un canal o se cambia de canal 
    if(!n.channelId && o.channelId || n.channelId && o.channelId){
        //obtenemos la conexion de voz 
        const connection= getVoiceConnection(o.guild.id);
        const connection1= getVoiceConnection(n.guild.id);
        //si hay alguien mas a parte de nosotros no hacemos nada
        console.log(connection);
        if(o.channel.members.filter(m => !m.user.bot && !m.voice.selfDeaf && !m.voice.serverDeaf).size >=1) return;
        console.log("paso");
        if((connection || connection1)&& connection.joinCongfig.channelId == o.channelId) connection.destroy();
        return;

    }
}
