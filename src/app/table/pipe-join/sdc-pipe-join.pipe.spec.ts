import { PipeJoin } from './sdc-pipe-join.pipe';
describe('sdc-pipe-join', () => {
    let pipe = new PipeJoin();

    it('should not affect string if no options are sent to pipe', () => {
        expect(pipe.transform('Lukas Rossi', null)).toBe('Lukas Rossi');
    });

    describe('uppercase', () => {
        let pipeOptions =  {
            custom: null,
            upperCase: true,
            lowerCase: false,
            currency: false,
            date: false,
            percent: false
        };

        it('should have priority over lowercase option', () => {
            pipeOptions.lowerCase = true;
            expect(pipe.transform('Lukas Rossi', pipeOptions)).toBe('LUKAS ROSSI');
            pipeOptions.lowerCase = false;
        });

        it('should uppercase all lowercase word', () => {
            expect(pipe.transform('abc', pipeOptions)).toBe('ABC');
        });

        it('should uppercase words that are capitalized', () => {
            expect(pipe.transform('Lukas Rossi', pipeOptions)).toBe('LUKAS ROSSI');
        });

        it('should uppercase word with some uppercase, some lowercase', () => {
            expect(pipe.transform('WaTeRmElOn', pipeOptions)).toBe('WATERMELON');
        });

        it('should not affect an all-uppercased word', () => {
            expect(pipe.transform('ABC', pipeOptions)).toBe('ABC');
        });
    });

    describe('lowercase', () => {
        let pipeOptions = {
            custom: null,
            upperCase: false,
            lowerCase: true,
            currency: false,
            date: false,
            percent: false
        };

        it('should lowercase all uppercase word', () => {
            expect(pipe.transform('ABC', pipeOptions)).toBe('abc');
        });

        it('should lowercase words that are capitalized', () => {
            expect(pipe.transform('Lukas Rossi', pipeOptions)).toBe('lukas rossi');
        });

        it('should lowercase word with some uppercase, some lowercase', () => {
            expect(pipe.transform('WaTeRmElOn', pipeOptions)).toBe('watermelon');
        });

        it('should not affect an all-lowercased word', () => {
            expect(pipe.transform('abc', pipeOptions)).toBe('abc');
        });
    });

    describe('percent', () => {
        let pipeOptions = {
            custom: null,
            upperCase: false,
            lowerCase: false,
            currency: false,
            date: false,
            percent: {
                param1: '1.0-3'
            }
        };

        it('should transform 2 into a percent', () => {
            expect(pipe.transform('2', pipeOptions)).toBe('200%');
        });

        it('should transform 200 into a percent', () => {
            expect(pipe.transform('200', pipeOptions)).toBe('20,000%');
        });

        it('should transform 200.5 into a percent', () => {
            expect(pipe.transform('200.5', pipeOptions)).toBe('20,050%');
        });

        it('should transform 200.543 into a percent', () => {
            expect(pipe.transform('200.543', pipeOptions)).toBe('20,054.3%');
        });
    });

    describe('currency', () => {
        let pipeOptions = {
            custom: null,
            upperCase: false,
            lowerCase: false,
            currency: null,
            date: false,
            percent: false
        };

        it('should have priority over date and percent options', () => {
            let priorityTestPipeOptions = {
                custom: null,
                upperCase: false,
                lowerCase: false,
                currency: true,
                date: {
                    param1: 'shortDate'
                },
                percent: true
            };
            expect(pipe.transform('200', priorityTestPipeOptions)).toBe('$200.00');
        });

        describe('default formatting', () => {
            beforeEach(() => {
                pipeOptions.currency = true;
            });

            it('should transform value with decimal', () => {
                expect(pipe.transform('200.54', pipeOptions)).toBe('$200.54');
            });

            it('should transform value with long decimal', () => {
                expect(pipe.transform('200.5412345', pipeOptions)).toBe('$200.54');
            });

            it('should transform value with no decimal', () => {
                expect(pipe.transform('200', pipeOptions)).toBe('$200.00');
            });
        });

        describe('custom formatting', () => {
            beforeEach(() => {
                pipeOptions.currency = {
                    param1: 'CAD',
                    param2: false,
                    param3: '1.0-0'
                };
            });

            it('should transform value with decimal', () => {
                expect(pipe.transform('200.54', pipeOptions)).toBe('CAD201');
            });

            it('should transform value with long decimal', () => {
                expect(pipe.transform('200.5412345', pipeOptions)).toBe('CAD201');
            });

            it('should transform value with no decimal', () => {
                expect(pipe.transform('200', pipeOptions)).toBe('CAD200');
            });
        });
    });

    describe('date', () => {
        let pipeOptions = {
            custom: null,
            upperCase: false,
            lowerCase: false,
            currency: false,
            date: null, // This will be set in each individual test
            percent: false
        };

        describe('short date', () => {
            beforeEach(() => {
                pipeOptions.date = {
                    param1: 'shortDate'
                };
            });

            it('should transform date object', () => {
                expect(pipe.transform(new Date('2002-04-26T09:00:00'), pipeOptions)).toBe('2002-04-26');
            });

            it('should transform ISO string', () => {
                expect(pipe.transform('1994-11-05T08:15:30-05:00', pipeOptions)).toBe('1994-11-05');
            });
        });

        describe('full date', () => {
            beforeEach(() => {
                pipeOptions.date = {
                    param1: 'fullDate'
                };
            });

            it('should transform date object', () => {
                expect(pipe.transform(new Date('2002-04-26T09:00:00'), pipeOptions)).toBe('Friday, April 26, 2002');
            });

            it('should transform ISO string', () => {
                expect(pipe.transform('1994-11-05T08:15:30-05:00', pipeOptions)).toBe('Saturday, November 5, 1994');
            });
        });

        describe('custom date', () => {
            beforeEach(() => {
                pipeOptions.date = {
                    param1: 'h:mm:ssa'
                };
            });

            it('should transform date object', () => {
                expect(pipe.transform(new Date('2002-04-26T09:00:00'), pipeOptions)).toBe('9:00:00AM');
            });

            it('should transform ISO string', () => {
                expect(pipe.transform('1994-11-05T08:15:30-05:00', pipeOptions)).toBe('8:15:30AM');
            });
        });
    });

    describe('custom function (reverse string)', () => {
        let pipeOptions = {
            custom: function (input) {
                // Reverse a string
                return input.split('').reverse().join('');
            },
            upperCase: false,
            lowerCase: false,
            currency: false,
            date: null, // This will be set in each individual test
            percent: false
        };

        it('should transform a string', () => {
            expect(pipe.transform('.NET SDC', pipeOptions)).toBe('CDS TEN.');
        });

        it('should not affect a palindrome', () => {
            expect(pipe.transform('hannah', pipeOptions)).toBe('hannah');
        });
    });
});
