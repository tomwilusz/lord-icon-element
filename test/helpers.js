export const SIZE = 512;

export async function loadIcon(name) {
    const response = await fetch(`/icons/${name}.json`);
    return await response.json();
}

export async function loadImage(name) {
    const response = await fetch(`/images/${name}.png`);
    return await response.blob();
}

export async function svgElementToImage(element) {
    const xml = new XMLSerializer().serializeToString(element);
    const img = new Image();

    return new Promise((resolve, reject) => {
        img.onload = () => {
            resolve(img);
        };
        img.src = "data:image/svg+xml;base64," + base64.encode(xml);
    });
}

export async function getPNG(container) {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("width", SIZE);
    canvas.setAttribute("height", SIZE);
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    const img = await svgElementToImage(container.children[0]);
    ctx.drawImage(img, 0, 0, SIZE, SIZE);

    return await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/png");
        document.body.removeChild(canvas);
    });
}
