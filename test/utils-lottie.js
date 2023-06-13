import {
    hexToLottieColor, lottieColorToHex, rawProperties, resetProperties, updateProperties,
} from './dist/utils/lottie.js';

import {
    get,
} from './dist/utils/helpers.js';

const { expect } = chai;

async function loadIcon(name) {
    const response = await fetch(`/icons/${name}.json`);
    return await response.json();
}

const LOCK_PROPERTIES = [
    {"name":"stroke","path":"layers.0.ef.0.ef.0.v.k","value":2,"type":"feature"},
    {"name":"primary","path":"layers.0.ef.1.ef.0.v.k","value":[0.031372550875,0.658823549747,0.541176497936,1],"type":"color"},
    {"name":"secondary","path":"layers.0.ef.2.ef.0.v.k","value":[0.070588238537,0.074509806931,0.192156866193,1],"type":"color"},
];

export default function () {
    describe('lottie', () => {
        describe('hexToLottieColor', () => {
            it('basic', function () {
                expect(hexToLottieColor('#ff0000')).to.be.eql([1, 0, 0]);
                expect(hexToLottieColor('#00ff00')).to.be.eql([0, 1, 0]);
                expect(hexToLottieColor('#0000ff')).to.be.eql([0, 0, 1]);
                expect(hexToLottieColor('#ffffff')).to.be.eql([1, 1, 1]);
                expect(hexToLottieColor('#000000')).to.be.eql([0, 0, 0]);
            });
        });

        describe('lottieColorToHex', () => {
            it('basic', function () {
                expect(lottieColorToHex([1, 0, 0])).to.be.eql('#ff0000');
                expect(lottieColorToHex([0, 1, 0])).to.be.eql('#00ff00');
                expect(lottieColorToHex([0, 0, 1])).to.be.eql('#0000ff');
                expect(lottieColorToHex([1, 1, 1])).to.be.eql('#ffffff');
                expect(lottieColorToHex([0, 0, 0])).to.be.eql('#000000');
            });
        });

        describe('properties', () => {
            it('basic', async () => {
                const icon = await loadIcon('lock');

                expect(rawProperties(icon)).to.be.eql(LOCK_PROPERTIES);
            });
        });

        describe('updateProperties', () => {
            it('basic', async () => {
                const icon = await loadIcon('lock');
                const confettiProperties = rawProperties(icon);
                const strokeProperty = confettiProperties.filter(c => c.name === 'stroke');

                expect(get(icon, strokeProperty[0].path)).to.be.eql(2);
                updateProperties(icon, strokeProperty, 1);
                expect(get(icon, strokeProperty[0].path)).to.be.eql(1);
            });

            it('color', async () => {
                const icon = await loadIcon('lock');
                const confettiProperties = rawProperties(icon);
                const primaryProperty = confettiProperties.filter(c => c.name === 'primary');

                expect(lottieColorToHex(get(icon, primaryProperty[0].path))).to.be.eql('#08a88a');
                updateProperties(icon, primaryProperty, 'red');
                expect(lottieColorToHex(get(icon, primaryProperty[0].path))).to.be.eql('#ff0000');
            });
        });

        describe('resetProperties', () => {
            it('basic', async () => {
                const icon = await loadIcon('lock');
                const confettiProperties = rawProperties(icon);

                const primaryProperty = confettiProperties.filter(c => c.name === 'primary');
                const strokeProperty = confettiProperties.filter(c => c.name === 'stroke');

                expect(lottieColorToHex(get(icon, primaryProperty[0].path))).to.be.eql('#08a88a');
                
                updateProperties(icon, primaryProperty, 'red');
                updateProperties(icon, strokeProperty, 1);

                resetProperties(icon, primaryProperty);
                resetProperties(icon, strokeProperty);

                expect(lottieColorToHex(get(icon, primaryProperty[0].path))).to.be.eql('#08a88a');
                expect(get(icon, strokeProperty[0].path)).to.be.eql(2);
            });
        });
    });
}