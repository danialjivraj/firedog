import {
    AudioHandler,
    MenuAudioHandler,
    CutsceneDialogueAudioHandler,
    CutsceneSFXAudioHandler,
    CutsceneMusicAudioHandler,
    MapSoundtrackAudioHandler,
    FiredogAudioHandler,
    PowerUpAndDownSFXAudioHandler,
    CollisionSFXAudioHandler,
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
        ah._state = {};
    });

    describe('_loadSound()', () => {
        it('returns audio element, registers `ended` listener, and clears stored position on end', () => {
            const audioEl = document.createElement('audio');
            audioEl.id = 'foo';
            document.body.appendChild(audioEl);

            const spyAdd = jest.spyOn(audioEl, 'addEventListener');
            ah.soundsMapping = { foo: 'foo' };

            ah._state.foo = { pausedAt: 5 };
            const loaded = ah._loadSound('foo');
            expect(loaded).toBe(audioEl);
            expect(spyAdd).toHaveBeenCalledWith('ended', expect.any(Function));

            const handler = spyAdd.mock.calls[0][1];
            handler();
            expect(ah._state.foo?.pausedAt).toBeUndefined();
        });

        it('logs error and returns null if audio element is missing', () => {
            ah.soundsMapping = { missing: 'no-such-id' };
            const res = ah._loadSound('missing');
            expect(res).toBeNull();
            expect(console.error).toHaveBeenCalledWith(
                "Audio element with ID 'no-such-id' not found."
            );
        });
    });

    describe('playSound()', () => {
        let fake;

        beforeEach(() => {
            fake = {
                currentTime: 5,
                loop: false,
                paused: true,
                playbackRate: 1,
                play: jest.fn(() => { fake.paused = false; }),
                pause: jest.fn(),
            };
            ah.sounds = { bar: fake };
        });

        it('sets loop, calls play, and returns the element', () => {
            const ret = ah.playSound('bar', true, false);
            expect(fake.loop).toBe(true);
            expect(fake.play).toHaveBeenCalled();
            expect(ret).toBe(fake);
        });

        it('when currentTimeZero=true and loop=false, resets time and plays without pausing first', () => {
            fake.currentTime = 5;
            ah.playSound('bar', false, true);
            expect(fake.pause).not.toHaveBeenCalled();
            expect(fake.currentTime).toBe(0);
            expect(fake.play).toHaveBeenCalled();
        });

        it('when currentTimeZero=true and loop=true, resets time without pausing first, then plays', () => {
            ah.playSound('bar', true, true);
            expect(fake.pause).not.toHaveBeenCalled();
            expect(fake.currentTime).toBe(0);
            expect(fake.loop).toBe(true);
            expect(fake.play).toHaveBeenCalled();
        });

        it('sets playbackRate from opts', () => {
            ah.playSound('bar', false, false, { playbackRate: 1.5 });
            expect(fake.playbackRate).toBe(1.5);
            expect(fake.play).toHaveBeenCalled();
        });

        it('swallows play() promise rejections (does not throw)', async () => {
            const rejecting = {
                currentTime: 0,
                loop: false,
                paused: true,
                playbackRate: 1,
                play: jest.fn(() => Promise.reject(new Error('autoplay blocked'))),
                pause: jest.fn(),
            };
            ah.sounds = { rej: rejecting };

            expect(() => ah.playSound('rej', false, false)).not.toThrow();

            await Promise.resolve();
            expect(rejecting.play).toHaveBeenCalled();
        });

        it('returns null for unknown soundName', () => {
            expect(ah.playSound('nope')).toBeNull();
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
            ah._state.baz = { pausedAt: 123 };
        });

        it('stopSound pauses audio, resets time to 0, and clears stored state', () => {
            ah.stopSound('baz');
            expect(fake.pause).toHaveBeenCalled();
            expect(fake.currentTime).toBe(0);
            expect(ah._state.baz).toBeUndefined();
        });

        it('stopSound clears state keyed by soundName', () => {
            const audio = {
                id: 'track1',
                currentTime: 7,
                paused: false,
                play: jest.fn(),
                pause: jest.fn(() => { audio.paused = true; }),
            };
            ah.soundsMapping = { music: 'track1' };
            ah.sounds = { music: audio };
            ah._state.music = { pausedAt: 3 };

            ah.stopSound('music');
            expect(ah._state.music).toBeUndefined();
        });

        it('stopSound clears an active fade interval for that sound', () => {
            ah._state.baz = { fadeIntervalId: 12345 };
            const clearSpy = jest.spyOn(global, 'clearInterval');

            ah.stopSound('baz');

            expect(clearSpy).toHaveBeenCalledWith(12345);
            expect(ah._state.baz?.fadeIntervalId).toBeUndefined();
        });

        it('stopSound restores originalVolume from saved state when stopping a fading sound', () => {
            fake.volume = 0.3;
            ah._state.baz = { originalVolume: 0.8 };

            ah.stopSound('baz');

            expect(fake.volume).toBe(0.8);
        });

        it('stopSound does nothing (and does not throw) when audio is missing', () => {
            expect(() => ah.stopSound('missing')).not.toThrow();
        });

        it('stopAllSounds calls stopSound for each sound in the mapping', () => {
            const spy = jest.spyOn(ah, 'stopSound');
            ah.stopAllSounds();
            expect(spy).toHaveBeenCalledWith('baz');
        });
    });

    describe('pauseSound() & pauseAllSounds()', () => {
        let one, two;

        beforeEach(() => {
            one = {
                id: 'one',
                currentTime: 1,
                paused: false,
                pause: jest.fn(() => { one.paused = true; }),
                play: jest.fn(),
            };
            two = {
                id: 'two',
                currentTime: 2,
                paused: false,
                pause: jest.fn(() => { two.paused = true; }),
                play: jest.fn(),
            };
            ah.soundsMapping = { one: 'one', two: 'two' };
            ah.sounds = { one, two };
        });

        it('pauseSound pauses audio and stores currentTime in _state when not already paused', () => {
            ah.pauseSound('one');
            expect(one.pause).toHaveBeenCalled();
            expect(ah._state.one.pausedAt).toBe(1);
        });

        it('pauseSound clears an active fade interval before pausing', () => {
            ah._state.one = { fadeIntervalId: 9876 };
            const clearSpy = jest.spyOn(global, 'clearInterval');

            ah.pauseSound('one');

            expect(clearSpy).toHaveBeenCalledWith(9876);
            expect(ah._state.one?.fadeIntervalId).toBeUndefined();
            expect(one.pause).toHaveBeenCalled();
            expect(ah._state.one.pausedAt).toBe(1);
        });

        it('pauseSound does nothing when audio is already paused', () => {
            one.paused = true;
            ah.pauseSound('one');
            expect(one.pause).not.toHaveBeenCalled();
            expect(ah._state.one?.pausedAt).toBeUndefined();
        });

        it('pauseSound does nothing (and does not throw) when audio is missing', () => {
            expect(() => ah.pauseSound('missing')).not.toThrow();
        });

        it('pauseAllSounds calls pauseSound for each sound in the mapping', () => {
            const spy = jest.spyOn(ah, 'pauseSound');
            ah.pauseAllSounds();
            expect(spy).toHaveBeenCalledWith('one');
            expect(spy).toHaveBeenCalledWith('two');
        });
    });

    describe('resumeSound() & resumeAllSounds()', () => {
        let three;

        beforeEach(() => {
            three = {
                id: 'three',
                currentTime: 0,
                duration: 5,
                loop: false,
                paused: true,
                play: jest.fn(() => { three.paused = false; }),
                pause: jest.fn(),
            };
            ah.soundsMapping = { three: 'three' };
            ah.sounds = { three };
            ah._state.three = { pausedAt: 2 };
        });

        it('resumeSound seeks to storedTime, plays, and clears stored position when paused and within duration', () => {
            ah.resumeSound('three');
            expect(three.currentTime).toBe(2);
            expect(three.play).toHaveBeenCalled();
            expect(ah._state.three?.pausedAt).toBeUndefined();
        });

        it('resumeSound does nothing when audio is not paused', () => {
            three.paused = false;
            ah._state.three = { pausedAt: 2 };
            ah.resumeSound('three');
            expect(three.play).not.toHaveBeenCalled();
            expect(ah._state.three?.pausedAt).toBe(2);
        });

        it('resumeSound clears stored position but does not play when storedTime >= duration', () => {
            three.paused = true;
            ah._state.three = { pausedAt: 10 };
            ah.resumeSound('three');
            expect(three.play).not.toHaveBeenCalled();
            expect(ah._state.three?.pausedAt).toBeUndefined();
        });

        it('resumeAllSounds calls resumeSound for each sound in the mapping', () => {
            const spy = jest.spyOn(ah, 'resumeSound');
            ah.resumeAllSounds();
            expect(spy).toHaveBeenCalledWith('three');
        });

        it('resumeSound does nothing when there is no stored position', () => {
            delete ah._state.three;
            ah.resumeSound('three');
            expect(three.play).not.toHaveBeenCalled();
        });

        it('resumeSound plays non-looped sounds paused at or after 0.02s', () => {
            three.paused = true;
            three.loop = false;
            ah._state.three = { pausedAt: 0.05 };
            ah.resumeSound('three');
            expect(three.currentTime).toBe(0.05);
            expect(three.play).toHaveBeenCalled();
        });

        it('resumeSound plays looped sounds even when pausedAt is below 0.02', () => {
            three.paused = true;
            three.loop = true;
            ah._state.three = { pausedAt: 0 };
            ah.resumeSound('three');
            expect(three.play).toHaveBeenCalled();
        });

        it('resumeSound clears stored position but does not play when duration is NaN', () => {
            three.paused = true;
            three.duration = Number.NaN;
            ah._state.three = { pausedAt: 1 };
            ah.resumeSound('three');
            expect(three.play).not.toHaveBeenCalled();
            expect(ah._state.three?.pausedAt).toBeUndefined();
        });

        it('resumeSound does nothing (and does not throw) when audio is missing', () => {
            expect(() => ah.resumeSound('missing')).not.toThrow();
        });

        it('restarts an interrupted fade after pausing and resuming a sound', () => {
            jest.useFakeTimers();

            const three = {
                id: 'three',
                currentTime: 1.0,
                duration: 5,
                loop: false,
                paused: false,
                volume: 1,
                pause: jest.fn(() => { three.paused = true; }),
                play: jest.fn(() => { three.paused = false; }),
            };

            ah.soundsMapping = { three: 'three' };
            ah.sounds = { three };
            ah._state = {};

            const fadeSpy = jest.spyOn(ah, 'fadeOutAndStop');

            ah.fadeOutAndStop('three', 300);

            jest.advanceTimersByTime(100);
            const volumeBeforePause = three.volume;

            ah.pauseSound('three');

            expect(three.pause).toHaveBeenCalled();
            expect(ah._state.three.resumeFade).toBe(true);
            expect(ah._state.three?.fadeIntervalId).toBeUndefined();
            expect(ah._state.three.pausedAt).toBe(three.currentTime);
            expect(three.volume).toBe(volumeBeforePause);

            ah.resumeSound('three');

            expect(three.play).toHaveBeenCalled();
            expect(ah._state.three?.pausedAt).toBeUndefined();
            expect(fadeSpy).toHaveBeenCalledTimes(2);
            expect(fadeSpy).toHaveBeenLastCalledWith('three');

            jest.advanceTimersByTime(1100);

            expect(three.paused).toBe(true);
            expect(three.currentTime).toBe(0);
            expect(three.volume).toBe(1);
            expect(ah._state.three?.fadeIntervalId).toBeUndefined();

            jest.useRealTimers();
        });
    });

    describe('_clearFade()', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('clears and removes the stored interval when one exists', () => {
            const intervalId = setInterval(() => { }, 1000);
            ah._state.fade = { fadeIntervalId: intervalId };
            const clearSpy = jest.spyOn(global, 'clearInterval');

            ah._clearFade('fade');

            expect(clearSpy).toHaveBeenCalledWith(intervalId);
            expect(ah._state.fade?.fadeIntervalId).toBeUndefined();
        });

        it('does nothing when no interval exists for that sound', () => {
            const clearSpy = jest.spyOn(global, 'clearInterval');

            ah._clearFade('missing');

            expect(clearSpy).not.toHaveBeenCalled();
        });

        it('sets resumeFade flag when keepPausedFlag=true', () => {
            const intervalId = setInterval(() => { }, 1000);
            ah._state.fade = { fadeIntervalId: intervalId };

            ah._clearFade('fade', true);

            expect(ah._state.fade.resumeFade).toBe(true);
        });
    });

    describe('fadeOutAndStop()', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('returns immediately when sound does not exist', () => {
            expect(() => ah.fadeOutAndStop('nonexistent', 300)).not.toThrow();
            expect(ah._state.nonexistent?.fadeIntervalId).toBeUndefined();
        });

        it('returns immediately when sound is already paused', () => {
            const fake = {
                id: 'pausedFade',
                volume: 1,
                paused: true,
                pause: jest.fn(),
                play: jest.fn(),
                currentTime: 0,
            };
            ah.soundsMapping = { pausedFade: 'pausedFade' };
            ah.sounds = { pausedFade: fake };

            ah.fadeOutAndStop('pausedFade', 300);

            expect(ah._state.pausedFade?.fadeIntervalId).toBeUndefined();
            expect(fake.pause).not.toHaveBeenCalled();
        });

        it('stores originalVolume in _state and fades sound out until stopped', () => {
            const fake = {
                id: 'fade',
                volume: 1.0,
                paused: false,
                pause: jest.fn(() => { fake.paused = true; }),
                play: jest.fn(),
                currentTime: 7,
            };
            ah.soundsMapping = { fade: 'fade' };
            ah.sounds = { fade: fake };
            ah._state.fade = { pausedAt: 99 };

            ah.fadeOutAndStop('fade', 300);

            expect(ah._state.fade.originalVolume).toBe(1);
            expect(ah._state.fade.fadeIntervalId).toBeDefined();

            jest.advanceTimersByTime(400);

            expect(fake.pause).toHaveBeenCalled();
            expect(fake.currentTime).toBe(0);
            expect(fake.volume).toBe(1.0);
            expect(ah._state.fade).toBeUndefined();
            expect(fake.paused).toBe(true);
        });

        it('preserves existing originalVolume in _state if already set', () => {
            const fake = {
                id: 'fade2',
                volume: 0.4,
                paused: false,
                pause: jest.fn(() => { fake.paused = true; }),
                play: jest.fn(),
                currentTime: 3,
            };
            ah.soundsMapping = { fade2: 'fade2' };
            ah.sounds = { fade2: fake };
            ah._state.fade2 = { originalVolume: 0.9 };

            ah.fadeOutAndStop('fade2', 200);
            jest.advanceTimersByTime(300);

            expect(fake.volume).toBe(0.9);
            expect(fake.pause).toHaveBeenCalled();
            expect(ah._state.fade2?.fadeIntervalId).toBeUndefined();
        });

        it('stops immediately and restores originalVolume when startVolume is 0', () => {
            const fake = {
                id: 'zeroFade',
                volume: 0,
                paused: false,
                pause: jest.fn(() => { fake.paused = true; }),
                play: jest.fn(),
                currentTime: 8,
            };
            ah.soundsMapping = { zeroFade: 'zeroFade' };
            ah.sounds = { zeroFade: fake };

            const stopSpy = jest.spyOn(ah, 'stopSound');

            ah.fadeOutAndStop('zeroFade', 300);

            expect(stopSpy).toHaveBeenCalledWith('zeroFade');
            expect(fake.volume).toBe(0);
            expect(ah._state.zeroFade?.fadeIntervalId).toBeUndefined();
        });

        it('clears any previous fade interval before starting a new fade', () => {
            const fake = {
                id: 'again',
                volume: 1,
                paused: false,
                pause: jest.fn(() => { fake.paused = true; }),
                play: jest.fn(),
                currentTime: 0,
            };
            ah.soundsMapping = { again: 'again' };
            ah.sounds = { again: fake };

            ah._state.again = { fadeIntervalId: 54321 };
            const clearSpy = jest.spyOn(global, 'clearInterval');

            ah.fadeOutAndStop('again', 200);

            expect(clearSpy).toHaveBeenCalledWith(54321);
            expect(ah._state.again?.fadeIntervalId).toBeDefined();
        });
    });

    describe('fadeOutAndStopAllSounds()', () => {
        it('calls fadeOutAndStop only for sounds that exist and are not paused', () => {
            const one = {
                id: 'one',
                paused: false,
                volume: 1,
                currentTime: 0,
                pause: jest.fn(),
                play: jest.fn(),
            };
            const two = {
                id: 'two',
                paused: true,
                volume: 1,
                currentTime: 0,
                pause: jest.fn(),
                play: jest.fn(),
            };

            ah.soundsMapping = { one: 'one', two: 'two', three: 'three' };
            ah.sounds = { one, two };

            const spy = jest.spyOn(ah, 'fadeOutAndStop');

            ah.fadeOutAndStopAllSounds(300);

            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith('one', 300);
            expect(spy).not.toHaveBeenCalledWith('two', 300);
            expect(spy).not.toHaveBeenCalledWith('three', 300);
        });

        it('uses default duration when none is provided', () => {
            const one = {
                id: 'one',
                paused: false,
                volume: 1,
                currentTime: 0,
                pause: jest.fn(),
                play: jest.fn(),
            };

            ah.soundsMapping = { one: 'one' };
            ah.sounds = { one };

            const spy = jest.spyOn(ah, 'fadeOutAndStop');

            ah.fadeOutAndStopAllSounds();

            expect(spy).toHaveBeenCalledWith('one', 1000);
        });
    });

    describe('isPlaying()', () => {
        it('returns false when sound is missing or paused', () => {
            expect(ah.isPlaying('none')).toBe(false);
            ah.sounds.foo = { paused: true };
            expect(ah.isPlaying('foo')).toBe(false);
        });

        it('returns true when audio exists and is not paused', () => {
            ah.sounds.bar = { paused: false };
            expect(ah.isPlaying('bar')).toBe(true);
        });
    });

    describe('getSoundsMapping()', () => {
        it('returns the soundsMapping object by reference', () => {
            ah.soundsMapping = { a: 'A' };
            expect(ah.getSoundsMapping()).toBe(ah.soundsMapping);
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
        CollisionSFXAudioHandler,
        EnemySFXAudioHandler
    ];

    for (const Cls of handlers) {
        it(`${Cls.name} loads every mapping entry via initializeSounds`, () => {
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
