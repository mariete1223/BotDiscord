const {readdirSync} = require("fs");
const { eventNames } = require("process");

module.exports = async client => {
    //accedes al directorio actual+commands
    readdirSync(`${process.cwd()}/commands/`)
    .forEach(directory => {
        const commands = readdirSync(`${process.cwd()}/commands/${directory}/`)
        //recorres los archivos
        .filter(file => file.endsWith(".js"))
        .forEach(file => {
            let pull = require(`${process.cwd()}/commands/${directory}/${file}`);
            //añades los .js a la coleccion de comandos existentes
            client.commands.set(pull.name, pull);
        })
    })
    //https://stackoverflow.com/questions/27654149/function-prototype-bind-with-null-as-argument
    readdirSync(`${process.cwd()}/events/`).filter(file => file.endsWith(".js"))
        .forEach(file => {
            let pull = require(`${process.cwd()}/events/${file}`);
            let eventName = file.split(".")[0];
            //console.log(eventName);
            //para cada evento asociar cliente a la funcion
            client.on(eventName, pull.bind(null,client));
        })

    const slashCommands = [];
    readdirSync(`${process.cwd()}/slashCommands/`)
    .forEach(directory => {
        const commands = readdirSync(`${process.cwd()}/slashCommands/${directory}/`)
        //recorres los archivos
        .filter(file => file.endsWith(".js"))
        .forEach(file => {
            let pull = require(`${process.cwd()}/slashCommands/${directory}/${file}`);
            //añades los .js a la coleccion de comandos existentes
            client.slashCommands.set(pull.name, pull);
            //los guardamos en una variable para usarlo despues
            slashCommands.push(pull);
        })
    })

    //cuando el bot este activo
    client.on("ready", () => {
        //comprobamos si estan permitidos los comandos /
        if(client.deploySlash.enabled){
            //comprobamos si estamos en algun server
            if(client.deploySlash.guild){
                //si lo estamos establecemos los comandos de ese server a los slash commands es instantaneo
                client.guilds.cache.get(client.deploySlash.guild).commands.set(slashCommands);
            }else {
                //sino establecemos los comandos globales de la aplicacion a slash command, puede tardar hasta 1 hora
                client.application.commands.set(slashCommands);
            }
        }
    })

    process.on("unhandledRejection", (reason,p) => {
        console.log("unhandledRejection",reason);
    })

    process.on("uncaughtException", (err,p) => {
        console.log("uncaughtException",err);
    })

    process.on("uncaughtExceptionMonitor", (err,p) => {
        console.log("uncaughtExceptionMonitor",err);
    })
    
}