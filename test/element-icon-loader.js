
import { loadIcon } from './helpers.js';

const { expect } = chai;

const html = `
    <html>
        <head>
            <script type="module" src="/node_modules/lottie-web/build/player/lottie_svg.min.js"></script>
        </head>
        <body>
            <lord-icon icon="lock"></lord-icon>
            <script type="module">
                import { defineElement } from '/dist/index.js';
                import { Element } from '/dist/element.js';

                Element.setIconLoader(async (name) => {
                    const response = await fetch('/icons/' + name + '.json');
                    return await response.json();
                });

                defineElement(lottie.loadAnimation);
                window.postMessage('defined');
            </script >
        </body >
    </html >
`;

export default function () {
    let iframe = null;
    let element = null;

    describe('icon-loader', () => {
        before(async () => {
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

        after(() => {
            iframe.parentElement.removeChild(iframe);
            iframe = null;
        });

        it('ready', () => {
            expect(element.isReady).to.be.true;
        });

        it('iconData', async () => {
            const iconData = await loadIcon('lock');
            expect(element.iconData).to.be.eql(iconData);
        });

        it('change icon', async () => {
            const lockIconData = await loadIcon('lock');
            const puzzleIconData = await loadIcon('puzzle');

            expect(element.iconData).to.be.eql(lockIconData);

            expect(element.isReady).to.be.true;
            expect(element.player).not.be.undefined;
            element.icon = 'puzzle';
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
    });
}