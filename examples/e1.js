import { Element } from '/dist/element.js';
import { defineElement } from '/dist/index.js';
import { modifiedIconData } from '/dist/utils/lottie.js';
import { set } from '/dist/utils/helpers.js';

// List of supported icons by our icon loader.
const ICONS = {
    hourglass: '/icons/87-hourglass-outline.json',
    question: '/icons/424-question-bubble-outline.json',
    book: '/icons/112-book-morph-lineal.json',
    book2: '/icons/book.json',
    xxx: '/icons/xxx.json',
    yyy: '/icons/yyy.json',
    zzz: '/icons/zzz.json',
    woman: '/icons/woman.json',
    man: '/icons/man.json',
    newhour: '/icons/newhour.json',
    fiu: '/icons/fiu.json',
    gru: '/icons/gru.json',
    gra: '/icons/gra.json',
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


    const data = modifiedIconData(element.iconData, element.player.properties, true);

    console.log('---export', data);

    var link = document.createElement('a');
    link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data)));
    link.setAttribute('download', 'new-file.json');

    link.style.display = 'none';
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

})