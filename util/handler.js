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
            console.log(eventName);
            //para cada evento asociar cliente a evento? duda
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
            slashCommands.push(pull);
        })
    })

    client.on("ready", () => {
        if(client.deploySlash.enabled){
            if(client.deploySlash.guild){
                client.guilds.cache.get(client.deploySlash.guild).commands.set(slashCommands);
            }else {
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