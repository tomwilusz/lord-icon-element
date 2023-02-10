import { loadIcon } from './helpers.js';

const { expect } = chai;

const html = `
    <html>
        <head>
            <script type="module" src="/node_modules/lottie-web/build/player/lottie_svg.min.js"></script>
        </head>
        <body>
            <lord-icon src="/icons/confetti.json"></lord-icon>
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
            const iconData = await loadIcon('confetti');
            expect(element.iconData).to.be.eql(iconData);
        });

        it('default instance', () => {
            expect(element.isReady).to.be.true;

            expect(element.player).not.be.undefined;
            expect(element.triggerInstance).to.be.undefined;

            expect(element.src).to.be.eql('/icons/confetti.json');

            expect(element.target).to.be.null;
            expect(element.trigger).to.be.null;
            expect(element.state).to.be.null;
            expect(element.stroke).to.be.null;
            expect(element.colors).to.be.null;
            expect(element.icon).to.be.null;
        });

        it('attributes', () => {
            element.stroke = 100;
            expect(element.stroke).to.be.eql(100);
            expect(element.getAttribute('stroke')).to.be.eql('100');

            element.target = 'div';
            expect(element.target).to.be.eql('div');
            expect(element.getAttribute('target')).to.be.eql('div');

            element.trigger = 'hover';
            expect(element.trigger).to.be.eql('hover');
            expect(element.getAttribute('trigger')).to.be.eql('hover');

            element.state = 'intro';
            expect(element.state).to.be.eql('intro');
            expect(element.getAttribute('state')).to.be.eql('intro');

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

            element.setAttribute('state', 'intro');
            expect(element.state).to.be.eql('intro');

            element.setAttribute('stroke', '85');
            expect(element.stroke).to.be.eql(85);

            element.setAttribute('colors', 'primary:red');
            expect(element.colors).to.be.eql('primary:red');

            element.setAttribute('icon', 'wow');
            expect(element.icon).to.be.eql('wow');
        });

        it('sync with player', () => {
            element.colors = 'primary:red';
            expect(element.player.colors.primary).to.be.eql('#ff0000');

            element.stroke = 80;
            expect(element.player.stroke).to.be.eql(80);
        });

        it('trigger', () => {
            expect(element.triggerInstance).to.be.undefined;
            element.trigger = 'hover';
            expect(element.triggerInstance).not.be.undefined;
            element.trigger = null;
            expect(element.triggerInstance).to.be.undefined;
        });

        it('change src', async () => {
            const confettiIconData = await loadIcon('confetti');
            const stateIconData = await loadIcon('state');

            expect(element.iconData).to.be.eql(confettiIconData);

            expect(element.isReady).to.be.true;
            expect(element.player).not.be.undefined;
            element.src = '/icons/state.json';
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
            expect(element.iconData).to.be.eql(stateIconData);
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