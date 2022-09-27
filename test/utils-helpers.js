import { deepClone, isNil, isObjectLike, has, get, set } from './dist/utils/helpers.js'

const { expect } = chai;

export default function () {
    describe('helpers', () => {
        describe('deepClone', () => {
            it('basic', () => {
                expect(deepClone('abc')).to.be.eql('abc');
                expect(deepClone(123)).to.be.eql(123);
                expect(deepClone([1, 2, 3])).to.be.eql([1, 2, 3]);
                expect(deepClone(true)).to.be.eql(true);
                expect(deepClone(false)).to.be.eql(false);
                expect(deepClone({ a: 1, b: 2, c: 3 })).to.be.eql({ a: 1, b: 2, c: 3 });
            });

            it('deep', () => {
                expect(deepClone({ a: { b: { c: 123 } } })).to.be.eql({ a: { b: { c: 123 } } });
            });
        });

        describe('isNil', () => {
            it('null', () => {
                expect(isNil(null)).to.be.true;
            });

            it('undefined', () => {
                expect(isNil(undefined)).to.be.true;
            });

            it('zero', () => {
                expect(isNil(0)).to.be.false;
            });

            it('true', () => {
                expect(isNil(true)).to.be.false;
            });

            it('false', () => {
                expect(isNil(false)).to.be.false;
            });

            it('empty', () => {
                expect(isNil('')).to.be.false;
            });
        });

        describe('isObjectLike', () => {
            it('object', () => {
                expect(isObjectLike({})).to.be.true;
                expect(isObjectLike([])).to.be.true;
            });

            it('basic', () => {
                expect(isObjectLike(null)).to.be.false;
                expect(isObjectLike(undefined)).to.be.false;
                expect(isObjectLike(123)).to.be.false;
                expect(isObjectLike('abc')).to.be.false;
                expect(isObjectLike(() => { })).to.be.false;
            });
        });

        describe('has', () => {
            it('simple', () => {
                expect(has({ a: 123 }, 'a')).to.be.true;
                expect(has({ a: 123 }, 'b')).to.be.false;
            });

            it('deep', () => {
                expect(has({ a: { b: 123 } }, 'a.b')).to.be.true;
                expect(has({ a: { b: 123 } }, ['a', 'b'])).to.be.true;
                expect(has({ a: { b: 123 } }, 'a.c')).to.be.false;
            });

            it('array', () => {
                expect(has([1, 2], '0')).to.be.true;
                expect(has([1, 2], ['0'])).to.be.true;
                expect(has([1, 2], [0])).to.be.true;
                expect(has([1, 2], '1')).to.be.true;
                expect(has([1, 2], '2')).to.be.false;
                expect(has([1, 2], ['2'])).to.be.false;
                expect(has([1, 2], [2])).to.be.false;
            });

            it('deep array', () => {
                expect(has([1, { a: [{ b: 123 }] }], '1.a.0.b')).to.be.true;
                expect(has([1, { a: [{ b: 123 }] }], [1, 'a', 0, 'b'])).to.be.true;
            });
        });

        describe('get', () => {
            it('simple', () => {
                expect(get({ a: 123 }, 'a')).to.be.eql(123);
                expect(get({ a: 123 }, 'b')).to.be.undefined;
                expect(get({ a: 123 }, 'b', 123)).to.be.eql(123);
            });

            it('deep', () => {
                expect(get({ a: { b: 123 } }, 'a.b')).to.be.eql(123);
                expect(get({ a: { b: 123 } }, ['a', 'b'])).to.be.eql(123);
                expect(get({ a: { b: 123 } }, 'a.c')).to.be.undefined;
                expect(get({ a: { b: 123 } }, 'a.c', 123)).to.be.eql(123);
            });

            it('array', () => {
                expect(get([1, 2], '0')).to.be.eql(1);
                expect(get([1, 2], ['0'])).to.be.eql(1);
                expect(get([1, 2], [0])).to.be.eql(1);
                expect(get([1, 2], '1')).to.be.eql(2);
                expect(get([1, 2], '2')).to.be.undefined;
                expect(get([1, 2], ['2'])).to.be.undefined;
                expect(get([1, 2], [2])).to.be.undefined;
                expect(get([1, 2], '2', 3)).to.be.eql(3);
            });

            it('deep array', () => {
                expect(get([1, { a: [{ b: 123 }] }], '1.a.0.b')).to.be.eql(123);
                expect(get([1, { a: [{ b: 123 }] }], [1, 'a', 0, 'b'])).to.be.eql(123);
                expect(get([1, { a: [{ b: 123 }] }], [1, 'a', 0, 'c'], 456)).to.be.eql(456);
            });
        });

        describe('set', () => {
            it('simple', () => {
                const value = { a: 123 };
                set(value, 'a', 456);
                expect(value.a).to.be.eql(456);
            });

            it('deep', () => {
                const value = { a: 0, b: [0, { c: 0 }] };
                set(value, 'b.1.c', 456);
                expect(value.b[1].c).to.be.eql(456);

                const value2 = { a: 0, b: [0, { c: 0 }] };
                set(value2, ['b', 1, 'c'], 456);
                expect(value2.b[1].c).to.be.eql(456);
            });
        });
    });
}