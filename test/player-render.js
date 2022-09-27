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

            const iconData = await loadIcon('confetti');
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
            const imageB = await loadImage('confetti-0');

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
            const imageD = await loadImage('confetti-10');

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
            const imageB = await loadImage('confetti-20');

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
                scale: 40,
                stroke: 20,
            });
            const imageA = await getPNG(container);
            const imageB = await loadImage('confetti-30');

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

        it('basic', async () => {
            const imageA = await getPNG(container);
            const imageB = await loadImage('state-hover-0');

            const compareA = await new Promise((resolve, reject) => {
                resemble(imageA)
                    .compareTo(imageB)
                    .onComplete((data) => {
                        resolve(data);
                    });
            });
            expect(compareA.rawMisMatchPercentage).to.be.at.most(1);

            player.state = 'intro';
            const imageC = await getPNG(container);
            const imageD = await loadImage('state-intro-0');

            const compareB = await new Promise((resolve, reject) => {
                resemble(imageC)
                    .compareTo(imageD)
                    .onComplete((data) => {
                        resolve(data);
                    });
            });
            expect(compareB.rawMisMatchPercentage).to.be.at.most(1);

            player.state = 'loop';
            const imageE = await getPNG(container);
            const imageF = await loadImage('state-loop-0');

            const compareC = await new Promise((resolve, reject) => {
                resemble(imageE)
                    .compareTo(imageF)
                    .onComplete((data) => {
                        resolve(data);
                    });
            });
            expect(compareC.rawMisMatchPercentage).to.be.at.most(1);
        });

        it('frame', async () => {
            player.frame = 10;

            const imageA = await getPNG(container);
            const imageB = await loadImage('state-hover-10');

            const compareA = await new Promise((resolve, reject) => {
                resemble(imageA)
                    .compareTo(imageB)
                    .onComplete((data) => {
                        resolve(data);
                    });
            });
            expect(compareA.rawMisMatchPercentage).to.be.at.most(1);

            player.state = 'intro';
            const imageC = await getPNG(container);
            const imageD = await loadImage('state-intro-10');

            const compareB = await new Promise((resolve, reject) => {
                resemble(imageC)
                    .compareTo(imageD)
                    .onComplete((data) => {
                        resolve(data);
                    });
            });
            expect(compareB.rawMisMatchPercentage).to.be.at.most(1);

            player.state = 'loop';
            const imageE = await getPNG(container);
            const imageF = await loadImage('state-loop-10');

            const compareC = await new Promise((resolve, reject) => {
                resemble(imageE)
                    .compareTo(imageF)
                    .onComplete((data) => {
                        resolve(data);
                    });
            });
            expect(compareC.rawMisMatchPercentage).to.be.at.most(1);
        });
    });
}