const Discord = require("discord.js");
const dcYtdl = require("discord-ytdl-core");
const {getVoiceConnection, joinVoiceChannel, VoiceConnectionStatus, createAudioPlayer, createAudioResource, NoSubscriberBehavior, entersState, PlayerSubscription} = require("@discordjs/voice");
//Package for making Youtube searchs
const {default: Youtube } = require("youtube-sr");
// const { PremiumTiers } = require("discord.js/typings/enums");

module.exports = client => {
    //functions to format numbers for timers
    const m2 = t =>  parseInt(t) < 10 ? `0${t}` : `${t}`;
    const m3 = t =>  parseInt(t) < 100 ? `0${m2(t)}` : `${t}`;

    //format a duration based on the miliseconds it last
    client.formatDuration = (ms) => {
        const secs = parseInt((ms/1000)%60);
        const mins = parseInt((ms/60000)%60);
        const hours = parseInt((ms/3600000)%24);
        
        if(hrs> 0) return `${hours}:${mins}:${secs}`;
        return `${mins}:${secs}`;
    }

    // create a Bar showing the current position on the video we are
    client.createBar = (duration, position) => {
        try {
        const full = "🔳";
        const empty = "⬜";
        const size = 20;
        const percent = duration == 0 ? null : Math.floor(duration/position*100);
        const fullBars = Math.floor(percent/100*size);
        const emptyBars = size-fullBars;
        
        return `**${full.repeat(fullBars)}${empty.repeat(emptyBars)}**`
        } catch (e) {
            console.error(e);
        }
    }

    //return the corresponding link to a video ID
    client.getYTLink = (ID) => {
        return `https://www.youtube.com/watch?v=${ID}`;
    }

    client.joinVoiceChannel = async (channel) => {
        return new Promise(async (res, rej) => {
            //checkeamos si tengo ya unaa conexion 
            const oldConnection = getVoiceConnection(channel.guild.id);
            if(oldConnection) return rej(`I'm already connected in : <#${oldConnection.channel.id}>`);
            //sino creo una nueva conexion
            const newConnection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator : channel.guild.voiceAdapterCreator
            });
            // await delay(250);
            //monitorizamos para ver si entramos en estado desconectado
            //https://discordjs.guide/voice/voice-connections.html#handling-disconnects
            newConnection.on(VoiceConnectionStatus.Disconnected, async(oldState, newState) => {
                try {
                    //promesa que nos devolvera si alguna de las condiciones ha sido cumplida
                    //viendo si ha sido movido el bot o reconectando a canal
                    await Promise.race([
                        entersState(newConnection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(newConnection, VoiceConnectionStatus.Connecting, 5_000),
                    ])
                } catch (error){
                    //ha sido desconectado y no se puede recuperar
                    newConnection.destroy();
                }
            })
            newConnection.on(VoiceConnectionStatus.Destroyed, ()=> {
                //borramos la conexion de nuestra cola 
                client.queues.delete(channel.guild.id);
            })

            return res("Connected to the Voice Channel");
        })
    }

    client.leaveVoiceChannel = async (channel) => {
        return new Promise( async (res,rej) => {
            try{
                const connection = getVoiceConnection(channel.guild.id);
                if(!connection) return rej("I am not at any VC!!");
                if(connection.joinConfig.channelId != channel.id){
                    return rej("You aren't in the same Voice Channel as me!!");
                }
                connection.destroy();
                //await delay(250);
                return res(true); 
            } catch (error) {
                console.log(error);
                return rej(error);
            }
            
        });
        
    }

    client.getResource = (queue, songInfoId, seekTime = 0) => {
        let Qargs = "";
        let effects = queue?.effects || {
            bassboost: 4,
            speed: 1
        };
        //filters from ffmpeg https://ffmpeg.org/ffmpeg-filters.html
        //normalize audio to equalize loud and quiet section 
        if(effects.normalizer) Qargs += `,dynaudnorm=f=200`;
        //set lower frequencies
        if(effects.bassboost) Qargs += `,bass=g=${effects.bassboost}`;
        //set speed
        if(effects.speed) Qargs += `,atempo=${effects.speed}`;
        if(effects["3d"]) Qargs += `,apulsator=hz=0.03`;
        if(effects.subboost) Qargs += `,asubboost`;
        if(effects.mcompand) Qargs += `,mcompand`;
        if(effects.haas) Qargs += `,haas`;
        if(effects.gate) Qargs += `,agate`;
        if(effects.karaoke) Qargs += `,stereotools=mlev=0.03`;
        if(effects.flanger) Qargs += `,flanger`;
        if(effects.pulsator) Qargs += `,apulsator=hz=1`;
        if(effects.surrounding) Qargs += `,surround`;
        if(effects.vaporwave) Qargs += `,aresample=48000,asetrate=48000*0.8`;
        if(effects.nightcore) Qargs += `,aresample=48000,asetrate=48000*1.5`;
        if(effects.phaser) Qargs += `,aphaser=in_gain=0.4`;
        if(effects.tremolo) Qargs += `,tremolo`;
        if(effects.vibrato) Qargs += `,vibrato=f=6.5`;
        if(effects.reverse) Qargs += `,areverse`;
        if(effects.treble) Qargs += `,treble=g=5`;
        if(Qargs.startsWith(",")) Qargs= Qargs.substring(1);
    const requestOpts = {
        filter: "audioonly",
        fmt: "mp3",
        //memory allowed for video download (maximum value)
        highWaterMark: 1 << 62,
        //How much time buffer to use for live videos in milliseconds
        liveBuffer: 1 <<62,
        //Disable downloading in Chunks 
        dlChunkSize: 0, 
        //
        seek: Math.floor(seekTime/1000),//in seconds
        bitrate: queue?.bitrate || 128,
        //check discord bitrate to select video quality downloaded
        quality: queue && queue.bitrate > 200 ? "highestaudio" : "lowestaudio",
        encoderArgs: Qargs ? ["-af",Qargs] : ["-af" , "bass=g=5"]
    }
    //we create an audio resource from the content returned by dcYdtl with inlineVolume
    //to be able to manage video's audio
    const resource = createAudioResource(dcYtdl(client.getYTLink(songInfoId),requestOpts),{inlineVolume: true});
    const volume = queue && queue.volume && queue.volume <= 150 && queue.volume >= 1 ? queue.volume/100 : 0.80;
    resource.volume.setVolume(volume);
    resource.playbackDuration = seekTime;
    return resource;
    }

    client.playSong = async (channel, songInfo) => {
        return new Promise((res,rej) => {
            //get connection
            const oldConnection = getVoiceConnection(channel.guild.id);
            
            if(oldConnection){
                //Can someone in other channel insert songs to our queue?
                if(oldConnection.joinConfig.channelId != channel.id) return rej("We aren't on the same channel");
                try {
                    //we get the queue for this server
                    const curQueue= client.queues.get(channel.guild.id);
                    //we create an AudioPlater which will stop if no VOice Channel availabel
                    const player = createAudioPlayer({
                        behaviors: {
                            noSubscriber: NoSubscriberBehavior.Stop,
                        },
                    });
                    //we suscribe the channel we are in to the AudioPlauer created
                    oldConnection.subscribe(player);
                    //we get the AudioResource of the song passed as argument
                    const resource= client.getResource(curQueue, songInfo.id);
                    //we play the song
                    player.play(resource);
                    //https://github.com/discordjs/voice/blob/a6dad47/src/audio/AudioPlayer.ts#L20
                    player.on("playing", player => {
                        //get our queue
                        const queue = client.queues.get(channel.guild.id);
                        //if filter changes we dont show message
                        if(queue && queue.filtersChanged) {
                            queue.filtersChanged = false;
                        } else {
                            //we text the new song being played
                            client.sendQueueUpdate(channel.guild.id);
                        }
                    });
                    
                    player.on("idle", () => {
                        const queue = client.queues.get(channel.guild.id);
                        console.log("QueueShift - Idle/Skip");
                        //hanlde queue cause no resource available
                        handleQueue(queue);
                    });
                    player.on("error", error => {
                        console.log(error);
                        const queue = client.queues.get(channel.guild.id);
                        console.log("QueueShift - Error");
                        //handle queue cause error occured
                        handleQueue(queue);
                    });

                    async function handleQueue(queue){
                       
                        if(queue && !queue.filtersChanged){
                            try{
                                //we delete the current resource being played
                                player.stop();
                                //if queue  has tracks 
                                if(queue && queue.tracks && queue.tracks.length > 1 ){
                                    //we set the first track to "previous"
                                    queue.previous= queue.tracks[0];

                                    //if queue is in trackloop an wasn't skipped we play the first track song
                                    if(queue.tracksloop && !queue.skipped){
                                        if(queue.paused) queue.paused= false;
                                        player.play(client.getResource(queue, queue.tracks[0].id));
                                    
                                    //if queue is in queueloop we set the first song as the last one and
                                    //play the first song
                                    }else if(queue.queueloop && !queue.skipped){
                                        const skipped = queue.tracks.shift();
                                        queue.tracks.push(skipped);
                                        if(queue.paused) queue.paused = false;
                                        player.play(client.getResource(queue, queue.tracks[0].id));
                                    } else {
                                        if(queue.paused) queue.paused = false;
                                        if(queue.skipped) queue.skipped = false;
                                        queue.tracks.shift();
                                        player.play(client.getResource(queue, queue.tracks[0].id));

                                    }
                                } else if (queue && queue.tracks && queue.tracks.length <= 1){
                                    queue.previous= queue.tracks[0];
                                    if((queue.queueloop || queue.tracksloop) && !queue.skipped){
                                        player.play(client.getResource(queue, queue.tracks[0].id));
                                    } else {
                                        if(queue.skipped) queue.skipped = false;
                                        queue.tracks=[];
                                    }
                                }
                            }catch (e) {
                                console.log(e);
                            }
                        }
                    }
                
                } catch (error) {
                    console.log(error);
                    return rej(error)
                }
            } else {
                return rej("I'm not connected to any Voice Channel");
            }
        })
    }

    client.sendQueueUpdate = async (guildId) => {
        const queue= client.queues.get(guildId);
        if( !queue || !queue.tracks || queue.tracks.length ==0 || !queue.textChannel) return;
        const textChannel = client.channels.cache.get(queue.textChannel) || await client.channel.fetch(queue.textChannel).cactch(() => null);
        if(!textChannel) return;
        const song = queue.tracks[0];
        const songEmbed = new  Discord.MessageEmbed().setColor("FUCHSIA")
                                                     .setTitle(`${song.title}`)
                                                     .setURL(`${client.getYTLink(song.id)}`)
                                                     .addField(`**Duration:**`, `> \`${song.durationFormatted}\``, true)
                                                     .addField(`**Requester:**`, ` > ${song.requester} \`${song.requester.tag}\``,true);
        if(song?.thumbnail?.url) songEmbed.setImage(`${song?.thumbnail?.url}`);

        await textChannel.send({
            embeds: [
                songEmbed
            ]
        }).catch(() => null);
        return true;
    }

    client.createSong = (song, requester) => {
        return {...song, requester};
    }

    client.queuePos = (length) => {
        const str = {
            1: "st",
            2: "nd",
            3: "rd"
        }
        return `${length}${str[length] ? str[length] : "th"}`;
    }

    client.createQueue = (song, user, channelId, bitrate = 128) => {
        return {
            textChannel: channelId,
            paused: false,
            skipped: false,
            effects: {
                bassboost: 6,
                subboost: false,
                mcompand: false,
                haas: false,
                gate: false,
                karaoke: false,
                flanger: false,
                pulsator: false,
                surrounding: false,
                "3d": false,
                vaporwave: false,
                nightcore: false,
                phaser: false,
                normalizer: false,
                speed: 1,
                tremolo: false,
                vibrato: false,
                reverse: false,
                treble: false,
            },
            trackloop: false,
            queueloop: false,
            filtersChanged: false,
            volume: 15, // queue volume, between 1 and 100
            tracks: [ client.createSong(song, user) ],
            previous: undefined,
            creator: user,
            bitrate: bitrate
        }
    }

    function delay (ms) {
        return new Promise((res) => setTimeout(() => res(2), ms));
    } 
}