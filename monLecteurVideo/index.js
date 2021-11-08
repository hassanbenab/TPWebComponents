
import './lib/webaudio-controls.js';

const getBaseURL = () => {
    return new URL('.', import.meta.url);
};



let style = `
.tout{
    text-align: center; 
    
 }  
 #player {
    width: 50%;
    display: block;
    margin: 0 auto;
    


}

#volume{
    height: 20%;
}
.button{
    background-color: white;
    color: black;
    border: 2px solid #555555;
    border-radius: 8px;
    
}
.button:hover {
    background-color: #555555;
    color: white;
    box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
 


`;
let template = /*html*/`
<div class="tout"> 
 
  <video id="player" crossorigin="anonymous"> 
      <br>
  </video>
  <br>
  <button id="play" class="button" > PLAY </button>
  <button id="pause"class="button">PAUSE</button>
  <button id="getInfo"class="button">GET INFO</button>
  <button id="avancer10"class="button">+10s</button>
  <button id="vitesse4" class="button">Vitesse 4x</button>

  <webaudio-knob id="volume" min=0 max=1 value=0.5 step="0.01" 
  tooltip="%s" diameter="36" src="./assets/Vintage_Knob.png" sprites="100"></webaudio-knob>

  <webaudio-switch id="mute" midilearn="1"  src="./assets/switch_toggle.png" value="0" height="56" width="56" tooltip="switch to mute"></webaudio-switch>

  <div class="balance">
  <p id="infotxt"></p>
  <label for="pannerSlider">Balance</label>
  <input type="range" min="-1" max="1" step="0.1" value="0" id="pannerSlider" />
  </div>

  


  <div>
        <br>
        <label>60Hz</label>
        <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 0);"></input>
        <output id="gain0">0 dB</output>
        <br>
        <label>170Hz</label>
        <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 1);"></input>
        <output id="gain1">0 dB</output>
        <br>
        <label>350Hz</label>
        <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 2);"></input>
        <output id="gain2">0 dB</output>
        <br>
        <label>1000Hz</label>
        <input type="range" value="0" step="1" min="-30" max="30" oninput="changeGain(this.value, 3);"></input>
        <output id="gain3">0 dB</output>
    </div>


</div>
   `;

class MyVideoPlayer extends HTMLElement {
    constructor() {
        super();


        console.log("BaseURL = " + getBaseURL());

        this.attachShadow({ mode: "open" });
    }

    fixRelativeURLs() {
        // pour les knobs
        let knobs = this.shadowRoot.querySelectorAll('webaudio-knob, webaudio-switch, webaudio-slider');
        knobs.forEach((e) => {
            let path = e.getAttribute('src');
            e.src = getBaseURL() + '/' + path;
        });
    }
    connectedCallback() {
        // Appelée avant affichage du composant
        //this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.innerHTML = `<style>${style}</style>${template}`;

        this.fixRelativeURLs();

        this.player = this.shadowRoot.querySelector("#player");

        this.ctx = window.AudioContext || window.webkitAudioContext;
        // récupération de l'attribut HTML
        this.player.src = this.getAttribute("src");

        // déclarer les écouteurs sur les boutons
        this.definitEcouteurs();
        

    }

    definitEcouteurs() {
        console.log("ecouteurs définis")

        let i=0;
        this.shadowRoot.querySelector("#play").onclick = () => {
            
            this.play();
            this.context = new this.ctx();
            if (i==0) this.buildAudioGraphPanner();
        }
        this.shadowRoot.querySelector("#pause").onclick = () => {
            this.pause();
        }

        this.shadowRoot.querySelector("#volume").oninput = (event) => {
            const vol = parseFloat(event.target.value);
            this.player.volume = vol;
        }

        this.shadowRoot.querySelector("#pannerSlider").oninput = (event) => {
            this.pannerNode.pan.value = event.target.value;
        }

        this.shadowRoot.querySelector("#avancer10").onclick = () => {
            this.avancer10();
        }

        this.shadowRoot.querySelector("#vitesse4").onclick = () => {
            this.player.playbackRate*=4

            
        }

        this.shadowRoot.querySelector("#infotxt").oninput = (event) => {
            this.pannerNode.pan.value = event.target.value;
        }

        this.shadowRoot.querySelector("#getInfo").onclick = () => {
            this.getInfo();
        }
    }

    // API de mon composant
    play() {
        this.player.play();
    }

    pause() {
        this.player.pause();
    }

    avancer10(){
        this.player.currentTime += 10;
    }

    mute(){
        this.player.muted=true;
    }

    getInfo(){
        console.log("Durée de la vidéo : " + this.player.duration);
        console.log("Temps courant : " + this.player.currentTime);
    }




    buildAudioGraphPanner() {
        // create source and gain node
        this.source = this.context.createMediaElementSource(this.player);
        this.pannerNode = this.context.createStereoPanner();

        // connect nodes together
        this.source.connect(this.pannerNode);
        this.pannerNode.connect(this.context.destination);
    }

    changeGain(sliderVal,nbFilter) {
        this.value = parseFloat(sliderVal);
        this.filters[nbFilter - 1].gain.value = this.value;

         // update output labels
        this.output = this.shadowRoot.querySelector("#gain" + nbFilter);
            this.output.value = this.value + " dB";
        }
}

customElements.define("my-player", MyVideoPlayer);


