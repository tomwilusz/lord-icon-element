import { Player } from './dist/player.js'
import { SIZE, loadIcon } from './helpers.js';

const { expect } = chai;

const LOCK_STATES = [
    {"time":0,"duration":120,"name":"in-reveal","default":false},
    {"time":130,"duration":60,"name":"hover-locked","default":true},
    {"time":200,"duration":60,"name":"morph-unlocked","default":false},
    {"time":270,"duration":60,"name":"hover-unlocked","default":false},
];

const LOCK_PROPERTIES = {
    "colors":{"primary":"#08a88a","secondary":"#121331"},
    "stroke":2,
    "state":"hover-locked",
};

export default function () {
    describe('main', () => {
        let container = null;
        let player = null;

        beforeEach(async () => {
            const div = document.createElement('div');
            div.setAttribute('id', 'container');
            div.style.width = `${SIZE}px`;
            div.style.height = `${SIZE}px`;

            document.body.appendChild(div);

            container = document.getElementById('container');

            const iconData = await loadIcon('lock');
            player = new Player(lottie.loadAnimation, container, iconData);
            player.connect();

            await new Promise((resolve, reject) => {
                if (player.isReady) {
                    resolve();
                } else {
                    player.addEventListener('ready', () => {
                        resolve();
                    });
                }
            });
        });

        afterEach(() => {
            player.disconnect();
            container.parentElement.removeChild(container);
            container = null;
        });

        it('frame', async () => {
            expect(player.frame).to.be.eql(0);
        });

        it('duration', async () => {
            expect(player.duration).not.be.undefined;
        });

        it('lottie', async () => {
            expect(player.lottie).not.be.undefined;
        });

        it('frames', async () => {
            expect(player.frames).to.be.eql(60);
        });

        it('states', async () => {
            expect(player.states).to.be.eql(LOCK_STATES);
        });

        it('isPlaying', async () => {
            expect(player.isPlaying).to.be.false;
        });

        it('loop', async () => {
            expect(player.loop).to.be.false;
        });

        it('state frames', async () => {
            // default state
            expect(player.frames).to.be.eql(60);

            // other state
            player.state = 'in-reveal';
            expect(player.frames).to.be.eql(120);

            // another state
            player.state = 'hover-unlocked';
            expect(player.frames).to.be.eql(60);
        });

        it('reset frame with state change', async () => {
            player.frame = 10;
            expect(player.frame).to.be.eql(10);

            // change state
            player.state = 'in-reveal';
            
            expect(player.frame).to.be.eql(0);
        });

        it('frames without state', async () => {
            player.state = null;
            expect(player.frames).to.be.eql(60);

            player.state = '';
            expect(player.frames).to.be.eql(331);

            player.state = null;
            expect(player.frames).to.be.eql(60);
        });     
        
        it('properties', async () => {
            expect(player.properties).to.be.eql(LOCK_PROPERTIES);
        });
    });

    describe('main', () => {
        let container = null;
        let player = null;

        beforeEach(async () => {
            const div = document.createElement('div');
            div.setAttribute('id', 'container');
            div.style.width = `${SIZE}px`;
            div.style.height = `${SIZE}px`;

            document.body.appendChild(div);

            container = document.getElementById('container');

            const iconData = await loadIcon('trash-raw');
            player = new Player(lottie.loadAnimation, container, iconData);
            player.connect();

            await new Promise((resolve, reject) => {
                if (player.isReady) {
                    resolve();
                } else {
                    player.addEventListener('ready', () => {
                        resolve();
                    });
                }
            });
        });

        afterEach(() => {
            player.disconnect();
            container.parentElement.removeChild(container);
            container = null;
        });
        
        it('properties-alt', async () => {
            expect(player.properties).to.be.eql({});
        });
    });
}