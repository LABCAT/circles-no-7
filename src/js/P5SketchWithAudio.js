import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';

import audio from "../audio/circles-no-7.ogg";
import midi from "../audio/circles-no-7.mid";

/**
 * Circles No. 7
 */
const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    const noteSet1 = result.tracks[2].notes; // Synth 1 - Init Patch
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        } 

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.background(0);
            p.colorMode(p.HSB);
            p.strokeWeight(4);
            p.noLoop();
        }


        p.draw = () => {
            p.translate(p.width/2, p.height/2);
            if(p.audioLoaded && p.song.isPlaying()){

            }
        }

        p.circleSets = [];

        p.executeCueSet1 = (note) => {
            const { duration } = note;
            const circleSize = p.random(50, 100);
            let stepsIncrementer = Math.ceil(p.TWO_PI / Math.acos(0.5 * (1 - circleSize / (2 * circleSize))))
            let x = 0;
            let y = 0;
            let numOfSteps = stepsIncrementer;
            let numOfRings = p.width / 2 >= p.height / 2 ? 
                Math.ceil((p.width / 2) / circleSize) :
                Math.ceil((p.height / 2) / circleSize);

            p.circleSets = [];
            p.circleSets[0] = [
                {
                    rotation: 0,
                    x: 0, 
                    y: 0, 
                    size: circleSize,
                }
            ];

            x = x + circleSize;
            y = x;

            for (let i = 1; i < numOfRings; i++) {
                const array = [];
                for (let j = 0; j < numOfSteps; j++){
                    array.push(
                        {
                            rotation: p.TWO_PI/numOfSteps,
                            x: x, 
                            y: y, 
                            size: circleSize,
                        }
                    );
                }
                p.circleSets[i] = p.shuffle(array);
                x = x + circleSize;
                y = x;
                numOfSteps = numOfSteps + stepsIncrementer;
            }

            const delay = (duration * 1000 / 8);
            p.drawCircleSpiral(delay);
        }

        p.drawCircleSpiral = (delay) => {
            if(Math.random() > 0.5) {
                p.circleSets.reverse();
            }

            const hue = p.random(0, 360);
            p.background(hue, 75, 50);
            for (let i = 0; i < p.circleSets.length; i++) {
                const circlesArray = p.circleSets[i];
                setTimeout(
                    function () {
                        for (let j = 0; j < circlesArray.length; j++) {
                            const { rotation, x, y, size } = circlesArray[j];
                            p.fill(hue, p.random(50, 100), p.random(75, 100));
                            p.stroke(hue, p.random(50, 100), p.random(75, 100));
                            p.rotate(rotation);
                            p.circle(x, y, size, size);
                        }
                    },
                    (delay * i)
                );
            }
        }

        p.hasStarted = false;

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                        if (typeof window.dataLayer !== typeof undefined){
                            window.dataLayer.push(
                                { 
                                    'event': 'play-animation',
                                    'animation': {
                                        'title': document.title,
                                        'location': window.location.href,
                                        'action': 'replaying'
                                    }
                                }
                            );
                        }
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                    if (typeof window.dataLayer !== typeof undefined && !p.hasStarted){
                        window.dataLayer.push(
                            { 
                                'event': 'play-animation',
                                'animation': {
                                    'title': document.title,
                                    'location': window.location.href,
                                    'action': 'start playing'
                                }
                            }
                        );
                        p.hasStarted = false
                    }
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;
