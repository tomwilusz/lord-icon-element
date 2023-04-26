import { Element } from '/dist/element.js';
import { defineElement } from '/dist/index.js';
import { modifiedIconData } from '/dist/utils/lottie.js';
import { set } from '/dist/utils/helpers.js';

// List of supported icons by our icon loader.
const ICONS = {
    t1hourglass: '/icons/t1hourglass.json',
    t2location: '/icons/t2location.json',
    t3: '/icons/t3.json',
    t4: '/icons/t4.json',
}

// Custom icon loader which can provide icon data from any place you want.
// In this example our loader fetch icon data from provided url.
Element.setIconLoader(async (iconName) => {
    console.log('---i', iconName);
    const response = await fetch(ICONS[iconName]);
    return await response.json();
});

// Register element.
defineElement(lottie.loadAnimation);

const element = document.querySelector('lord-icon');

document.querySelector('a').addEventListener('click', e => {
    e.preventDefault();

    const data = modifiedIconData(
        element.iconData,
        element.player.properties,
        {
            layer: false,
            optimize: true,
        },
    );

    console.log('---export', data);

    var link = document.createElement('a');
    link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)));
    link.setAttribute('download', 'new-file.json');

    link.style.display = 'none';
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

})