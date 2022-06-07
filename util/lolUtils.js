
module.exports = async client => {   
    client.getUrlRunes =  (args) => { 

        let basicUrl = "https://www.lolvvv.com/es/champion/";
        if(args[0].indexOf("mundo") == -1){
            args[0] = args[0].toLowerCase();
        }else{
            args[0]= "DrMundo";
        }
        args = args.map((arg) => arg[0].toUpperCase()+arg.substr(1,));
        
        let champion= args[0];
        if(args.length > 1){
            champion = args.join("").trim();
        }  

        if(champion.indexOf("'") != -1){
            console.log(champion[champion.indexOf("'")+1].toUpperCase());
            champion = champion.substr(0,champion.indexOf("'")) + champion.substr(champion.indexOf("'")+1,);
        }
        console.log(champion);
        if(client.lol_champs.includes(champion)){
            return {url : basicUrl+= champion+ "/runas", champion: champion};
        } 
        return {url : -1, champion: champion};
        
    
    }


    

}