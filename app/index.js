const Discord = require('discord.js');
const speech = require('@google-cloud/speech');
const sox = require('sox-stream');

const fs = require('fs');

const client = new Discord.Client();

let receiver;
let readableStream;

const clientSpeech = new speech.SpeechClient({
  projectId: 'recognize-97a48',
  keyFilename: './app/keyfile.json'
});

const request = {
  config: {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'pt-BR'
  },
  interimResults: true, // If you want interim results, set this to true
  singleUtterance: true
};

const transcode = sox({
  global: {
    temp: './temp',
    'single-threaded': true
  },
  input:{
    type: 'wav'
  },
  output:{
    bits: 16,
    rate: 16000,
    channels: 1,
    type: 'wav'
  },
  temp:'./temp/'
});

transcode.on('error', (err) => console.log(err));

let recognizeStream;

function start() {
  recognizeStream = clientSpeech
      .streamingRecognize(request)
      .on('error', console.error)

      .on('data', data => {
        console.log(data);
        if (data.results[0]) {
          console.log(
            `Transcription: ${data.results[0].alternatives[0].transcript}`
          );
        }
        
      });
}

const dest = fs.createWriteStream('song.wav');

let converter;

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
            receiver = connection.createReceiver();
            readableStream = receiver.createPCMStream(client.users.find('username', 'flisbao'));
            start();
            readableStream.on('error', (error) => console.log(error));
            readableStream.pipe(transcode).pipe(dest);
          })
          .catch(console.log);
      } else {
        message.reply('You need to join a voice channel first!');
      }
    }
  });


  /***
   *             connection.on('speaking',(user, speaking) => {
              if (speaking) {
                receiver = connection.createReceiver();
                readableStream = receiver.createPCMStream(user);
                //converter = new Converter();
                start();
                console.log(readableStream);
                //readableStream.pipe(recognizeStream);
                readableStream.on('data', ()=> {
                  
                });
          
              } else {
                //receiver.end();
                //recognizeStream.end();
                //converter.destroy();
                console.log('destoyed');

              }
              
            });

   */