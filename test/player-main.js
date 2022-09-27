import { Player } from './dist/player.js'
import { SIZE, loadIcon } from './helpers.js';

const { expect } = chai;

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

            const iconData = await loadIcon('state');
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
            expect(player.states).to.be.eql(['intro', 'hover', 'loop']);
        });

        it('isPlaying', async () => {
            expect(player.isPlaying).to.be.false;
        });

        it('loop', async () => {
            expect(player.loop).to.be.false;
        });
    });
}