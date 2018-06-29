const Discord = require('discord.js');
const speech = require('@google-cloud/speech');

const clientSpeech = new speech.SpeechClient({
  projectId: 'recognize-97a48',
  keyFilename: './app/keyfile.json'
});

const request = {
  config: {
    encoding: 'LINEAR16',
    sampleRateHertz: 32000,
    languageCode: 'pt-BR'
  },
  interimResults: true, // If you want interim results, set this to true
  singleUtterance: true
};

let receiver = null;
/*const speech = Speech({
  projectId: 'recognize-97a48',
  keyFilename: 'keyfile.json'
});
*/



const client = new Discord.Client();

/*const recognizeStream = clientSpeech.streamingRecognize(request)
        .on('error', console.error)
        .on('start', console.log)
        .on('data', (data) => {
          console.log(data);
            const result = data.results[0] && data.results[0];

            if (!result || !result.alternatives || result.alternatives.length === 0) {
                //stop();
                return;
            }

            const alternative = result.alternatives[0];
            // console.log('data', data, alternative);
            console.log(`final=${result.isFinal}, transcription: ${alternative.transcript}`);
            //toggleCommands(alternative.transcript);
            //send(alternative.transcript, result.isFinal);
            //sendTranslated(alternative.transcript, result.isFinal);

            if (result.isFinal) {
               receiver.stop();
            }
        })
        .on('end', () => {
            console.log('speech ended');
            recognizeStream.end();
        });
*/
let google = null;
function start (dele) {
  // if(dele) {
  //   google = null;
  // }
  if (!google) {
    console.log('google inicializou');
    google = clientSpeech.streamingRecognize(request)
    .on('data', response => {
      console.log(JSON.stringify(response.results));
    })
    .on('error', console.error)
  } else {
    console.log('google já existe');
  }

}

//.on('end',() => {google.end();});


client.login('NDA2MjIyMjIzOTg5NTM4ODQ4.DYQx8w.Tep5j_5C99SWz6e1RDwY68IUrwU');

client.on('ready', () => console.log('ready'));

client.on('message', message => {
    // Voice only works in guilds, if the message does not come from a guild,
    // we ignore it
    //if (!message.guild) return;
    //console.log(message)
    if (message.content === '/join') {
      // Only try to join the sender's voice channel if they are in one themselves
      if (message.member.voiceChannel) {
        message.member.voiceChannel.join()
          .then(connection => { // Connection is an instance of VoiceConnection
            message.reply('I have successfully connected to the channel!');
           
            
            connection.on('speaking',(user, speaking) => {
              
              let control = false;
              if (!receiver) {
                receiver = connection.createReceiver();
                start();
              }
              let count = 0;
              if (speaking) { 
                try {
                  console.log('speaking');
                  if (receiver.destroyed) {
                    receiver.recreate();
                  }
                  if (count>1){
                    google.write(request);
                  }
                  
                  count++;
                  //receiver.createOpusStream(user)
                  receiver.createPCMStream(user)
                  .on('error', console.error)
                  .on('end', () => {
                    console.log('ended');
                    if(control) {
                      console.log('google terminou');
                      //google.end();
                      start(true);
                      control = false;
                    }
                    start();
                  })
                  .pipe(google, {end: false});
                  // .on('data', (chunk) =>{
                  //   //console.log(chunk);
                    
                  //   if (!google) {
                  //     console.log('google não existe');
                  //     start();
                  //   }
                  //   console.log('dados chegando');
                  //   //if (!control) {
                  //     console.log('dados chegando mesmo');
                  //     google.write(chunk);
                  //   //}
                  //   //control = true;
                  // });
                  // .on('start', (listener) => {
                  //   console.log('listening');
                  //   console.log(listener);
                  // })
                  //.pipe(recognizeStream)
                  //.on('end', recognizeStream.end());
                }
                catch (err) {
                  console.error(err);
                }
              } else {
                console.log('not speaking');
                
               // google.end();
                start(true);
                //receiver.end();
                //receiver.destroy();
              }
            });
            // const receiver = connection.createReceiver();
            // connection.on('speaking', (user, speaking) => {
            //   console.log(speaking);
              
            //   if (speaking) {
            //     console.log('listening');
            //     receiver.createPCMStream(user)
            //     .on('error',(error) => {
            //       console.error(error);
            //       receiver.destroy();
            //     })
            //     // .on('end', () => {
            //     //   console.log('ended');
            //     //   receiver.destroy();
            //     // })
            //     .pipe(recognizeStream, {end: false});

            //   } else {
            //      receiver.stoppedSpeaking(user);
            //   }
            // });

            // connection.on('speaking', listener => {
            //   console.log(JSON.stringify(listener));
            //   //console.log('user is ', listener.user);
            //   //console.log('is speaking?', listener.speaking);
            // })
          })
          .catch(console.log);
      } else {
        message.reply('You need to join a voice channel first!');
      }
    }
  });
//console.log(client);