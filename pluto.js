//MIDI CC IN
const SET_VOICE1_MIDI_IN  = 85;
const SET_VOICE1_MIDI_OUT = 86;
const SET_VOICE2_MIDI_IN  = 87;
const SET_VOICE2_MIDI_OUT = 88;
const SAVE_MIDI_SETTINGS  = 89;

var tempoutput;

let midiOutput = null;
let plutoOutput = null;
let currentSequenceId = -1;

var midiChannel = 1;
var plutoId;

const START = 41;

let intervals = [0, 2, 5, 11, 12, 5, 7, 3];
sequence =  intervals.map(x => x + START);

const NOTE_ON = 0x90;     //144
const NOTE_OFF = 0x80;    //128
const CC = 0xB0;          //176
const NOTE_DURATION = 200;

const NOTE_ON_DECIMAL = 144;     //144
const NOTE_OFF_DECIMAL = 128;    //128
const CC_DECIMAL = 176;          //176



let searchingMessages = [
  "Looking for Pluto", 
  "Looking for Pluto.",  
  "Looking for Pluto..",  
  "Looking for Pluto..." 
];

searchingMessageIndex = 0;

const playNote = function() {
  if (currentSequenceId >= 0) {
    plutoOutput.send([NOTE_OFF, sequence[currentSequenceId], 0x7f]); //0x7f = 127
  }

  currentSequenceId++;
  if (currentSequenceId >= sequence.length) {
    currentSequenceId = 0;
  }
  plutoOutput.send([NOTE_ON, sequence[currentSequenceId], 0x7f]);

  setTimeout(playNote, NOTE_DURATION);
}



const sendMessage = function(){
  plutoOutput.send([CC, 115, 0x7f]);

  dump = [0];
  testArray = [255, 4, 5, 6, 7, 3, 4, 5, 6, 7, 3, 4, 5, 6, 7, 3, 4, 5, 6, 99,
                3, 4, 5, 127, 7, 3, 4, 5, 6, 7, 3, 4, 5, 6, 7, 3, 4, 5, 6, 99,
                3, 4, 5, 6, 7, 3, 4, 5, 6, 7, 3, 4, 5, 6, 7, 3, 4, 5, 6, 17];

  for (i=testArray.length+1; i>0; i--){
    dump[i] = testArray[i-1];
     console.log(testArray[i-1]);
  }

  dump[0] = 0xF0;
  dump[testArray.length+1] = 0xF7;

  plutoOutput.send(dump); 

}


function sendSimpleCC(channel, control, value) {
  // var message = [CC, control, value];    
  var message = [CC_DECIMAL + channel - 1, control, value];
  plutoOutput.send(message);
}




if (!('requestMIDIAccess' in navigator)) {
  //alert('Unable to access MIDI devices. Make sure your devices are connected and try using the Chrome broswer.');
  // console.log('Could not access your MIDI devices.'); 

} else {

  navigator.requestMIDIAccess( { sysex: true } ).then( onMIDISuccess, onMIDIFailure );


}



// function onMIDISuccess(midiAccess) {
//     console.log(midiAccess);
//     var inputs = midiAccess.inputs;
//     var outputs = midiAccess.outputs;
// }

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}



function onMIDISuccess(access) {
   checkForPluto(access);
}

