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

                window.addEventListener('message', (event) => {
                    if (event.data === 'define') {
                        defineElement(lottie.loadAnimation);
                        window.postMessage('defined');
                    }
                });        
            </script>
        </body>
    </html>
`;

export default function () {
    let iframe = null;

    describe('define', () => {
        before(async () => {
            iframe = document.createElement('iframe');
            document.body.appendChild(iframe);

            iframe.contentWindow.document.open();
            iframe.contentWindow.document.write(html);
            iframe.contentWindow.document.close();

            // wait for iframe load
            await new Promise((resolve, reject) => {
                iframe.onload = () => {
                    resolve();
                }
            });
        });

        after(() => {
            iframe.parentElement.removeChild(iframe);
            iframe = null;
        });

        it('not defined', () => {
            expect(iframe.contentWindow.document.querySelector('lord-icon').isReady).to.be.undefined;
            expect(iframe.contentWindow.document.querySelector('lord-icon').offsetWidth).to.be.eql(0);
        });

        it('define', async () => {
            // define element and wait for return message
            iframe.contentWindow.postMessage('define');
            await new Promise((resolve, reject) => {
                iframe.contentWindow.addEventListener('message', (event) => {
                    if (event.data === 'defined') {
                        resolve();
                    }
                });
            });

            // element not ready yet
            expect(iframe.contentWindow.document.querySelector('lord-icon').isReady).to.be.false;

            // wait for ready
            await new Promise((resolve, reject) => {
                iframe.contentWindow.document.querySelector('lord-icon').addEventListener('ready', () => {
                    resolve();
                });
            });

            expect(iframe.contentWindow.document.querySelector('lord-icon').isReady).to.be.true;
            expect(iframe.contentWindow.document.querySelector('lord-icon').offsetWidth).to.be.eql(32);
        });
    });
}