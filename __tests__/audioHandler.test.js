import {
    AudioHandler,
    MenuAudioHandler,
    CutsceneDialogueAudioHandler,
    CutsceneSFXAudioHandler,
    CutsceneMusicAudioHandler,
    MapSoundtrackAudioHandler,
    FiredogAudioHandler,
    PowerUpAndDownSFXAudioHandler,
    ExplosionSFXAudioHandler,
    EnemySFXAudioHandler
} from '../game/audioHandler.js';

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => { });
});

describe('AudioHandler (base class)', () => {
    let ah;

    beforeEach(() => {
        ah = new AudioHandler({});
        ah.soundsMapping = {};
        ah.sounds = {};
        ah.pausedSoundPositions = {};
    });

    describe('loadSound()', () => {
        it('returns element and registers `ended` listener', () => {
            const audioEl = document.createElement('audio');
            audioEl.id = 'foo';
            document.body.appendChild(audioEl);

            const spyAdd = jest.spyOn(audioEl, 'addEventListener');
            ah.soundsMapping = { foo: 'foo' };

            ah.pausedSoundPositions['foo'] = 5;
            const loaded = ah.loadSound('foo');
            expect(loaded).toBe(audioEl);
            expect(spyAdd).toHaveBeenCalledWith('ended', expect.any(Function));

            // trigger ended handler
            const handler = spyAdd.mock.calls[0][1];
            handler();
            expect(ah.pausedSoundPositions['foo']).toBeUndefined();
        });

        it('returns null and logs error if no element', () => {
            ah.soundsMapping = { missing: 'no-such-id' };
            const res = ah.loadSound('missing');
            expect(res).toBeNull();
            expect(console.error).toHaveBeenCalledWith(
                "Audio element with ID 'no-such-id' not found."
            );
        });
    });

    describe('prePlaySound()', () => {
        let fake;
        beforeEach(() => {
            fake = {
                currentTime: 5,
                loop: false,
                paused: true,
                play: jest.fn(() => { fake.paused = false; }),
                pause: jest.fn(),
            };
        });

        it('resets time and loop, then plays', () => {
            const ret = ah.prePlaySound(fake, true, true);
            expect(ret).toBe(fake);
            expect(fake.currentTime).toBe(0);
            expect(fake.loop).toBe(true);
            expect(fake.play).toHaveBeenCalled();
            expect(fake.paused).toBe(false);
        });

        it('does nothing if audioElement is falsy', () => {
            expect(ah.prePlaySound(null)).toBeNull();
        });
    });

    describe('playSound()', () => {
        let fake;
        beforeEach(() => {
            fake = {
                currentTime: 0,
                loop: false,
                paused: true,
                play: jest.fn(() => { fake.paused = false; }),
                pause: jest.fn(),
            };
            ah.sounds = { bar: fake };
        });

        it('invokes prePlaySound when shouldPause=false', () => {
            const spy = jest.spyOn(ah, 'prePlaySound');
            const ret = ah.playSound('bar', true, true, false);
            expect(spy).toHaveBeenCalledWith(fake, true, true);
            expect(ret).toBe(fake);
        });

        it('invokes stopSound when shouldPause=true', () => {
            const spy = jest.spyOn(ah, 'stopSound');
            ah.playSound('bar', false, false, true);
            expect(spy).toHaveBeenCalledWith('bar');
        });

        it('returns undefined for unknown soundName', () => {
            expect(ah.playSound('nope')).toBeUndefined();
        });
    });

    describe('stopSound() & stopAllSounds()', () => {
        let fake;
        beforeEach(() => {
            fake = {
                id: 'baz',
                currentTime: 7,
                paused: false,
                play: jest.fn(),
                pause: jest.fn(() => { fake.paused = true; }),
            };
            ah.soundsMapping = { baz: 'baz' };
            ah.sounds = { baz: fake };
            ah.pausedSoundPositions['baz'] = 123;
        });

        it('stopSound pauses, zeroes time, and clears pausedSoundPositions key', () => {
            ah.stopSound('baz');
            expect(fake.pause).toHaveBeenCalled();
            expect(fake.currentTime).toBe(0);
            expect(ah.pausedSoundPositions.baz).toBeUndefined();
        });

        it('stopAllSounds calls stopSound for each mapping key', () => {
            const spy = jest.spyOn(ah, 'stopSound');
            ah.stopAllSounds();
            expect(spy).toHaveBeenCalledWith('baz');
        });
    });

    describe('pauseSound() & pauseAllSounds()', () => {
        let one, two;
        beforeEach(() => {
            one = { id: 'one', currentTime: 1, paused: false, pause: jest.fn(() => { one.paused = true; }), play: jest.fn() };
            two = { id: 'two', currentTime: 2, paused: false, pause: jest.fn(() => { two.paused = true; }), play: jest.fn() };
            ah.soundsMapping = { one: 'one', two: 'two' };
            ah.sounds = { one, two };
        });

        it('pauseSound pauses and stores position', () => {
            ah.pauseSound('one');
            expect(one.pause).toHaveBeenCalled();
            expect(ah.pausedSoundPositions.one).toBe(1);
        });

        it('pauseSound does nothing if already paused', () => {
            one.paused = true;
            ah.pauseSound('one');
            expect(one.pause).not.toHaveBeenCalled();
            expect(ah.pausedSoundPositions.one).toBeUndefined();
        });

        it('pauseAllSounds iterates correctly', () => {
            const spy = jest.spyOn(ah, 'pauseSound');
            ah.pauseAllSounds();
            expect(spy).toHaveBeenCalledWith('one');
            expect(spy).toHaveBeenCalledWith('two');
        });
    });

    describe('resumeSound() & resumeAllSounds()', () => {
        let three;
        beforeEach(() => {
            three = { id: 'three', currentTime: 0, duration: 5, paused: true, play: jest.fn(() => { three.paused = false; }), pause: jest.fn() };
            ah.soundsMapping = { three: 'three' };
            ah.sounds = { three };
            ah.pausedSoundPositions['three'] = 2;
        });

        it('resumeSound sets time, plays, and clears stored position', () => {
            ah.resumeSound('three');
            expect(three.currentTime).toBe(2);
            expect(three.play).toHaveBeenCalled();
            expect(ah.pausedSoundPositions.three).toBeUndefined();
        });

        it('resumeSound does nothing if audio.paused is false', () => {
            three.paused = false;
            ah.pausedSoundPositions['three'] = 2;
            ah.resumeSound('three');
            expect(three.play).not.toHaveBeenCalled();
            expect(ah.pausedSoundPositions.three).toBe(2);
        });

        it('resumeSound clears but does not play if storedTime ≥ duration', () => {
            three.paused = true;
            ah.pausedSoundPositions['three'] = 10;
            ah.resumeSound('three');
            expect(three.play).not.toHaveBeenCalled();
            expect(ah.pausedSoundPositions.three).toBeUndefined();
        });

        it('resumeAllSounds iterates correctly', () => {
            const spy = jest.spyOn(ah, 'resumeSound');
            ah.resumeAllSounds();
            expect(spy).toHaveBeenCalledWith('three');
        });

        it('does nothing if no stored position', () => {
            delete ah.pausedSoundPositions['three'];
            ah.resumeSound('three');
            expect(three.play).not.toHaveBeenCalled();
        });
    });

    describe('isPlaying()', () => {
        it('returns false if paused or missing', () => {
            expect(ah.isPlaying('none')).toBe(false);
            ah.sounds.foo = { paused: true };
            expect(ah.isPlaying('foo')).toBe(false);
        });

        it('returns true if audio exists and !paused', () => {
            ah.sounds.bar = { paused: false };
            expect(ah.isPlaying('bar')).toBe(true);
        });
    });

    describe('getSoundsMapping()', () => {
        it('returns the mapping object by reference', () => {
            ah.soundsMapping = { a: 'A' };
            expect(ah.getSoundsMapping()).toBe(ah.soundsMapping);
        });
    });

    describe('fadeOutAndStop()', () => {
        beforeAll(() => jest.useFakeTimers());
        afterAll(() => jest.useRealTimers());

        it('gradually reduces volume, then resets & stops (custom duration)', () => {
            const fake = {
                id: 'fade',
                volume: 1.0,
                duration: 1,
                paused: false,
                play: jest.fn(),
                pause: jest.fn(() => { fake.paused = true; }),
                currentTime: 0,
            };
            ah.soundsMapping = { fade: 'fade' };
            ah.sounds = { fade: fake };

            const spyStop = jest.spyOn(ah, 'stopSound');
            ah.fadeOutAndStop('fade', 300);

            expect(ah.realInitialVolume).toBe(1.0);
            expect(ah.checkRealVolumeOnce).toBe(false);

            jest.advanceTimersByTime(400);

            expect(fake.volume).toBe(1.0);
            expect(ah.checkRealVolumeOnce).toBe(true);
            expect(spyStop).toHaveBeenCalledWith('fade');
        });

        it('uses default duration when none provided', () => {
            const fake = {
                id: 'dfade',
                volume: 0.8,
                duration: 2,
                paused: false,
                play: jest.fn(),
                pause: jest.fn(() => { fake.paused = true; }),
                currentTime: 0,
            };
            ah.soundsMapping = { dfade: 'dfade' };
            ah.sounds = { dfade: fake };

            const spyStop = jest.spyOn(ah, 'stopSound');
            ah.fadeOutAndStop('dfade'); // default 1000ms

            // default interval count = duration/100 = 10 steps
            jest.advanceTimersByTime(1100);

            expect(fake.volume).toBe(0.8);
            expect(spyStop).toHaveBeenCalledWith('dfade');
            expect(ah.checkRealVolumeOnce).toBe(true);
        });

        it('can fade out twice in a row, re-capturing realInitialVolume', () => {
            const fake = {
                id: 'twice',
                volume: 0.5,
                duration: 1,
                paused: false,
                play: jest.fn(),
                pause: jest.fn(() => { fake.paused = true; }),
                currentTime: 0,
            };
            ah.soundsMapping = { twice: 'twice' };
            ah.sounds = { twice: fake };

            // first fade
            ah.fadeOutAndStop('twice', 200);
            jest.advanceTimersByTime(300);
            expect(ah.realInitialVolume).toBe(0.5);
            expect(ah.checkRealVolumeOnce).toBe(true);

            // change volume, then fade again
            fake.volume = 0.9;
            const spyStop = jest.spyOn(ah, 'stopSound');
            ah.fadeOutAndStop('twice', 100);
            jest.advanceTimersByTime(200);

            expect(ah.realInitialVolume).toBe(0.9);
            expect(ah.checkRealVolumeOnce).toBe(true);
            expect(spyStop).toHaveBeenCalledWith('twice');
        });
    });
});

describe('Derived handlers initialize their mappings & sounds', () => {
    const game = {};
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    const handlers = [
        MenuAudioHandler,
        CutsceneDialogueAudioHandler,
        CutsceneSFXAudioHandler,
        CutsceneMusicAudioHandler,
        MapSoundtrackAudioHandler,
        FiredogAudioHandler,
        PowerUpAndDownSFXAudioHandler,
        ExplosionSFXAudioHandler,
        EnemySFXAudioHandler
    ];

    for (const Cls of handlers) {
        it(`${Cls.name} loads every mapping entry`, () => {
            const inst = new Cls(game);
            const map = inst.getSoundsMapping();

            inst.sounds = {};
            for (const key of Object.keys(map)) {
                const el = document.createElement('audio');
                el.id = map[key];
                document.body.appendChild(el);
            }

            inst.initializeSounds();
            expect(Object.keys(inst.sounds)).toEqual(Object.keys(map));
            for (const key of Object.keys(map)) {
                expect(inst.sounds[key].id).toBe(map[key]);
            }
        });
    }
});
