


let midiOutput = null;
let currentSequenceId = -1;

const START = 41;

let intervals = [0, 2, 5, 11, 12, 5, 7, 3];
sequence =  intervals.map(x => x + START);

const NOTE_ON = 0x90;     //144
const NOTE_OFF = 0x80;    //128
const CC = 0xB0;          //176

const NOTE_DURATION = 200;





const playNote = function() {
  if (currentSequenceId >= 0) {
    midiOutput.send([NOTE_OFF, sequence[currentSequenceId], 0x7f]); //0x7f = 127
  }

  currentSequenceId++;
  if (currentSequenceId >= sequence.length) {
    currentSequenceId = 0;
  }
  midiOutput.send([NOTE_ON, sequence[currentSequenceId], 0x7f]);

  setTimeout(playNote, NOTE_DURATION);
}



const sendMessage = function(){
  midiOutput.send([CC, 115, 0x7f]);

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

  midiOutput.send(dump); 

}


function sendSimpleCC(control, value) {
  var message = [CC, control, value];    
  midiOutput.send(message);
  
}




if (!('requestMIDIAccess' in navigator)) {
  alert('Unable to access MIDI devices. Make sure your devices are connected and try using the Chrome broswer.');
  // console.log('Could not access your MIDI devices.'); 

} else {

  navigator.requestMIDIAccess( { sysex: true } ).then( onMIDISuccess, onMIDIFailure );

  //navigator.requestMIDIAccess()
   //   .then(onMIDISuccess, onMIDIFailure);
}



// function onMIDISuccess(midiAccess) {
//     console.log(midiAccess);
//     var inputs = midiAccess.inputs;
//     var outputs = midiAccess.outputs;
// }

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}

access.onstatechange = function(e) {

   // Print information about the (dis)connected MIDI controller
   console.log(e.port.name, e.port.manufacturer, e.port.state);
 };
     
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

      //ignore clock messages

      if (message.data[0] != 248){
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
      }
    })
      


    if (plutoDetected < 1){
      //alert('Unable to find a MIDI connection to Pluto. Check your connections and hit refresh to try again.');
      outputText.push(`Unable to find a MIDI connection to Pluto.`);

      setTimeout(function (access) {
          checkForPluto(access); 
          console.log("checking again");
      }, 1000, access);

    } else {
      outputText.push(`✓ Pluto connected`);

      sendMessage();
    }

    document.querySelector("#inputs").innerText = inputText.join('');
    document.querySelector("#outputs").innerText = outputText.join('');  
    //playNote();
    
 
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}

function showVal(newVal, span){
    document.getElementById(span).innerHTML=newVal;
    console.log(newVal);
}

function updateSlider(control, value, label){
    document.getElementById(label).innerHTML=value;
    sendSimpleCC(control, value); 
    console.log(value);
}

const mySlider = document.getElementById('slider1');
