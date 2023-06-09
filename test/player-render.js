import { Player } from './dist/player.js'
import { SIZE, loadIcon, loadImage, getPNG } from './helpers.js';

const { expect } = chai;

export default function () {
    describe('render', () => {
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

        it('basic', async () => {
            const imageA = await getPNG(container);
            const imageB = await loadImage('lock-0');

            const compare = await new Promise((resolve, reject) => {
                resemble(imageA)
                    .compareTo(imageB)
                    .onComplete((data) => {
                        resolve(data);
                    });
            });
            expect(compare.rawMisMatchPercentage).to.be.at.most(1);
        });

        it('frame', async () => {
            player.frame = 10;
            const imageC = await getPNG(container);
            const imageD = await loadImage('lock-10');

            const compareB = await new Promise((resolve, reject) => {
                resemble(imageC)
                    .compareTo(imageD)
                    .onComplete((data) => {
                        resolve(data);
                    });
            });
            expect(compareB.rawMisMatchPercentage).to.be.at.most(1);
        });

        it('colors', async () => {
            player.frame = 20;
            player.colors = { primary: 'red', secondary: 'green' };
            const imageA = await getPNG(container);
            const imageB = await loadImage('lock-20');

            const compare = await new Promise((resolve, reject) => {
                resemble(imageA)
                    .compareTo(imageB)
                    .onComplete((data) => {
                        resolve(data);
                    });
            });
            expect(compare.rawMisMatchPercentage).to.be.at.most(1);
        });

        it('resetProperties', async () => {
            player.frame = 30;
            player.resetProperties({
                colors: {
                    primary: 'blue',
                    secondary: 'pink',
                },
                stroke: 3,
            });
            const imageA = await getPNG(container);
            const imageB = await loadImage('lock-30');

            const compare = await new Promise((resolve, reject) => {
                resemble(imageA)
                    .compareTo(imageB)
                    .onComplete((data) => {
                        resolve(data);
                    });
            });
            expect(compare.rawMisMatchPercentage).to.be.at.most(1);
        });
    });

    describe('render states', () => {
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

        it('basic', async () => {
            const imageA = await getPNG(container);
            const imageB = await loadImage('state-hover-locked-0');

            const compareA = await new Promise((resolve, reject) => {
                resemble(imageA)
                    .compareTo(imageB)
                    .onComplete((data) => {
                        resolve(data);
                    });
            });
            expect(compareA.rawMisMatchPercentage).to.be.at.most(1);

            player.state = 'in-reveal';
            const imageC = await getPNG(container);
            const imageD = await loadImage('state-in-reveal-0');

            const compareB = await new Promise((resolve, reject) => {
                resemble(imageC)
                    .compareTo(imageD)
                    .onComplete((data) => {
                        resolve(data);
                    });
            });
            expect(compareB.rawMisMatchPercentage).to.be.at.most(1);

            player.frame = 10;
            const imageE = await getPNG(container);
            const imageF = await loadImage('state-in-reveal-10');

            const compareC = await new Promise((resolve, reject) => {
                resemble(imageE)
                    .compareTo(imageF)
                    .onComplete((data) => {
                        resolve(data);
                    });
            });
            expect(compareC.rawMisMatchPercentage).to.be.at.most(1);

            player.state = 'hover-unlocked';
            const imageG = await getPNG(container);
            const imageH = await loadImage('state-hover-unlocked-0');

            const compareD = await new Promise((resolve, reject) => {
                resemble(imageG)
                    .compareTo(imageH)
                    .onComplete((data) => {
                        resolve(data);
                    });
            });
            expect(compareD.rawMisMatchPercentage).to.be.at.most(1);
        });

        it('frame', async () => {
            player.state = 'hover-unlocked';
            player.frame = 20;
            const imageA = await getPNG(container);
            const imageB = await loadImage('state-hover-unlocked-20');

            const compareA = await new Promise((resolve, reject) => {
                resemble(imageA)
                    .compareTo(imageB)
                    .onComplete((data) => {
                        resolve(data);
                    });
            });
            expect(compareA.rawMisMatchPercentage).to.be.at.most(1);
        });
    });
}