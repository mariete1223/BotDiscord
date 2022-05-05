module.exports = async (client, interaction) => {
    //si se trata de un comando de interaccion slashcommands
    if(interaction.isCommand()){
        const cmd = client.slashCommands.get(interaction.commandName);
        //no responder si hay doble hosting es decir otros bots
        if(!cmd) return interaction.reply({content: `❌ This command is not executable anymore!`});

        const args = [];

        //recorremos los parametros para el command
        for(let option of interaction.options?.data){
            
            if(option.type === "SUB_COMMAND"){
                //si es subcomando guardamos el nombre
                if(option.name) args.push(option.name)
                //para cada parametro del subcomando guardamos el valor de sus parametros
                option.options?.forEach(o => {
                    if(o.value) args.push(o.value)
                })
                
            } 
            //si no es subcomando simplemente guardaremos su valor
            else if(option.value) args.push(option.value)
        }

        interaction.member = interaction.guild.members.cache.get(interaction.user.id) || await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        try{
            cmd.run(client,interaction,args, "/");
        } catch(error){
            console.log(error);
        }
    }
}