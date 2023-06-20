import { defineElement } from '/dist/index.js';

defineElement(lottie.loadAnimation);

const fileElement = document.querySelector('input');
const iconElement = document.querySelector('lord-icon');

async function loadFile(file) {
    if (!file) {
        iconElement.icon = null;
        return;
    }

    const data = new Promise((resolve, reject) => {
        const fileReader = new FileReader();

        fileReader.onload = () => {
            const result = fileReader.result;
            if (!result) {
                reject(null);
                return;
            }

            try {
                resolve(JSON.parse('' + result));
            } catch (e) {
                reject(e);
            }
        }

        fileReader.onerror = () => {
            reject(null);
        }
     
        fileReader.readAsText(file);
    });

    iconElement.icon = data;
}

fileElement.addEventListener('change', e => {
    const file = fileElement.files[0];
    loadFile(file);
});