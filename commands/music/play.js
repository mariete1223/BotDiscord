 const { getVoiceConnection, joinVoiceChannel } = require("@discordjs/voice");
 const {Permissions} = require("discord.js");
 const { default: YouTube } = require("youtube-sr");
 module.exports = {
     name: "play",
     description: "Plays Music in your Voice Channel",
     aliases: ["p"],
     run: async (client,message,args,prefix) => {
         try{
         if(!message.member.voice.channelId) return message.reply({content: `**👎 Connect to a Voice Channel first**`});
         const oldConnection= getVoiceConnection(message.guild.id);
         if(oldConnection && oldConnection.joinConfig.channelId!=message.member.voice.channelId) return message.reply({content: `**👎 I'm already in a Voice Channel!**`})
         if(!message.member.voice.channel?.permissionsFor(message.guild?.me).has(Permissions.FLAGS.CONNECT)){
             return message.reply({ content: `**👎 I haven't got permission to Connect to your Voice-Channel!**`});
         }
         if(!message.member.voice.channel?.permissionsFor(message.guild?.me).has(Permissions.FLAGS.SPEAK)){
             return message.reply({ content: `**👎 I haven't got permission to Speak in your Voice-Channel!**`});
         }
         const track = args.join(" ");
         if(!args[0]) return message.reply(`👎 ** Please add the wished Music via \`${prefix}play <Name/link>\``).catch(() => null);
         const youtubeRegex = /^(https?:\/\/)?(www\.)?(m\.|music\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
         const playlistRegex = /^.*(list=)([^#\&\?]*).*/gi;
         const songRegex = /^.*(watch\?v=)([^#\&\?]*).*/gi;
         // variables for song, and playlist
         let song = null;
         let playlist = null;
         // Use the regex expressions
         const isYT = youtubeRegex.exec(track);
         const isSong = songRegex.exec(track);
         const isList = playlistRegex.exec(track);
         //if we aren't connected to a voice channel we connect to the VC he is at
         if(!oldConnection){
             try {
                 await client.joinVoiceChannel(message.member.voice.channel);
             }catch (error){
                 console.log(error);
                 message.reply({content: `**❌ Couldn't leave from your VC due to:  \`\`\` ${String(error?.message || error).substring(0,1900)} \`\`\` `}).catch(()=> null);
             }
         }
             const m = await message.reply({content: `:mag: *Searching **${track}** ...*`}).catch(() => null);
             let queue = client.queues.get(message.guild.id);
            //if there is queue but not an old connection we delete it
             if(!oldConnection && queue){
                 client.queues.delete(message.guild.id);
                 queue= undefined;
             }
             //we act in response to the matched regex 
             if(!isList && isSong && isYT){
                 song= await YouTube.getVideo(track);
             }else if (isList && !isSong && isYT){
                 playlist = await YouTube.getPlaylist(track).then(playlist => playlist.fetch());
             }
             else if (isYT && isSong && isList){
                 song= await YouTube.getVideo(track);
                 playlist = await YouTube.getPlaylist(track).then(playlist => playlist.fetch());
             } else {
                 // devuelve primer resultado
                 song = await YouTube.searchOne(track);
             }
             //if nothing was found return error message
             if(!song && !playlist) return m.edit({content: `❌ **Failed looking for ${track}!**`}).catch(() => null);
             // if it iss a song
             if(!playlist){
                 //if there wasn't songs or queue
                 if(!queue || queue.tracks.length ==0){
                     //we get the channel bitrate
                     const bitrate = Math.floor(message.member.voice.channel.bitrate /1000);//MB
                     //we create a Queue with these values
                     const newQueue = client.createQueue(song, message.author, message.channelId, bitrate);
                     //we add the queue to the collection (map)
                     client.queues.set(message.guild.id, newQueue);
                     //we call the client function to play the song 
                     await client.playSong(message.member.voice.channel, song);
                     return m.edit({content: `:play_pause:  **Now Playing: _${song.title}_** - \'${song.durationFormatted}\``}).catch(() => null);
                 }
                 //we push the song into the end of the queue track
                 queue.tracks.push(client.createSong(song, message.author));
                 return m.edit({content: `:thumbsup: **Queued at \`${client.queuePos(queue.tracks.length-1)}\` - \` _${song.title}_** - \`${song.durationFormatted}\``}).catch(()=> null);              
             } else {
                //if it was a playlist or playlist and song 
                //we check if there is a song, if not we select the first video of the playlist
                song = song ? song : playlist.videos[0];
                
                const index = playlist.videos.findIndex((v) => v.id==song.id ) || 0;
                //we delete thee video which is equal to "song" if there is one
                playlist.videos.splice(index,1);
                
                if(!queue || queue.tracks.length ==0){
                     
                     const bitrate = Math.floor(message.member.voice.channel.bitrate /1000);//MB
                     const newQueue = client.createQueue(song, message.author, message.channelId, bitrate);
                     //we add the videos to the track
                     playlist.videos.forEach(song => newQueue.tracks.push(client.createSong(song,message.author)));
                     client.queues.set(message.guild.id, newQueue);
                     await client.playSong(message.member.voice.channel, song);
                     return m.edit({content: `:play_pause:  **Now Playing: _${song.title}_** - \'${song.durationFormatted}\` **Added \`${playlist.videos.length -1} Songs\` from the PLaylist:**\n> _**${playlist.title}**_`}).catch(() => null);
                 }
                 //if queue existed we just add songs to the track
                 playlist.videos.forEach(song => queue.tracks.push(client.createSong(song,message.author)));
                 return m.edit({content: `:thumbsup: **Queued at \`${client.queuePos(queue.tracks.length-1) - (playlist.videos.atlength -1)}\` - \` _${song.title}_** - \`${song.durationFormatted}\``}).catch(()=> null);
             }
         }catch (e){
             message.reply({content: `**❌ Couldn't play that in your VC due to:  \`\`\` ${String(e?.message || e).substring(0,1900)} \`\`\` `}).catch(()=> null);
         }

     }
 }