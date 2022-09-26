import { parseColor, parseColors } from './dist/utils/colors.js'

const { expect } = chai;

export default function () {
    describe('colors', () => {
        describe('parseColor', () => {
            it('color by name', function () {
                expect(parseColor('red')).to.be.eql('#ff0000');
                expect(parseColor('green')).to.be.eql('#008000');
                expect(parseColor('blue')).to.be.eql('#0000ff');
                expect(parseColor('darkorange')).to.be.eql('#ff8c00');
            });

            it('shorthand', function () {
                expect(parseColor('#fff')).to.be.eql('#ffffff');
                expect(parseColor('#000')).to.be.eql('#000000');
                expect(parseColor('#f00')).to.be.eql('#ff0000');
            });
        });

        describe('parseColors', () => {
            it('single', function () {
                expect(parseColors('primary:red')).to.be.eql({ primary: '#ff0000' });
            });

            it('multiple', function () {
                expect(parseColors('primary:red,secondary:#00ff00')).to.be.eql({ primary: '#ff0000', secondary: '#00ff00' });
            });
        });
    });
}