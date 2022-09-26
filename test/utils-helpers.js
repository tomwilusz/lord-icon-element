import { deepClone, isNil, isObjectLike, has, get, set } from './dist/utils/helpers.js'

const { expect } = chai;

export default function () {
    describe('helpers', () => {
        describe('deepClone', () => {
            it('basic', function () {
                expect(deepClone('abc')).to.be.eql('abc');
                expect(deepClone(123)).to.be.eql(123);
                expect(deepClone([1, 2, 3])).to.be.eql([1, 2, 3]);
                expect(deepClone(true)).to.be.eql(true);
                expect(deepClone(false)).to.be.eql(false);
                expect(deepClone({ a: 1, b: 2, c: 3 })).to.be.eql({ a: 1, b: 2, c: 3 });
            });

            it('deep', function () {
                expect(deepClone({ a: { b: { c: 123 } } })).to.be.eql({ a: { b: { c: 123 } } });
            });
        });

        describe('isNil', () => {
            it('null', function () {
                expect(isNil(null)).to.be.true;
            });

            it('undefined', function () {
                expect(isNil(undefined)).to.be.true;
            });

            it('zero', function () {
                expect(isNil(0)).to.be.false;
            });

            it('true', function () {
                expect(isNil(true)).to.be.false;
            });

            it('false', function () {
                expect(isNil(false)).to.be.false;
            });

            it('empty', function () {
                expect(isNil('')).to.be.false;
            });
        });

        describe('isObjectLike', () => {
            it('object', function () {
                expect(isObjectLike({})).to.be.true;
                expect(isObjectLike([])).to.be.true;
            });

            it('basic', function () {
                expect(isObjectLike(null)).to.be.false;
                expect(isObjectLike(undefined)).to.be.false;
                expect(isObjectLike(123)).to.be.false;
                expect(isObjectLike('abc')).to.be.false;
                expect(isObjectLike(() => { })).to.be.false;
            });
        });

        describe('has', () => {
            it('simple', function () {
                expect(has({ a: 123 }, 'a')).to.be.true;
                expect(has({ a: 123 }, 'b')).to.be.false;
            });

            it('deep', function () {
                expect(has({ a: { b: 123 } }, 'a.b')).to.be.true;
                expect(has({ a: { b: 123 } }, ['a', 'b'])).to.be.true;
                expect(has({ a: { b: 123 } }, 'a.c')).to.be.false;
            });

            it('array', function () {
                expect(has([1, 2], '0')).to.be.true;
                expect(has([1, 2], ['0'])).to.be.true;
                expect(has([1, 2], [0])).to.be.true;
                expect(has([1, 2], '1')).to.be.true;
                expect(has([1, 2], '2')).to.be.false;
                expect(has([1, 2], ['2'])).to.be.false;
                expect(has([1, 2], [2])).to.be.false;
            });

            it('deep array', function () {
                expect(has([1, { a: [{ b: 123 }] }], '1.a.0.b')).to.be.true;
                expect(has([1, { a: [{ b: 123 }] }], [1, 'a', 0, 'b'])).to.be.true;
            });
        });

        describe('get', () => {
            it('todo');
        });

        describe('set', () => {
            it('todo');
        });
    });
}