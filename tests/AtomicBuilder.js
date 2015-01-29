/*globals describe,it,afterEach */
'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var expect = chai.expect;
chai.use(sinonChai);

var AtomicBuilder = require('../src/lib/AtomicBuilder');
var atomicBuilder;

describe('AtomicBuilder', function () {
    afterEach(function () {
        // restore original methods
        var methodName, method;
        for(methodName in AtomicBuilder.prototype) {
            if (AtomicBuilder.prototype.hasOwnProperty(methodName)) {
                method = AtomicBuilder.prototype[methodName];
                if (method.restore) {
                    method.restore();
                }
            }
        }
    });

    // -------------------------------------------------------
    // constructor()
    // -------------------------------------------------------
    describe('constructor()', function () {
        it('should set build object, load atomic objects and config and run', function () {
            var mock = sinon.mock(AtomicBuilder.prototype);

            // mock methods
            mock.expects('loadObjects').once();
            mock.expects('loadConfig').once();
            mock.expects('run').once();

            // execute
            atomicBuilder = new AtomicBuilder([], {});

            // assert
            expect(atomicBuilder.build).to.deep.equal({});
            mock.verify();
        });
    });

    // -------------------------------------------------------
    // loadObjects()
    // -------------------------------------------------------
    describe('loadObjects()', function () {
        it('throws if objs param is empty', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.loadObjects();
            }).to.throw(Error);
        });
        it('throws if objs param is not an array', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.loadObjects('foo');
            }).to.throw(TypeError);
        });
        it('should store atomic objects', function () {
            var atomicObjs = [{
                type: 'pattern',
                id: 'padding-x',
                name: 'Horizontal padding',
                prefix: '.Px-',
                allowCustom: true,
                properties: ['padding-left', 'padding-right']
            }];

            // stub methods
            sinon.stub(AtomicBuilder.prototype, 'loadConfig');
            sinon.stub(AtomicBuilder.prototype, 'run');

            // execute
            atomicBuilder = new AtomicBuilder(atomicObjs);

            // assert
            expect(atomicBuilder.atomicObjs).to.deep.equal(atomicObjs);
        });
    });

    // -------------------------------------------------------
    // loadConfig()
    // -------------------------------------------------------
    describe('loadConfig()', function () {
        it('throws if objs param is empty', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.loadConfig();
            }).to.throw(Error);
        });
        it('throws if objs param is not an array', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.loadConfig('foo');
            }).to.throw(TypeError);
        });
        it('throws if config does not have a config key', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.loadConfig({});
            }).to.throw(TypeError);
        });
        it('throws if config has breakPoints key but it\'s not an object', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.loadConfig({
                    config: {
                        breakPoints: []
                    }
                });
            }).to.throw(TypeError);
        });
        it('throws if config has a breakPoints object but does not have `sm`, `md` nor `lg` keys', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.loadConfig({
                    config: {
                        breakPoints: {
                            foo: 'bar'
                        }
                    }
                });
            }).to.throw(Error);
        });
        it('should store the config', function () {
            var config = {
                'config': {
                    'namespace': '#atomic',
                    'start': 'left',
                    'end': 'right',
                    'defaults': {
                        'font-size': '16px',
                        'border-color': '#555',
                        'bleed-value': '-10px'
                    }
                },
                'font-weight': {
                    'n': true,
                    'b': true
                }
            };

            // stub methods
            sinon.stub(AtomicBuilder.prototype, 'loadObjects');
            sinon.stub(AtomicBuilder.prototype, 'run');

            // execute
            atomicBuilder = new AtomicBuilder({}, config);

            // assert
            expect(atomicBuilder.configObj).to.deep.equal(config);
        });
        it('should store the breakPoints as mediaQueries', function () {
            var config = {
                config: {
                    breakPoints: {
                        sm: '200px',
                        md: '300px',
                        lg: '500px'
                    }
                }
            };
            var expected = {
                sm: '@media(min-width:200px)',
                md: '@media(min-width:300px)',
                lg: '@media(min-width:500px)'
            };

            // stub methods
            sinon.stub(AtomicBuilder.prototype, 'loadObjects');
            sinon.stub(AtomicBuilder.prototype, 'run');

            // execute
            atomicBuilder = new AtomicBuilder({}, config);

            // assert
            expect(atomicBuilder.mediaQueries).to.deep.equal(expected);
        });
    });

    // -------------------------------------------------------
    // flush()
    // -------------------------------------------------------
    describe('flush()', function () {
        it('should clean build object', function () {
            var atomicBuilder = new AtomicBuilder([], {config: {}});
            // set something in the build
            atomicBuilder.build = {
                '.foo': {
                    'font-weight': 'bold'
                }
            };
            // flush it
            atomicBuilder.flush();

            // check if it was flushed
            expect(Object.keys(atomicBuilder.build).length).to.equal(0);
        });
    });

    // -------------------------------------------------------
    // addPatternRule()
    // -------------------------------------------------------
    describe('addPatternRule()', function () {
        // default params to send in tests
        var rule = {suffix: 'foo', values: ['bold']};
        var id = 'foo';
        var properties = ['font-weight'];
        var prefix = '.Fw-';
        var atomicObj = {
            id: id,
            properties: properties,
            prefix: prefix
        };

        // tests
        it('throws if `rules` is missing', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addPatternRule();
            }).to.throw(TypeError);
        });
        it('throws if `rules` is not an object', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addPatternRule('foo');
            }).to.throw(TypeError);
        });
        it('throws if `rules.values` is missing', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addPatternRule({
                    suffix: rule.suffix
                });
            }).to.throw(TypeError);
        });
        it('throws if `rules.values` is not an array', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addPatternRule({
                    suffix: rule.suffix,
                    values: 'values'
                });
            }).to.throw(TypeError);
        });
        it('throws if `rules.suffix` is missing', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addPatternRule({
                    values: ['values']
                });
            }).to.throw(TypeError);
        });
        it('throws if `rules.suffix` is not a string', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addPatternRule({
                    suffix: [rule.suffix],
                    values: ['values']
                });
            }).to.throw(TypeError);
        });
        it('throws if `atomicObj` is missing', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addPatternRule(rule);
            }).to.throw(TypeError);
        });
        it('throws if `atomicObj.id` is missing', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addPatternRule(rule, {
                    prefix: prefix,
                    properties: properties
                });
            }).to.throw(TypeError);
        });
        it('throws if `atomicObj.id` is not a string', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addPatternRule(rule, {
                    id: [id],
                    prefix: prefix,
                    properties: properties
                });
            }).to.throw(TypeError);
        });
        it('throws if `atomicObj.prefix` is missing', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addPatternRule(rule, {
                    id: id,
                    properties: properties
                });
            }).to.throw(TypeError);
        });
        it('throws if `atomicObj.prefix` is not a string', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addPatternRule(rule, {
                    id: id,
                    prefix: [prefix],
                    properties: properties
                });
            }).to.throw(TypeError);
        });
        it('throws if `atomicObj.properties` is missing', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addPatternRule(rule, {
                    id: id,
                    prefix: prefix
                });
            }).to.throw(TypeError);
        });
        it('throws if `atomicObj.properties` is not an array', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addPatternRule(rule, {
                    id: id,
                    prefix: prefix,
                    properties: {}
                });
            }).to.throw(TypeError);
        });
        it('throws if currentConfigObj is missing', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addPatternRule(rule, {
                    id: id,
                    prefix: prefix,
                    properties: properties
                });
            }).to.throw(TypeError);
        });
        it('should use config values if passed by the config', function (done) {
            var expected = 'custom-value';

            // stub methods
            sinon.stub(AtomicBuilder.prototype, 'loadConfig');
            sinon.stub(AtomicBuilder.prototype, 'loadObjects');
            sinon.stub(AtomicBuilder.prototype, 'run');
            sinon.stub(AtomicBuilder.prototype, 'addCssRule', function (className, property, value, breakPoints) {
                expect(value).to.equal(expected);
                done();
            });

            // instantiation & setup
            var atomicBuilder = new AtomicBuilder();

            // execute
            atomicBuilder.addPatternRule(rule, {
                id: id,
                prefix: prefix,
                properties: properties,
            }, {
                values: [expected]
            });
        });
        it('should call addCssRule() to add pattern to the build object if currentConfigObj is true', function () {
            // stub methods
            sinon.stub(AtomicBuilder.prototype, 'loadConfig');
            sinon.stub(AtomicBuilder.prototype, 'loadObjects');
            sinon.stub(AtomicBuilder.prototype, 'run');

            // instantiation & setup
            var atomicBuilder = new AtomicBuilder();
            var mock = sinon.mock(atomicBuilder);

            // set expectations
            mock.expects('addCssRule').once();

            // execute
            atomicBuilder.addPatternRule(rule, atomicObj, true);

            // assert
            mock.verify();
        });
    });

    // -------------------------------------------------------
    // addFractionRules()
    // -------------------------------------------------------
    describe('addFractionRules()', function () {
        // default params to send in tests
        var fractionObj = {
            denominator: 3
        };
        var id = 'width';
        var properties = ['width'];
        var prefix = '.W-';
        var atomicObj = {
            id: id,
            prefix: prefix,
            properties: properties
        };

        // tests
        it('throws if `fractionObj` is not an object', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addFractionRules('foo', atomicObj);
            }).to.throw(TypeError);
        });
        it('throws if `fractionObj.denominator` is missing', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addFractionRules({}, atomicObj);
            }).to.throw(TypeError);
        });
        it('throws if `fractionObj.denominator` is not an integer', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addFractionRules({
                    denominator: 1.2
                }, atomicObj);
            }).to.throw(TypeError);
        });
        it('throws if `atomicObj.id` is missing', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addFractionRules(fractionObj, {
                    prefix: prefix,
                    properties: properties
                });
            }).to.throw(TypeError);
        });
        it('throws if `atomicObj.id` is not a string', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addFractionRules(fractionObj, {
                    id: [id],
                    prefix: prefix,
                    properties: properties
                });
            }).to.throw(TypeError);
        });
        it('throws if `atomicObj.properties` is missing', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addFractionRules(fractionObj, {
                    id: id,
                    prefix: prefix
                });
            }).to.throw(TypeError);
        });
        it('throws if `atomicObj.properties` is not an array', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addFractionRules(fractionObj, {
                    id: id,
                    prefix: prefix,
                    properties: {}
                });
            }).to.throw(TypeError);
        });
        it('throws if `atomicObj.prefix` is missing', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addFractionRules(fractionObj, {
                    id: id,
                    properties: properties
                });
            }).to.throw(TypeError);
        });
        it('throws if `atomicObj.prefix` is not a string', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addFractionRules(fractionObj, {
                    id: id,
                    prefix: [prefix],
                    properties: properties
                });
            }).to.throw(TypeError);
        });
        it('should call addCssRule() to add pattern to the build object', function () {
            // stub methods
            sinon.stub(AtomicBuilder.prototype, 'loadConfig');
            sinon.stub(AtomicBuilder.prototype, 'loadObjects');
            sinon.stub(AtomicBuilder.prototype, 'run');

            // instantiation & setup
            var atomicBuilder = new AtomicBuilder();
            var mock = sinon.mock(atomicBuilder);

            // set expectations
            mock.expects('addCssRule').thrice();

            // execute
            atomicBuilder.addFractionRules(fractionObj, atomicObj);

            // assert
            mock.verify();
        });
    });

    // -------------------------------------------------------
    // addRule()
    // -------------------------------------------------------
    describe('addRule()', function () {
        var rule = {
            '.Foo': {
                'font-weight': 'bold'
            }
        };
        var id = 'foo';

        // tests
        it('throws if `rule` is not an object', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addRule('foo');
            }).to.throw(TypeError);
        });
        it('throws if `id` is not a string', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addRule({});
            }).to.throw(TypeError);
        });
        it('throws if configObj is not set in the instance', function () {
            // execute and assert
            expect(function () {
                // stub methods
                sinon.stub(AtomicBuilder.prototype, 'loadConfig');
                sinon.stub(AtomicBuilder.prototype, 'loadObjects');
                sinon.stub(AtomicBuilder.prototype, 'run');

                // execute
                var atomicBuilder = new AtomicBuilder();
                atomicBuilder.addRule(rule, id);
            }).to.throw(TypeError);
        });
        it('should not call addCssrule() if rule is not wanted by the config', function () {
            // stub methods
            sinon.stub(AtomicBuilder.prototype, 'loadConfig');
            sinon.stub(AtomicBuilder.prototype, 'loadObjects');
            sinon.stub(AtomicBuilder.prototype, 'run');

            // instantiation & setup
            var atomicBuilder = new AtomicBuilder();
            var mock = sinon.mock(atomicBuilder);

            // set config
            atomicBuilder.configObj = {
                'foo': false
            };

            // set expectations
            mock.expects('addCssRule').never();

            // execute
            atomicBuilder.addRule(rule, id);

            // assert
            mock.verify();
        });
        it('should call addCssrule() if rule is wanted by the config', function () {
            // stub methods
            sinon.stub(AtomicBuilder.prototype, 'loadConfig');
            sinon.stub(AtomicBuilder.prototype, 'loadObjects');
            sinon.stub(AtomicBuilder.prototype, 'run');

            // instantiation & setup
            var atomicBuilder = new AtomicBuilder();
            var mock = sinon.mock(atomicBuilder);

            // set config
            atomicBuilder.configObj = {
                'foo': true
            };

            // set expectations
            mock.expects('addCssRule').atLeast(1);

            // execute
            atomicBuilder.addRule(rule, id);

            // assert
            mock.verify();
        });
    });

    // -------------------------------------------------------
    // addCssRule()
    // -------------------------------------------------------
    describe('addCssRule()', function () {
        var className = '.Foo';
        var property = 'font-weight';
        var value = 'bold';
        var breakPoints = ['sm', 'md', 'lg'];

        it('throws if className has not been passed or is invalid', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addCssrule();
            }).to.throw(TypeError);
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addCssrule({});
            }).to.throw(TypeError);
        });
        it('throws if property has not been passed or is invalid', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addCssrule(className);
            }).to.throw(TypeError);
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addCssrule(className, {});
            }).to.throw(TypeError);
        });
        it('throws if value has not been passed', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.addCssrule(className, property);
            }).to.throw(TypeError);
        });
        it('adds breakPoint rules if breakPoints have been passed', function () {
            var expected = {
                '.Foo': {
                    'font-weight': 'bold'
                },
                '.Foo--sm': {
                    '@media(min-width:100px)': {
                        'font-weight': 'bold'
                    }
                },
                '.Foo--md': {
                    '@media(min-width:200px)': {
                        'font-weight': 'bold'
                    }
                },
                '.Foo--lg': {
                    '@media(min-width:300px)': {
                        'font-weight': 'bold'
                    }
                }
            };
            // stub methods
            sinon.stub(AtomicBuilder.prototype, 'loadConfig');
            sinon.stub(AtomicBuilder.prototype, 'loadObjects');
            sinon.stub(AtomicBuilder.prototype, 'run');
            sinon.stub(AtomicBuilder.prototype, 'placeConstants', function (str) {
                return str;
            });

            // execute
            var atomicBuilder = new AtomicBuilder();

            // add mediaQueries
            atomicBuilder.mediaQueries = {
                sm: '@media(min-width:100px)',
                md: '@media(min-width:200px)',
                lg: '@media(min-width:300px)'
            };

            expect(atomicBuilder.addCssRule(className, property, value, breakPoints)).to.be.true;
            expect(atomicBuilder.build).to.deep.equal(expected);
        });
        it('adds rule if all params are valid and `breakPoints` has not been passed', function () {
            var expected = {
                '.Foo': {
                    'font-weight': 'bold'
                }
            };
            // stub methods
            sinon.stub(AtomicBuilder.prototype, 'loadConfig');
            sinon.stub(AtomicBuilder.prototype, 'loadObjects');
            sinon.stub(AtomicBuilder.prototype, 'run');
            sinon.stub(AtomicBuilder.prototype, 'placeConstants', function (str) {
                return str;
            });

            // execute
            var atomicBuilder = new AtomicBuilder();

            expect(atomicBuilder.addCssRule(className, property, value)).to.be.true;
            expect(atomicBuilder.build).to.deep.equal(expected);
        });
    });

    // -------------------------------------------------------
    // escapeSelector()
    // -------------------------------------------------------
    describe('escapeSelector()', function () {
        it('throws if str has not been passed', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.escapeSelector();
            }).to.throw(TypeError);
        });
        it('returns the original string if the param is not a string', function () {
            // execute and assert
            expect(AtomicBuilder.prototype.escapeSelector(123)).to.equal(123);
        });
        it('returns the processed string if passed', function () {
            // execute and assert
            expect(AtomicBuilder.prototype.escapeSelector('#atomic .selector-50%')).to.equal('#atomic .selector-50\\%');
            expect(AtomicBuilder.prototype.escapeSelector('#atomic .selector-50%/50%')).to.equal('#atomic .selector-50\\%\\/50\\%');
            expect(AtomicBuilder.prototype.escapeSelector('#atomic .selector-50%::something')).to.equal('#atomic .selector-50\\%\\:\\:something');
            expect(AtomicBuilder.prototype.escapeSelector('#atomic .selector-.50%:.:something')).to.equal('#atomic .selector-\\.50\\%\\:\\.\\:something');
        });
    });

    // -------------------------------------------------------
    // placeConstants()
    // -------------------------------------------------------
    describe('placeConstants()', function () {
        it('throws if str has not been passed', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.placeConstants();
            }).to.throw(TypeError);
        });
        it('throws if config is not set', function () {
            // execute and assert
            expect(function () {
                AtomicBuilder.prototype.placeConstants('test');
            }).to.throw(TypeError);
        });
        it('returns the original string if the param is not a string', function () {
            // execute and assert
            expect(AtomicBuilder.prototype.placeConstants(123)).to.equal(123);
        });
        it('returns the original string if the param is not a string', function () {
            // stub methods
            sinon.stub(AtomicBuilder.prototype, 'loadConfig');
            sinon.stub(AtomicBuilder.prototype, 'loadObjects');
            sinon.stub(AtomicBuilder.prototype, 'run');

            // execute
            var atomicBuilder = new AtomicBuilder();
            atomicBuilder.configObj = {
                config: {
                    start: 'foo',
                    end: 'bar'
                }
            };

            // assert
            expect(atomicBuilder.placeConstants(123)).equal(123);
        });
        it('returns the processed string if passed', function () {
            // stub methods
            sinon.stub(AtomicBuilder.prototype, 'loadConfig');
            sinon.stub(AtomicBuilder.prototype, 'loadObjects');
            sinon.stub(AtomicBuilder.prototype, 'run');

            // execute
            var atomicBuilder = new AtomicBuilder();
            atomicBuilder.configObj = {
                config: {
                    start: 'foo',
                    end: 'bar'
                }
            };

            // assert
            expect(atomicBuilder.placeConstants('test-$START')).equal('test-foo');
            expect(atomicBuilder.placeConstants('test-$END')).equal('test-bar');
            expect(atomicBuilder.placeConstants('test-$START-$END')).equal('test-foo-bar');
        });
    });

    // -------------------------------------------------------
    // getBuild()
    // -------------------------------------------------------
    describe('getBuild()', function () {
        it('throws if configObj is not set in the instance', function () {
            // execute and assert
            expect(function () {
                // stub methods
                sinon.stub(AtomicBuilder.prototype, 'loadConfig');
                sinon.stub(AtomicBuilder.prototype, 'loadObjects');
                sinon.stub(AtomicBuilder.prototype, 'run');

                // execute
                var atomicBuilder = new AtomicBuilder();
                atomicBuilder.getBuild();
            }).to.throw(TypeError);
        });
        it('should return the build with no namespace if none is defined', function () {
            // stub methods
            sinon.stub(AtomicBuilder.prototype, 'loadConfig');
            sinon.stub(AtomicBuilder.prototype, 'loadObjects');
            sinon.stub(AtomicBuilder.prototype, 'run');

            // execute
            var atomicBuilder = new AtomicBuilder();
            atomicBuilder.build = {
                'foo': {
                    'font-weight': 'bold'
                }
            };
            atomicBuilder.configObj = {
                'foo': true
            };
            var result = atomicBuilder.getBuild();

            // assert
            expect(result).to.deep.equal(atomicBuilder.build);
        });
        it('should return the build with namespace if defined', function () {
            // stub methods
            sinon.stub(AtomicBuilder.prototype, 'loadConfig');
            sinon.stub(AtomicBuilder.prototype, 'loadObjects');
            sinon.stub(AtomicBuilder.prototype, 'run');

            // execute
            var atomicBuilder = new AtomicBuilder();
            atomicBuilder.build = {
                'foo': {
                    'font-weight': 'bold'
                }
            };
            atomicBuilder.configObj = {
                config: {
                    namespace: '.baz'
                },
                'foo': true
            };
            var result = atomicBuilder.getBuild();
            var expected = {};
            expected[atomicBuilder.configObj.config.namespace] = atomicBuilder.build;

            // assert
            expect(result).to.deep.equal(expected);
        });
    });

    // -------------------------------------------------------
    // run()
    // -------------------------------------------------------
    describe('run()', function () {
        it('throws if `id` in atomicObj is not a string', function () {
            // execute and assert
            expect(function () {
                // stub methods
                sinon.stub(AtomicBuilder.prototype, 'loadConfig');
                sinon.stub(AtomicBuilder.prototype, 'loadObjects');
                sinon.stub(AtomicBuilder.prototype, 'run');

                // instantiation & setup
                var atomicBuilder = new AtomicBuilder();
                atomicBuilder.atomicObjs = [{}];

                // restore the method we're testing
                AtomicBuilder.prototype.run.restore();

                // execute
                atomicBuilder.run();
            }).to.throw(TypeError);
        });
        it('throws if `type` in atomicObj is not a string', function () {
            // execute and assert
            expect(function () {
                // stub methods
                sinon.stub(AtomicBuilder.prototype, 'loadConfig');
                sinon.stub(AtomicBuilder.prototype, 'loadObjects');
                sinon.stub(AtomicBuilder.prototype, 'run');

                // instantiation & setup
                var atomicBuilder = new AtomicBuilder();
                atomicBuilder.atomicObjs = [{
                    id: 'foo'
                }];

                // restore the method we're testing
                AtomicBuilder.prototype.run.restore();

                // execute
                atomicBuilder.run();
            }).to.throw(TypeError);
        });

        // -------------------------------------------------------
        // type: pattern
        // -------------------------------------------------------
        describe('type: `pattern`', function () {
            it('throws if `properties` in atomicObj is not an array', function () {
                // execute and assert
                expect(function () {
                    // stub methods
                    sinon.stub(AtomicBuilder.prototype, 'loadConfig');
                    sinon.stub(AtomicBuilder.prototype, 'loadObjects');
                    sinon.stub(AtomicBuilder.prototype, 'run');

                    // instantiation & setup
                    var atomicBuilder = new AtomicBuilder();
                    atomicBuilder.atomicObjs = [{
                        id: 'foo',
                        type: 'pattern'
                    }];

                    // restore the method we're testing
                    AtomicBuilder.prototype.run.restore();

                    // execute
                    atomicBuilder.run();
                }).to.throw(TypeError);
            });
            it('throws if `prefix` in atomicObj is not a String', function () {
                // execute and assert
                expect(function () {
                    // stub methods
                    sinon.stub(AtomicBuilder.prototype, 'loadConfig');
                    sinon.stub(AtomicBuilder.prototype, 'loadObjects');
                    sinon.stub(AtomicBuilder.prototype, 'run');

                    // instantiation & setup
                    var atomicBuilder = new AtomicBuilder();
                    atomicBuilder.atomicObjs = [{
                        id: 'foo',
                        type: 'pattern',
                        properties: ['font-weight']
                    }];

                    // restore the method we're testing
                    AtomicBuilder.prototype.run.restore();

                    // execute
                    atomicBuilder.run();
                }).to.throw(TypeError);
            });
            it('should execute addPatternRule() once if atomicObj is a pattern', function () {
                // stub methods
                sinon.stub(AtomicBuilder.prototype, 'loadConfig');
                sinon.stub(AtomicBuilder.prototype, 'loadObjects');
                sinon.stub(AtomicBuilder.prototype, 'run');

                // instantiation & setup
                var atomicBuilder = new AtomicBuilder();
                var mock = sinon.mock(atomicBuilder);

                // set config and atomicObjs before running
                atomicBuilder.configObj = {
                    'font-weight': {
                        b: true
                    }
                };
                atomicBuilder.atomicObjs = [{
                    type: 'pattern',
                    id: 'font-weight',
                    name: 'Font weight',
                    prefix: '.Fw-',
                    properties: ['font-weight'],
                    rules: [
                        {suffix: 'n', values: ['normal']},
                        {suffix: 'b', values: ['bold']}
                    ]
                }];

                // restore the method we're testing
                AtomicBuilder.prototype.run.restore();

                // set expectations
                mock.expects('addPatternRule').once();

                // execute
                atomicBuilder.run();

                // assert
                mock.verify();
            });

            // CUSTOM PATTERN
            it('throws if custom has been passed in the config but atomic object does not allow it', function () {
                expect(function () {
                    // stub methods
                    sinon.stub(AtomicBuilder.prototype, 'loadConfig');
                    sinon.stub(AtomicBuilder.prototype, 'loadObjects');
                    sinon.stub(AtomicBuilder.prototype, 'run');

                    // instantiation & setup
                    var atomicBuilder = new AtomicBuilder();

                    // set config and atomicObjs before running
                    atomicBuilder.configObj = {
                        'font-weight': {
                            b: true,
                            custom: [
                                { suffix: '100', values: ['100'] }
                            ]
                        }
                    };
                    atomicBuilder.atomicObjs = [{
                        type: 'pattern',
                        id: 'font-weight',
                        name: 'Font weight',
                        prefix: '.Fw-',
                        properties: ['font-weight'],
                        rules: [
                            {suffix: 'n', values: ['normal']},
                            {suffix: 'b', values: ['bold']}
                        ]
                    }];

                    // restore the method we're testing
                    AtomicBuilder.prototype.run.restore();

                    // execute
                    atomicBuilder.run();
                }).to.throw(Error);
            });
            it('throws if custom has been passed in the config AND it is allowed, but it\'s not an array', function () {
                expect(function () {
                    // stub methods
                    sinon.stub(AtomicBuilder.prototype, 'loadConfig');
                    sinon.stub(AtomicBuilder.prototype, 'loadObjects');
                    sinon.stub(AtomicBuilder.prototype, 'run');

                    // instantiation & setup
                    var atomicBuilder = new AtomicBuilder();

                    // set config and atomicObjs before running
                    atomicBuilder.configObj = {
                        'font-weight': {
                            b: true,
                            custom: 'not an array'
                        }
                    };
                    atomicBuilder.atomicObjs = [{
                        type: 'pattern',
                        id: 'font-weight',
                        name: 'Font weight',
                        prefix: '.Fw-',
                        properties: ['font-weight'],
                        allowCustom: true,
                        rules: [
                            {suffix: 'n', values: ['normal']},
                            {suffix: 'b', values: ['bold']}
                        ]
                    }];

                    // restore the method we're testing
                    AtomicBuilder.prototype.run.restore();

                    // execute
                    atomicBuilder.run();
                }).to.throw(TypeError);
            });
            it('should execute addPatternRule() once if atomicObj is a pattern and has custom values on an atomic object that allows custom values', function () {
                // stub methods
                sinon.stub(AtomicBuilder.prototype, 'loadConfig');
                sinon.stub(AtomicBuilder.prototype, 'loadObjects');
                sinon.stub(AtomicBuilder.prototype, 'run');

                // instantiation & setup
                var atomicBuilder = new AtomicBuilder();
                var mock = sinon.mock(atomicBuilder);

                // set config and atomicObjs before running
                atomicBuilder.configObj = {
                    'font-weight': {
                        b: true,
                        custom: [
                            { suffix: '100', values: ['100'] }
                        ]
                    }
                };
                atomicBuilder.atomicObjs = [{
                    type: 'pattern',
                    id: 'font-weight',
                    name: 'Font weight',
                    prefix: '.Fw-',
                    properties: ['font-weight'],
                    allowCustom: true
                }];

                // restore the method we're testing
                AtomicBuilder.prototype.run.restore();

                // set expectations
                mock.expects('addPatternRule').once();

                // execute
                atomicBuilder.run();

                // assert
                mock.verify();
            });

            // CUSTOM AUTO SUFFIX PATTERN
            it('throws if custom-auto-suffix has been passed in the config but rule does not allow it', function () {
                expect(function () {
                    // stub methods
                    sinon.stub(AtomicBuilder.prototype, 'loadConfig');
                    sinon.stub(AtomicBuilder.prototype, 'loadObjects');
                    sinon.stub(AtomicBuilder.prototype, 'run');

                    // instantiation & setup
                    var atomicBuilder = new AtomicBuilder();

                    // set config and atomicObjs before running
                    atomicBuilder.configObj = {
                        'font-weight': {
                            'b': true,
                            'custom-auto-suffix': [
                                {values: ['100']}
                            ]
                        }
                    };
                    atomicBuilder.atomicObjs = [{
                        type: 'pattern',
                        id: 'font-weight',
                        name: 'Font weight',
                        prefix: '.Fw-',
                        properties: ['font-weight'],
                        rules: [
                            {suffix: 'n', values: ['normal']},
                            {suffix: 'b', values: ['bold']}
                        ]
                    }];

                    // restore the method we're testing
                    AtomicBuilder.prototype.run.restore();

                    // execute
                    atomicBuilder.run();
                }).to.throw(Error);
            });
            it('throws if custom has been passed in the config AND it is allowed, but it\'s not an array', function () {
                expect(function () {
                    // stub methods
                    sinon.stub(AtomicBuilder.prototype, 'loadConfig');
                    sinon.stub(AtomicBuilder.prototype, 'loadObjects');
                    sinon.stub(AtomicBuilder.prototype, 'run');

                    // instantiation & setup
                    var atomicBuilder = new AtomicBuilder();

                    // set config and atomicObjs before running
                    atomicBuilder.configObj = {
                        'font-weight': {
                            b: true,
                            'custom-auto-suffix': 'not an array'
                        }
                    };
                    atomicBuilder.atomicObjs = [{
                        type: 'pattern',
                        id: 'font-weight',
                        name: 'Font weight',
                        prefix: '.Fw-',
                        properties: ['font-weight'],
                        allowCustom: true,
                        allowCustomAutoSuffix: true,
                        rules: [
                            {suffix: 'n', values: ['normal']},
                            {suffix: 'b', values: ['bold']}
                        ]
                    }];

                    // restore the method we're testing
                    AtomicBuilder.prototype.run.restore();

                    // execute
                    atomicBuilder.run();
                }).to.throw(TypeError);
            });
            it('should execute addPatternRule() once if atomicObj is a pattern and has custom auto prefix values on an atomic object that allows them', function (done) {
                var assertions = 0;

                // stub methods
                sinon.stub(AtomicBuilder.prototype, 'loadConfig');
                sinon.stub(AtomicBuilder.prototype, 'loadObjects');
                sinon.stub(AtomicBuilder.prototype, 'run');
                sinon.stub(AtomicBuilder.prototype, 'addPatternRule', function (rule) {
                    switch(rule.values[0]) {
                        case '100':
                            expect(rule.suffix).to.equal('a');
                            break;
                        case '200':
                            expect(rule.suffix).to.equal('b');
                            break;
                        case '11px':
                            expect(rule.suffix).to.equal(1);
                            break;
                        case '12px':
                            expect(rule.suffix).to.equal(2);
                            break;
                    }
                    assertions++;
                    if (assertions === 4) {
                        done();
                    }
                });

                // instantiation & setup
                var atomicBuilder = new AtomicBuilder();

                // set config and atomicObjs before running
                atomicBuilder.configObj = {
                    'font-weight': {
                        'custom-auto-suffix': [
                            {values: ['100']},
                            {values: ['200']}
                        ]
                    },
                    'font-size': {
                        'custom-auto-suffix': [
                            {values: ['11px']},
                            {values: ['12px']}
                        ]
                    }
                };
                atomicBuilder.atomicObjs = [
                    {
                        type: 'pattern',
                        id: 'font-weight',
                        name: 'Font weight',
                        prefix: '.Fw-',
                        properties: ['font-weight'],
                        allowCustom: true,
                        allowCustomAutoSuffix: true
                    },
                    {
                        type: 'pattern',
                        id: 'font-size',
                        name: 'Font size',
                        prefix: '.Fz-',
                        properties: ['font-size'],
                        suffixType: 'numerical',
                        allowCustom: true,
                        allowCustomAutoSuffix: true
                    }
                ];

                // restore the method we're testing
                AtomicBuilder.prototype.run.restore();

                // execute
                atomicBuilder.run();
            });
        });

        // -------------------------------------------------------
        // type: rule
        // -------------------------------------------------------
        describe('type: `rule`', function () {
            it('throws if `rule` in atomicObj is not an object', function () {
                // execute and assert
                expect(function () {
                    // stub methods
                    sinon.stub(AtomicBuilder.prototype, 'loadConfig');
                    sinon.stub(AtomicBuilder.prototype, 'loadObjects');
                    sinon.stub(AtomicBuilder.prototype, 'run');

                    // instantiation & setup
                    var atomicBuilder = new AtomicBuilder();
                    atomicBuilder.atomicObjs = [{
                        id: 'foo',
                        type: 'rule'
                    }];

                    // restore the method we're testing
                    AtomicBuilder.prototype.run.restore();

                    // execute
                    atomicBuilder.run();
                }).to.throw(TypeError);
            });
            it('should execute addRule() once if atomicObj is a rule', function () {
                // stub methods
                sinon.stub(AtomicBuilder.prototype, 'loadConfig');
                sinon.stub(AtomicBuilder.prototype, 'loadObjects');
                sinon.stub(AtomicBuilder.prototype, 'run');

                // instantiation & setup
                var atomicBuilder = new AtomicBuilder();
                var mock = sinon.mock(atomicBuilder);

                // set config and atomicObjs before running
                atomicBuilder.configObj = {
                    'foo': true
                };
                atomicBuilder.atomicObjs = [{
                    type: 'rule',
                    id: 'foo',
                    rule: {
                        '.Foo': {
                            'font-weight': 'bold'
                        }
                    }
                }];

                // restore the method we're testing
                AtomicBuilder.prototype.run.restore();

                // set expectations
                mock.expects('addRule').once();

                // execute
                atomicBuilder.run();

                // assert
                mock.verify();
            });
        });
    });
});