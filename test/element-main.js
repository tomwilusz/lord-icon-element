import { loadIcon } from './helpers.js';

const { expect } = chai;

const html = `
    <html>
        <head>
            <script type="module" src="/node_modules/lottie-web/build/player/lottie_svg.min.js"></script>
        </head>
        <body>
            <lord-icon src="/icons/lock.json"></lord-icon>
            <script type="module">
                import { defineElement } from '/dist/index.js';
                defineElement(lottie.loadAnimation);
                window.postMessage('defined');
            </script>
        </body>
    </html>
`;

export default function () {
    let iframe = null;
    let element = null;

    describe('main', () => {
        beforeEach(async () => {
            iframe = document.createElement('iframe');
            document.body.appendChild(iframe);

            iframe.contentWindow.document.open();
            iframe.contentWindow.document.write(html);
            iframe.contentWindow.document.close();

            // wait for iframe defined
            await new Promise((resolve, reject) => {
                iframe.contentWindow.addEventListener('message', (event) => {
                    if (event.data === 'defined') {
                        resolve();
                    }
                });
            });

            // get element
            element = iframe.contentWindow.document.querySelector('lord-icon');

            // wait for ready
            await new Promise((resolve, reject) => {
                element.addEventListener('ready', () => {
                    resolve();
                });
            });
        });

        afterEach(() => {
            iframe.parentElement.removeChild(iframe);
            iframe = null;
        });

        it('iconData', async () => {
            const iconData = await loadIcon('lock');
            expect(element.iconData).to.be.eql(iconData);
        });

        it('default instance', () => {
            expect(element.isReady).to.be.true;

            expect(element.player).not.be.undefined;
            expect(element.triggerInstance).to.be.undefined;

            expect(element.src).to.be.eql('/icons/lock.json');

            expect(element.target).to.be.null;
            expect(element.trigger).to.be.null;
            expect(element.state).to.be.null;
            expect(element.stroke).to.be.null;
            expect(element.colors).to.be.null;
            expect(element.icon).to.be.null;
        });

        it('attributes', () => {
            element.stroke = 3;
            expect(element.getAttribute('stroke')).to.be.eql('3');

            element.stroke = 'light';
            expect(element.getAttribute('stroke')).to.be.eql('light');

            element.target = 'div';
            expect(element.target).to.be.eql('div');
            expect(element.getAttribute('target')).to.be.eql('div');

            element.trigger = 'hover';
            expect(element.trigger).to.be.eql('hover');
            expect(element.getAttribute('trigger')).to.be.eql('hover');

            element.state = 'in-reveal';
            expect(element.state).to.be.eql('in-reveal');
            expect(element.getAttribute('state')).to.be.eql('in-reveal');

            element.icon = 'wow';
            expect(element.icon).to.be.eql('wow');
            expect(element.getAttribute('icon')).to.be.eql('wow');

            element.colors = 'primary:red';
            expect(element.colors).to.be.eql('primary:red');
            expect(element.getAttribute('colors')).to.be.eql('primary:red');
        });

        it('properties from attributes', () => {
            element.setAttribute('target', 'div');
            expect(element.target).to.be.eql('div');

            element.setAttribute('trigger', 'hover');
            expect(element.trigger).to.be.eql('hover');

            element.setAttribute('state', 'in-reveal');
            expect(element.state).to.be.eql('in-reveal');

            element.setAttribute('stroke', '2');
            expect(element.stroke).to.be.eql('2');

            element.setAttribute('colors', 'primary:red');
            expect(element.colors).to.be.eql('primary:red');

            element.setAttribute('icon', 'wow');
            expect(element.icon).to.be.eql('wow');
        });

        it('sync with player', () => {
            element.colors = 'primary:red';
            expect(element.player.colors.primary).to.be.eql('#ff0000');

            element.stroke = 'light';
            expect(element.player.stroke).to.be.eql(1);

            element.stroke = 'regular';
            expect(element.player.stroke).to.be.eql(2);

            element.stroke = 'bold';
            expect(element.player.stroke).to.be.eql(3);

            element.stroke = '1';
            expect(element.player.stroke).to.be.eql(1);

            element.stroke = '2';
            expect(element.player.stroke).to.be.eql(2);

            element.stroke = '3';
            expect(element.player.stroke).to.be.eql(3);
        });

        it('trigger', () => {
            expect(element.triggerInstance).to.be.undefined;
            element.trigger = 'hover';
            expect(element.triggerInstance).not.be.undefined;
            element.trigger = null;
            expect(element.triggerInstance).to.be.undefined;
        });

        it('change src', async () => {
            const lockIconData = await loadIcon('lock');
            const puzzleIconData = await loadIcon('puzzle');

            expect(element.iconData).to.be.eql(lockIconData);

            expect(element.isReady).to.be.true;
            expect(element.player).not.be.undefined;
            element.src = '/icons/puzzle.json';
            expect(element.isReady).to.be.false;
            expect(element.player).to.be.undefined;

            // wait for ready
            await new Promise((resolve, reject) => {
                element.addEventListener('ready', () => {
                    resolve();
                });
            });

            expect(element.isReady).to.be.true;
            expect(element.player).not.be.undefined;
            expect(element.iconData).to.be.eql(puzzleIconData);
        });

        it('connected', async () => {
            expect(element.player).not.be.undefined;

            const container = element.parentElement;

            // player destroyed after disconnected
            container.removeChild(element);
            expect(element.player).to.be.undefined;

            // player created again after connected
            container.appendChild(element);
            await new Promise((resolve, reject) => {
                element.addEventListener('ready', () => {
                    resolve();
                });
            });
            expect(element.player).not.be.undefined;
        });
    });
}