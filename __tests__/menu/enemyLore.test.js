import { EnemyLore } from '../../game/menu/enemyLore.js';
import { isLocalNight } from '../../game/config/timeOfDay.js';

jest.mock('../../game/config/timeOfDay.js', () => ({
    isLocalNight: jest.fn(() => false),
}));

describe('EnemyLore', () => {
    const W = 1920;
    const H = 689;
    let menu, mockGame, ctx;

    beforeAll(() => {
        document.body.innerHTML = `
      <img id="forestmap" />
      <img id="forestmapNight" />
      <img id="enemyLoreBookBackground" width="400" height="300" />
      <img id="enemyLoreLeftPageBackground" />
      <img id="enemyLoreRightPageBackground" />
      <img id="goblinSteal" />
      <img id="dotter" />
      <img id="vertibat" />
      <img id="ghobat" />
      <img id="ravengloom" />
      <img id="meatSoldier" />
      <img id="skulnapSleep" />
      <img id="skulnapAwake" />
      <img id="chiquita" />
      <img id="cactus" />`;
    });

    beforeEach(() => {
        mockGame = {
            width: W,
            height: H,

            map1Unlocked: true,
            map2Unlocked: false,
            map3Unlocked: false,
            map4Unlocked: false,
            map5Unlocked: false,
            map6Unlocked: false,
            map7Unlocked: false,

            bonusMap1Unlocked: false,
            bonusMap2Unlocked: false,
            bonusMap3Unlocked: false,

            audioHandler: {
                menu: {
                    stopSound: jest.fn(),
                    playSound: jest.fn(),
                },
            },
            canvas: {
                width: W,
                height: H,
                getBoundingClientRect: () => ({ left: 0, top: 0, width: W, height: H }),
            },
        };

        ctx = {
            drawImage: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            fillText: jest.fn(),
            strokeText: jest.fn(),
            measureText: jest.fn().mockReturnValue({ width: 10 }),
            beginPath: jest.fn(),
            rect: jest.fn(),
            clip: jest.fn(),

            moveTo: jest.fn(),
            lineTo: jest.fn(),
            quadraticCurveTo: jest.fn(),
            closePath: jest.fn(),
            createLinearGradient: jest.fn().mockReturnValue({
                addColorStop: jest.fn(),
            }),

            fill: jest.fn(),
            stroke: jest.fn(),

            filter: '',
            shadowColor: '',
            shadowBlur: 0,
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            textAlign: '',
        };

        menu = new EnemyLore(mockGame);
        menu.activateMenu();

        jest.clearAllMocks();
        isLocalNight.mockReturnValue(false);
    });

    describe('initialization', () => {
        it('sets up pages and book geometry based on canvas size', () => {
            expect(menu.pages.length).toBeGreaterThan(0);
            expect(menu.pageWidth).toBeCloseTo(W * 0.43, 2);
            expect(menu.pageHeight).toBeCloseTo(H * 0.8, 2);
            expect(menu.bookX).toBeCloseTo((W - 2 * menu.pageWidth) / 2, 2);
            expect(menu.bookY).toBeCloseTo((H - menu.pageHeight) / 2 + 10, 2);
        });
    });

    describe('update()', () => {
        it('stops the soundtrack on each update call', () => {
            menu.update();
            expect(mockGame.audioHandler.menu.stopSound).toHaveBeenCalledWith('soundtrack');
        });
    });

    describe('isNightMode()', () => {
        it('uses forestMap.isNightMode if available on the game menu', () => {
            const forestMapIsNightMode = jest.fn(() => true);
            mockGame.menu = { forestMap: { isNightMode: forestMapIsNightMode } };
            const loreWithMenu = new EnemyLore(mockGame);

            const result = loreWithMenu.isNightMode();

            expect(forestMapIsNightMode).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('falls back to storyNight and clockNight when forestMap is not available', () => {
            // story night: map2 unlocked, map3 locked
            mockGame.map2Unlocked = true;
            mockGame.map3Unlocked = false;
            isLocalNight.mockReturnValue(false);

            const lore = new EnemyLore(mockGame);
            const result = lore.isNightMode();

            expect(result).toBe(true);
        });

        it('returns true when clockNight is true even if storyNight is false', () => {
            mockGame.map2Unlocked = false;
            mockGame.map3Unlocked = false;
            isLocalNight.mockReturnValue(true);

            const lore = new EnemyLore(mockGame);
            const result = lore.isNightMode();

            expect(result).toBe(true);
        });
    });

    describe('paging logic', () => {
        it('nextPage() increments currentPage but never past the last index', () => {
            menu.currentPage = 0;
            menu.nextPage();
            expect(menu.currentPage).toBe(1);

            menu.currentPage = menu.pages.length - 1;
            menu.nextPage();
            expect(menu.currentPage).toBe(menu.pages.length - 1);
        });

        it('previousPage() decrements currentPage but never below 0', () => {
            menu.currentPage = 2;
            menu.previousPage();
            expect(menu.currentPage).toBe(1);

            menu.currentPage = 0;
            menu.previousPage();
            expect(menu.currentPage).toBe(0);
        });

        it('clickNextPage() advances by 2 (mouse click on next page)', () => {
            menu.currentPage = 0;
            menu.clickNextPage();
            expect(menu.currentPage).toBe(2);
        });

        it('clickPreviousPage() retreats by 2 but not below 0', () => {
            menu.currentPage = 3;
            menu.clickPreviousPage();
            expect(menu.currentPage).toBe(1);

            menu.currentPage = 1;
            menu.clickPreviousPage();
            expect(menu.currentPage).toBe(0);
        });

        it('does not advance past the last page with clickNextPage()', () => {
            menu.currentPage = menu.pages.length - 1;
            menu.clickNextPage();
            expect(menu.currentPage).toBe(menu.pages.length - 1);
        });

        it('does not go below page 0 with clickPreviousPage()', () => {
            menu.currentPage = 0;
            menu.clickPreviousPage();
            expect(menu.currentPage).toBe(0);
        });

        it('plays the flip sound when calling nextPage()', () => {
            menu.currentPage = 0;
            menu.nextPage();
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('bookFlip', false, true);
        });

        it('plays the flip sound when calling clickNextPage()', () => {
            menu.currentPage = 0;
            menu.clickNextPage();
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('bookFlip', false, true);
        });

        it('plays the flip sound when calling previousPage()', () => {
            menu.currentPage = 1;
            menu.previousPage();
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('bookFlip', false, true);
        });

        it('plays the flip sound when calling clickPreviousPage()', () => {
            menu.currentPage = 2;
            menu.clickPreviousPage();
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('bookFlip', false, true);
        });
    });

    describe('getMaxValidIndex()', () => {
        it('returns the last even index when the page count is even', () => {
            const evenPages = menu.pages.slice(0, 10);
            menu.pages = evenPages;

            const maxIndex = menu.getMaxValidIndex();
            expect(maxIndex).toBe(evenPages.length - 2);
        });

        it('returns the last index when the page count is odd', () => {
            const oddPages = menu.pages.slice(0, 11);
            menu.pages = oddPages;

            const maxIndex = menu.getMaxValidIndex();
            expect(maxIndex).toBe(oddPages.length - 1);
        });
    });

    describe('category switching (setCategory)', () => {
        it('switches between main and bonus pages and remembers index per category', () => {
            expect(menu.mainPages.length).toBeGreaterThan(0);
            expect(menu.bonusPages.length).toBeGreaterThan(0);

            menu.category = 'main';
            menu.pages = menu.mainPages;
            menu.currentPage = 4;

            menu.setCategory('bonus');
            expect(menu.category).toBe('bonus');
            expect(menu.pages).toBe(menu.bonusPages);
            expect(menu.currentPageMain).toBe(4);

            menu.currentPage = 2;

            menu.setCategory('main');
            expect(menu.category).toBe('main');
            expect(menu.pages).toBe(menu.mainPages);
            expect(menu.currentPageBonus).toBe(2);
            expect(menu.currentPage).toBe(4);
        });

        it('plays flip sound when changing category', () => {
            menu.setCategory('bonus');
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('bookFlip', false, true);
        });

        it('ignores invalid categories and same-category calls', () => {
            const spy = jest.spyOn(mockGame.audioHandler.menu, 'playSound');

            const origCategory = menu.category;
            menu.setCategory('invalid');
            expect(menu.category).toBe(origCategory);
            expect(spy).not.toHaveBeenCalled();

            menu.setCategory(origCategory);
            expect(menu.category).toBe(origCategory);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('input handlers', () => {
        it('handleKeyDown: ArrowRight calls nextPage and ArrowLeft calls previousPage', () => {
            jest.spyOn(menu, 'nextPage');
            jest.spyOn(menu, 'previousPage');

            menu.handleKeyDown({ key: 'ArrowRight' });
            expect(menu.nextPage).toHaveBeenCalled();

            menu.handleKeyDown({ key: 'ArrowLeft' });
            expect(menu.previousPage).toHaveBeenCalled();
        });

        it('handleKeyDown: ArrowUp/ArrowDown delegate to setCategory(main/bonus)', () => {
            jest.spyOn(menu, 'setCategory');

            menu.handleKeyDown({ key: 'ArrowUp' });
            expect(menu.setCategory).toHaveBeenCalledWith('main');

            jest.clearAllMocks();

            menu.handleKeyDown({ key: 'ArrowDown' });
            expect(menu.setCategory).toHaveBeenCalledWith('bonus');
        });

        it('handleMouseWheel: deltaY < 0 calls clickNextPage; deltaY > 0 calls clickPreviousPage', () => {
            jest.spyOn(menu, 'clickNextPage');
            jest.spyOn(menu, 'clickPreviousPage');

            menu.handleMouseWheel({ deltaY: -100 });
            expect(menu.clickNextPage).toHaveBeenCalled();

            menu.handleMouseWheel({ deltaY: 100 });
            expect(menu.clickPreviousPage).toHaveBeenCalled();
        });

        it('handleMouseClick: clicking left page calls clickPreviousPage; clicking right page calls clickNextPage', () => {
            jest.spyOn(menu, 'clickPreviousPage');
            jest.spyOn(menu, 'clickNextPage');
            const insideY = menu.bookY + 10;

            // left page
            menu.handleMouseClick({ clientX: menu.bookX + 10, clientY: insideY });
            expect(menu.clickPreviousPage).toHaveBeenCalled();

            jest.clearAllMocks();

            // right page
            menu.handleMouseClick({
                clientX: menu.bookX + menu.pageWidth + 10,
                clientY: insideY,
            });
            expect(menu.clickNextPage).toHaveBeenCalled();
        });

        it('clicking main/bonus tabs calls setCategory but does not flip pages', () => {
            menu.menuActive = true;
            jest.spyOn(menu, 'setCategory');
            jest.spyOn(menu, 'clickNextPage');
            jest.spyOn(menu, 'clickPreviousPage');

            const mainTab = menu.getMainTabBounds();
            const bonusTab = menu.getBonusTabBounds();

            menu.handleMouseClick({
                clientX: mainTab.x + 5,
                clientY: mainTab.y + 5,
            });
            expect(menu.setCategory).toHaveBeenCalledWith('main');

            jest.clearAllMocks();

            menu.handleMouseClick({
                clientX: bonusTab.x + 5,
                clientY: bonusTab.y + 5,
            });
            expect(menu.setCategory).toHaveBeenCalledWith('bonus');

            expect(menu.clickNextPage).not.toHaveBeenCalled();
            expect(menu.clickPreviousPage).not.toHaveBeenCalled();
        });

        it('does not respond to key, wheel, or click input when menuActive is false', () => {
            menu.menuActive = false;
            jest.spyOn(menu, 'nextPage');
            jest.spyOn(menu, 'previousPage');
            jest.spyOn(menu, 'clickNextPage');
            jest.spyOn(menu, 'clickPreviousPage');

            menu.handleKeyDown({ key: 'ArrowRight' });
            menu.handleMouseWheel({ deltaY: -1 });
            menu.handleMouseClick({ clientX: 0, clientY: 0 });

            expect(menu.nextPage).not.toHaveBeenCalled();
            expect(menu.previousPage).not.toHaveBeenCalled();
            expect(menu.clickNextPage).not.toHaveBeenCalled();
            expect(menu.clickPreviousPage).not.toHaveBeenCalled();
        });

        it('does not flip pages on mouse move', () => {
            menu.menuActive = true;
            jest.spyOn(menu, 'nextPage');
            jest.spyOn(menu, 'previousPage');
            jest.spyOn(menu, 'clickNextPage');
            jest.spyOn(menu, 'clickPreviousPage');

            menu.handleMouseMove({ clientX: 100, clientY: 100 });
            expect(menu.nextPage).not.toHaveBeenCalled();
            expect(menu.previousPage).not.toHaveBeenCalled();
            expect(menu.clickNextPage).not.toHaveBeenCalled();
            expect(menu.clickPreviousPage).not.toHaveBeenCalled();
        });

        it('does not flip pages when clicking completely outside the book area', () => {
            const spyNext = jest.spyOn(menu, 'clickNextPage');
            const spyPrev = jest.spyOn(menu, 'clickPreviousPage');

            menu.handleMouseClick({ clientX: menu.bookX - 50, clientY: menu.bookY - 50 });
            menu.handleMouseClick({
                clientX: menu.bookX + menu.pageWidth * 2 + 50,
                clientY: menu.bookY + menu.pageHeight + 50,
            });

            expect(spyNext).not.toHaveBeenCalled();
            expect(spyPrev).not.toHaveBeenCalled();
        });
    });

    describe('draw()', () => {
        it('does nothing when menuActive is false', () => {
            menu.menuActive = false;
            menu.draw(ctx);
            expect(ctx.drawImage).not.toHaveBeenCalled();
        });

        it('stops the soundtrack when drawing', () => {
            menu.menuActive = true;
            menu.draw(ctx);
            expect(mockGame.audioHandler.menu.stopSound)
                .toHaveBeenCalledWith('soundtrack');
        });

        it('draws day background when storyNight and clockNight are both false', () => {
            mockGame.map2Unlocked = false;
            mockGame.map3Unlocked = false;
            isLocalNight.mockReturnValue(false);
            menu.menuActive = true;

            menu.draw(ctx);

            expect(ctx.drawImage).toHaveBeenCalledWith(
                menu.backgroundImage,
                0,
                0,
                W,
                H
            );
        });

        it('draws night background when map2Unlocked is true and map3Unlocked is false (story night)', () => {
            mockGame.map2Unlocked = true;
            mockGame.map3Unlocked = false;
            isLocalNight.mockReturnValue(false);
            menu.menuActive = true;

            menu.draw(ctx);

            expect(ctx.drawImage).toHaveBeenCalledWith(
                menu.backgroundImageNight,
                0,
                0,
                W,
                H
            );
        });

        it('draws day background when both map2Unlocked and map3Unlocked are true (story night off)', () => {
            mockGame.map2Unlocked = true;
            mockGame.map3Unlocked = true;
            isLocalNight.mockReturnValue(false);
            menu.menuActive = true;

            menu.draw(ctx);

            expect(ctx.drawImage).toHaveBeenCalledWith(
                menu.backgroundImage,
                0,
                0,
                W,
                H
            );
        });

        it('draws the book frame and both pages content', () => {
            mockGame.map2Unlocked = false;
            menu.menuActive = true;
            jest.spyOn(menu, 'drawPageContent');

            menu.draw(ctx);

            expect(menu.drawPageContent).toHaveBeenCalledTimes(2);

            expect(ctx.drawImage).toHaveBeenCalledWith(
                menu.enemyLoreBookBackground,
                expect.any(Number),
                expect.any(Number)
            );
            expect(ctx.drawImage).toHaveBeenCalledWith(
                menu.leftPageBackground,
                menu.bookX,
                menu.bookY,
                menu.pageWidth,
                menu.pageHeight
            );
            expect(ctx.drawImage).toHaveBeenCalledWith(
                menu.rightPageBackground,
                menu.bookX + menu.pageWidth,
                menu.bookY,
                menu.pageWidth,
                menu.pageHeight
            );
        });
    });

    describe('drawPageContent()', () => {
        it('renders locked placeholders when the page is locked', () => {
            menu.drawPageContent(ctx, 9, 0, 0);
            const texts = ctx.fillText.mock.calls.map(call => call[0]);
            expect(texts).toEqual([
                'NAME: ???',
                'TYPE: ??? & ???',
                'FOUND AT: ???',
                'DESCRIPTION: ???',
            ]);
        });

        it('applies phraseColors styling on unlocked pages', () => {
            mockGame.map2Unlocked = true;
            const records = [];
            ctx.strokeText = (text, x, y) => {
                records.push({ text, shadowColor: ctx.shadowColor, shadowBlur: ctx.shadowBlur });
            };

            menu.drawPageContent(ctx, 0, 0, 0);

            const entry = records.find(r => r.text === 'EVERYWHERE');
            expect(entry).toBeDefined();
            expect(entry.shadowColor).toBe('white');
            expect(entry.shadowBlur).toBe(5);
        });

        it('blurs images when the page is locked', () => {
            menu.drawPageContent(ctx, 9, 0, 0);
            expect(ctx.filter).toBe('blur(15px)');
        });
    });

    describe('pages data', () => {
        it('contains CHIQUITA page with correct metadata and image', () => {
            const chiquita = menu.pages.find(p => p.name === 'CHIQUITA');
            expect(chiquita).toBeDefined();
            expect(chiquita).toMatchObject({
                type: 'FLY & NORMAL',
                foundAt: 'VERDANT VINE',
            });
            expect(chiquita.images[0].enemyImage.id).toBe('chiquita');
        });

        it('stores the full CHIQUITA description exactly', () => {
            const chiquita = menu.pages.find(p => p.name === 'CHIQUITA');
            expect(chiquita.description).toBe(
                'CHIQUITA IS A DELIGHTFUL AND FRIENDLY BIRD WHO LOVES TO EXPLORE THE SKIES.\n' +
                'HER PEACEFUL FLIGHTS ARE A SIGHT TO BEHOLD, AS SHE GLIDES EFFORTLESSLY AND GRACEFULLY.\n' +
                'WITH A CHEERFUL CHIRP AND A GENTLE HEART, CHIQUITA BRINGS JOY AND TRANQUILITY TO EVERYONE SHE MEETS.'
            );
        });
    });

    describe('page-number rendering in draw()', () => {
        it('draws the current and next page numbers with correct alignment and positions', () => {
            menu.currentPage = 2;
            menu.menuActive = true;

            const calls = [];
            ctx.fillText = (text, x, y) => {
                calls.push({ text: String(text), x, y, align: ctx.textAlign });
            };

            menu.draw(ctx);

            const left = calls.find(c => c.text === '3');
            expect(left).toBeDefined();
            expect(left.align).toBe('left');
            expect(left.x).toBeCloseTo(menu.bookX + 10, 1);

            const right = calls.find(c => c.text === '4');
            expect(right).toBeDefined();
            expect(right.align).toBe('right');
            expect(right.x).toBeCloseTo(menu.bookX + menu.pageWidth * 2 - 10, 1);
        });
    });

    describe('createPage helper', () => {
        it('routes main and bonus categories into the correct arrays', () => {
            const beforeMain = menu.mainPages.length;
            const beforeBonus = menu.bonusPages.length;

            menu.createPage('TEST_MAIN', 'TYPE', 'WHERE', 'DESC', [], null, 'main');
            menu.createPage('TEST_BONUS', 'TYPE', 'WHERE', 'DESC', [], null, 'bonus');

            expect(menu.mainPages.length).toBe(beforeMain + 1);
            expect(menu.bonusPages.length).toBe(beforeBonus + 1);

            const mainEntry = menu.mainPages.find(p => p.name === 'TEST_MAIN');
            const bonusEntry = menu.bonusPages.find(p => p.name === 'TEST_BONUS');

            expect(mainEntry).toBeDefined();
            expect(bonusEntry).toBeDefined();
        });
    });

    describe('createImage helper', () => {
        it('returns an object with correct properties', () => {
            const imgObj = menu.createImage(
                'goblin',
                16,
                32,
                2,
                100,
                150,
                1.5,
                'stun'
            );
            expect(imgObj.enemyImage).toBe(document.getElementById('goblin'));
            expect(imgObj.frameWidth).toBe(16);
            expect(imgObj.frameHeight).toBe(32);
            expect(imgObj.enemyFrame).toBe(2);
            expect(imgObj.enemyX).toBe(100);
            expect(imgObj.enemyY).toBe(150);
            expect(imgObj.size).toBe(1.5);
            expect(imgObj.type).toBe('stun');
        });
    });

    describe('phraseColors styling for every keyword (main maps)', () => {
        const cases = [
            ['EVERYWHERE', 0, [], 'white', 5],
            ['LUNAR', 1, [], 'green', 5],
            ['NIGHTFALL', 9, ['map2Unlocked'], 'black', 5],
            ['CORAL', 15, ['map2Unlocked', 'map3Unlocked'], 'darkblue', 5],
            ['VERDANT', 22, ['map2Unlocked', 'map3Unlocked', 'map4Unlocked'], 'black', 15],
            ['SPRINGLY', 30, ['map2Unlocked', 'map3Unlocked', 'map4Unlocked', 'map5Unlocked'], 'orange', 5],
            ['VENOMVEIL', 41, ['map2Unlocked', 'map3Unlocked', 'map4Unlocked', 'map5Unlocked', 'map6Unlocked'], '#003b00', 10],
            ['INFERNAL', 42, ['map2Unlocked', 'map3Unlocked', 'map4Unlocked', 'map5Unlocked', 'map6Unlocked', 'map7Unlocked'], 'black', 10],

            ['RED', 17, ['map2Unlocked', 'map3Unlocked'], 'black', 1],
            ['STUN', 6, [], 'black', 1],
        ];

        test.each(cases)(
            '"%s" on main page %i with flags %j sets stroke=%s blur=%i',
            (phrase, pageIndex, flags, stroke, blur) => {
                flags.forEach(f => {
                    mockGame[f] = true;
                });

                const rec = [];
                ctx.strokeText = (t, x, y) =>
                    rec.push({
                        text: String(t).trim(),
                        strokeColor: ctx.shadowColor,
                        shadowBlur: ctx.shadowBlur,
                    });

                menu.drawPageContent(ctx, pageIndex, 0, 0);
                const hit = rec.find(r => r.text === phrase);
                expect(hit).toBeDefined();
                expect(hit.strokeColor).toBe(stroke);
                expect(hit.shadowBlur).toBe(blur);
            }
        );
    });

    describe('phraseColors styling for bonus-map keywords', () => {
        const bonusCases = [
            ['ICEBOUND', 0, ['bonusMap1Unlocked'], '#1c4a7f', 10],
            ['COSMIC', 1, ['bonusMap2Unlocked'], '#270033', 10],
            ['CRIMSON', 2, ['bonusMap3Unlocked'], '#5a1408', 10],
        ];

        test.each(bonusCases)(
            '"%s" on bonus page %i with flags %j sets stroke=%s blur=%i',
            (token, pageIndex, flags, stroke, blur) => {
                flags.forEach(f => {
                    mockGame[f] = true;
                });
                menu.setCategory('bonus');

                const rec = [];
                ctx.strokeText = (t, x, y) =>
                    rec.push({
                        text: String(t).trim(),
                        strokeColor: ctx.shadowColor,
                        shadowBlur: ctx.shadowBlur,
                    });

                menu.drawPageContent(ctx, pageIndex, 0, 0);

                const hit = rec.find(r => r.text === token);
                expect(hit).toBeDefined();
                expect(hit.strokeColor).toBe(stroke);
                expect(hit.shadowBlur).toBe(blur);
            }
        );
    });

    describe('highlightPhrases config', () => {
        it('stores multi-word phrases with their word sequence and style', () => {
            const cosmicStyle = menu.phraseColors['COSMIC RIFT'];
            expect(cosmicStyle).toBeDefined();

            const entry = menu.highlightPhrases.find(p => p.phrase === 'COSMIC RIFT');
            expect(entry).toBeDefined();
            expect(entry.words).toEqual(['COSMIC', 'RIFT']);
            expect(entry.style).toBe(cosmicStyle);
        });
    });

    describe('multi-word phrase styling across line breaks', () => {
        it('styles both parts of a phrase even when separated by a newline', () => {
            const cosmicStyle = menu.phraseColors['COSMIC RIFT'];

            const pageIndex = menu.pages.length;
            menu.createPage(
                'TEST ENEMY',
                'TEST TYPE',
                'COSMIC RIFT',
                'COSMIC\nRIFT',
                [],
                null,
                'main'
            );

            const records = [];
            ctx.strokeText = (text, x, y) => {
                records.push({
                    text: String(text),
                    shadowColor: ctx.shadowColor,
                    shadowBlur: ctx.shadowBlur,
                });
            };

            menu.drawPageContent(ctx, pageIndex, 0, 0);

            const cosmic = records.find(r => r.text === 'COSMIC');
            const rift = records.find(r => r.text === 'RIFT');

            expect(cosmic).toBeDefined();
            expect(cosmic.shadowColor).toBe(cosmicStyle.stroke);
            expect(cosmic.shadowBlur).toBe(cosmicStyle.strokeBlur);

            expect(rift).toBeDefined();
            expect(rift.shadowColor).toBe(cosmicStyle.stroke);
            expect(rift.shadowBlur).toBe(cosmicStyle.strokeBlur);
        });
    });

    describe('standalone words vs full phrases', () => {
        it('does not style standalone COSMIC but styles COSMIC as part of COSMIC RIFT', () => {
            mockGame.bonusMap2Unlocked = true;
            menu.setCategory('bonus');

            const records = [];
            ctx.strokeText = (text, x, y) => {
                records.push({
                    text: String(text),
                    shadowColor: ctx.shadowColor,
                    shadowBlur: ctx.shadowBlur,
                });
            };

            menu.drawPageContent(ctx, 1, 0, 0);

            const cosmicEntries = records.filter(r => r.text === 'COSMIC');
            expect(cosmicEntries.length).toBeGreaterThan(0);

            expect(
                cosmicEntries.some(e => e.shadowColor === 'transparent' || e.shadowBlur === 0)
            ).toBe(true);

            expect(
                cosmicEntries.some(e => e.shadowColor === '#270033' && e.shadowBlur === 10)
            ).toBe(true);
        });

        it('does not style a phrase word when the full phrase is not present', () => {
            const pageIndex = menu.pages.length;
            menu.createPage(
                'TEST ENEMY 2',
                'TEST TYPE',
                'NOWHERE',
                'RIFT',
                [],
                null,
                'main'
            );

            const records = [];
            ctx.strokeText = (text, x, y) => {
                records.push({
                    text: String(text),
                    shadowColor: ctx.shadowColor,
                    shadowBlur: ctx.shadowBlur,
                });
            };

            menu.drawPageContent(ctx, pageIndex, 0, 0);

            const rift = records.find(r => r.text === 'RIFT');
            expect(rift).toBeDefined();
            expect(rift.shadowColor).toBe('transparent');
            expect(rift.shadowBlur).toBe(0);
        });
    });
});
