const Discord = require('discord.js');
const speech = require('@google-cloud/speech');
const Converter = require('pcm-bitdepth-converter').From32To16Bit;

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

let recognizeStream;

function start() {
  recognizeStream = clientSpeech
      .streamingRecognize(request)
      .on('error', console.error)
      .on('data', data => {
        if (data.results[0]) {
          console.log(
            `Transcription: ${data.results[0].alternatives[0].transcript}`
          );
        }
        
      });
}

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
            connection.on('speaking',(user, speaking) => {
              if (speaking) {
                receiver = connection.createReceiver();
                readableStream = receiver.createPCMStream(user);
                converter = new Converter();
                start();
                
                readableStream.pipe(converter).pipe(recognizeStream);
          
              } else {
                receiver.destroy();
                recognizeStream = null;
                converter.destroy();
                console.log('destoyed');

              }
              
            });
          })
          .catch(console.log);
      } else {
        message.reply('You need to join a voice channel first!');
      }
    }
  });