function checkForPluto(access) {
    let plutoDetected = 0;

    const outputValues = access.outputs.values();
      for(const output of outputValues) {
        console.log(output);
        midiOutput = output;
     }

    console.log('Success. Accessing MIDI devices.');

    // Get lists of available MIDI controllers
    const inputs = access.inputs;
    const outputs = access.outputs;
   
    const inputText = [];
    const outputText = [];
  
    inputs.forEach((midiInput) => { 
          
      //inputText.push(`FOUND: ${midiInput.name}`);

      if (midiInput.name == "Pluto" && midiInput.manufacturer == "Modern Sounds"){
        //inputText.push(`✓ Pluto MIDI input detected`);
        plutoDetected += 1;
      }

          
      midiInput.onmidimessage = function(message) {  

      if (message.currentTarget.id = plutoId){
        //console.log('receiving message from Pluto', message);
      }
      
      //ignore clock messages
      if (message.data[0] != 248){
        data = message.data; // this gives us our [command/channel, note, velocity] data.
        console.log('MIDI data', data); // MIDI data [144, 63, 73]

        if (data[0] == 0xF0){
          console.log("receiveSysex");
          receiveSysex(data);
        }

        // document.querySelector("#messages").innerText +=  `# ${midiInput.name}
        //     ${new Date()}
        //     ==================================
        //     - Status: ${message.data[0]}
        //     - Data 1: ${message.data[1]}
        //     - Data 2: ${message.data[2]}
        //     ==================================\n\n`;

        //document.querySelector("#messages").innerText +=  `MIDI CC: ${message.data[1]} Value: ${message.data[2]}\n`;
        }
      }
    })
  
    outputs.forEach((midiOutput) => { 
      //outputText.push(`FOUND: ${midiOutput.name}`);

      if (midiOutput.name == "Pluto" && midiOutput.manufacturer == "Modern Sounds"){
         //outputText.push(`✓ Pluto MIDI output detected`);
          plutoDetected += 1;
          plutoId = midiOutput.id;

          plutoOutput = midiOutput; //set this so we can target only Pluto when multiple devices are present
        

          console.log("Pluto port id:" + plutoId);
      }
    })
      


    if (plutoDetected < 1){
      //alert('Unable to find a MIDI connection to Pluto. Check your connections and hit refresh to try again.');


      searchingMessageIndex = (searchingMessageIndex + 1) % searchingMessages.length;

      var s = searchingMessages[searchingMessageIndex];
      outputText.push(s);

      setTimeout(function (access) {
          checkForPluto(access); 
          console.log("checking again");
      }, 300, access);

    } else {
      outputText.push(`Pluto connected!`);

      //sendMessage();
      
      doHandshake();
      //sendSimpleCC(1, 77, 77);
    }

    document.querySelector("#inputs").innerText = inputText.join('');
    document.querySelector("#outputs").innerText = outputText.join('');  
    //playNote();
    
 
}

var channelToTry = 0;
let checkInterval;

function doHandshake(){



  checkInterval = setInterval(checkMIDI, 40);

  function checkMIDI()
  {
   
   channelToTry++;

   if (channelToTry >= 16){
    clearInterval(checkInterval);
   } else {
    console.log(channelToTry);

    sendSimpleCC(channelToTry, 77, 77);
   }

  }



}


function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}



function receiveSysex(data){
  clearInterval(checkInterval);
  
  console.log(data);


  var version = data[1];

  for (i=2; i < 4; i++){
      version += '.' + data[i];
  }

  let in1 = data[4];
  let out1 = data[5];
  let out2 = data[6];

  midiChannel = in1;

  document.querySelector("#messages").innerText += "Firmware " + version;
  document.querySelector("#midiInput").innerText += "MIDI input channel " + in1;
  document.querySelector("#midiOutput").innerText += "MIDI output channels " + out1 + ", " + out2;

  document.getElementById("midiInDropdown").selectedIndex = 7; //Option 10
  document.getElementById("midiOutVoice1Dropdown").selectedIndex = 8; //Option 10
  document.getElementById("midiOutVoice2Dropdown").selectedIndex = 9; //Option 10

}



function showVal(newVal, span){
    document.getElementById(span).innerHTML=newVal;
    console.log(newVal);
}

function updateSlider(control, value, label){
    document.getElementById(label).innerHTML=value;
    sendSimpleCC(midiChannel, control, value); 
    console.log(value);
}

function GetSelectedItem(el)
{

    var e = document.getElementById(el);
    var value = e.options[e.selectedIndex].value;
    var strSel = "The Value is: " + value + " and text is: " + e.options[e.selectedIndex].text;

    console.log(strSel);
    sendSimpleCC(midiChannel, SET_VOICE1_MIDI_IN, value); 
}


function clickButton(control, value){

  var e = document.getElementById(value);
  var s = e.options[e.selectedIndex].text;
  console.log(s);

    sendSimpleCC(midiChannel, control, s); 
    console.log(value);
}


function saveMidiSettings(){
  sendSimpleCC(midiChannel, SAVE_MIDI_SETTINGS, 0); 
}

const mySlider = document.getElementById('slider1');
