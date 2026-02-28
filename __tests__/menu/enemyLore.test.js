import { EnemyLore } from '../../game/menu/enemyLore.js';
import { isLocalNight } from '../../game/config/timeOfDay.js';

jest.mock('../../game/config/timeOfDay.js', () => ({
    isLocalNight: jest.fn(() => false),
}));

describe('EnemyLore', () => {
    const W = 1920;
    const H = 689;
    let menu, mockGame, ctx;

    const getPageIndex = (predicate) => {
        const i = menu.pages.findIndex(predicate);
        if (i === -1) throw new Error('Test setup error: page not found');
        return i;
    };

    const getEnemyPageIndexByName = (name) =>
        getPageIndex(p => p?.pageKind === 'enemy' && p?.name === name);

    const getEnemyPageIndexByMapKey = (mapKey) =>
        getPageIndex(p => p?.pageKind === 'enemy' && p?.mapKey === mapKey);

    const getCoverPageIndexByMapKey = (mapKey) =>
        getPageIndex(p => p?.pageKind === 'cover' && p?.mapKey === mapKey);

    beforeAll(() => {
        document.body.innerHTML = `
            <img id="forestmap" />
            <img id="forestmapNight" />

            <img id="enemyLoreBookBackground" width="400" height="300" />
            <img id="enemyLoreLeftPageBackground" />
            <img id="enemyLoreRightPageBackground" />

            <!-- Covers -->
            <img id="map1Cover" />
            <img id="map2Cover" />
            <img id="map3Cover" />
            <img id="map4Cover" />
            <img id="map5Cover" />
            <img id="map6Cover" />
            <img id="map7Cover" />
            <img id="bonusMap1Cover" />
            <img id="bonusMap2Cover" />
            <img id="bonusMap3Cover" />

            <!-- Enemies -->
            <img id="goblinSteal" />
            <img id="dotter" />
            <img id="vertibat" />
            <img id="ghobat" />
            <img id="ravengloom" />
            <img id="meatSoldier" />
            <img id="skulnapSleep" />
            <img id="skulnapAwake" />
            <img id="chiquita" />
            <img id="cactus" />
            <img id="duskPlant" />
            <img id="darkLeafAttack" />
            <img id="piranha" />
        `;
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

            glacikalDefeated: false,
            elyvorgDefeated: false,

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

            translate: jest.fn(),
            rotate: jest.fn(),

            filter: '',
            shadowColor: '',
            shadowBlur: 0,
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            textAlign: '',
            textBaseline: '',
            font: '',
            globalAlpha: 1,
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
        it('stops the criminalitySoundtrack on each update call', () => {
            menu.update();
            expect(mockGame.audioHandler.menu.stopSound).toHaveBeenCalledWith('criminalitySoundtrack');
        });
    });

    describe('isNightMode()', () => {
        it('returns true when storyNight is true (map2Unlocked true and map3Unlocked false)', () => {
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

        it('returns false when both storyNight and clockNight are false', () => {
            mockGame.map2Unlocked = false;
            mockGame.map3Unlocked = false;
            isLocalNight.mockReturnValue(false);

            const lore = new EnemyLore(mockGame);
            const result = lore.isNightMode();

            expect(result).toBe(false);
        });
    });

    describe('paging logic', () => {
        it('nextPage() increments currentPage but never past maxValidIndex', () => {
            menu.currentPage = 0;
            menu.nextPage();
            expect(menu.currentPage).toBe(1);

            menu.currentPage = menu.getMaxValidIndex();
            menu.nextPage();
            expect(menu.currentPage).toBe(menu.getMaxValidIndex());
        });

        it('previousPage() decrements currentPage but never below 0', () => {
            menu.currentPage = 2;
            menu.previousPage();
            expect(menu.currentPage).toBe(1);

            menu.currentPage = 0;
            menu.previousPage();
            expect(menu.currentPage).toBe(0);
        });

        it('clickNextPage() advances by 2 (mouse click on next page) but clamps to maxValidIndex', () => {
            menu.currentPage = 0;
            menu.clickNextPage();
            expect(menu.currentPage).toBe(2);

            menu.currentPage = menu.getMaxValidIndex();
            menu.clickNextPage();
            expect(menu.currentPage).toBe(menu.getMaxValidIndex());
        });

        it('clickPreviousPage() retreats by 2 but not below 0', () => {
            menu.currentPage = 3;
            menu.clickPreviousPage();
            expect(menu.currentPage).toBe(1);

            menu.currentPage = 1;
            menu.clickPreviousPage();
            expect(menu.currentPage).toBe(0);
        });

        it('plays the flip sound when calling next/previous and clickNext/clickPrevious (when movement happens)', () => {
            menu.currentPage = 0;
            menu.nextPage();
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('bookFlipForwardSound', false, true);

            jest.clearAllMocks();
            menu.currentPage = 2;
            menu.previousPage();
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('bookFlipBackwardSound', false, true);

            jest.clearAllMocks();
            menu.currentPage = 0;
            menu.clickNextPage();
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('bookFlipForwardSound', false, true);

            jest.clearAllMocks();
            menu.currentPage = 2;
            menu.clickPreviousPage();
            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('bookFlipBackwardSound', false, true);
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
            mockGame.bonusMap1Unlocked = true;

            menu = new EnemyLore(mockGame);
            menu.activateMenu();

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

        it('plays switch-tab sound when changing category', () => {
            mockGame.bonusMap1Unlocked = true;

            menu = new EnemyLore(mockGame);
            menu.activateMenu();

            menu.setCategory('bonus');

            expect(mockGame.audioHandler.menu.playSound).toHaveBeenCalledWith('enemyLoreSwitchTabSound', false, true);
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

        it('setCategory(bonus) is ignored when bonusMap1Unlocked is false', () => {
            mockGame.bonusMap1Unlocked = false;

            menu.category = 'main';
            menu.pages = menu.mainPages;

            menu.setCategory('bonus');

            expect(menu.category).toBe('main');
            expect(menu.pages).toBe(menu.mainPages);
            expect(mockGame.audioHandler.menu.playSound).not.toHaveBeenCalled();
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

        it('handleKeyDown: ArrowUp calls setCategory(main)', () => {
            jest.spyOn(menu, 'setCategory');
            menu.handleKeyDown({ key: 'ArrowUp' });
            expect(menu.setCategory).toHaveBeenCalledWith('main');
        });

        it('handleKeyDown: ArrowDown does NOT call setCategory(bonus) when bonusMap1 is locked', () => {
            jest.spyOn(menu, 'setCategory');

            mockGame.bonusMap1Unlocked = false;
            menu.handleKeyDown({ key: 'ArrowDown' });

            expect(menu.setCategory).not.toHaveBeenCalledWith('bonus');
        });

        it('handleKeyDown: ArrowDown calls setCategory(bonus) when bonusMap1 is unlocked', () => {
            mockGame.bonusMap1Unlocked = true;

            menu = new EnemyLore(mockGame);
            menu.activateMenu();

            const spy = jest.spyOn(menu, 'setCategory');

            menu.handleKeyDown({ key: 'ArrowDown' });

            expect(spy).toHaveBeenCalledWith('bonus');
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

        it('clicking main tab calls setCategory(main) and does not flip pages', () => {
            menu.menuActive = true;
            jest.spyOn(menu, 'setCategory');
            jest.spyOn(menu, 'clickNextPage');
            jest.spyOn(menu, 'clickPreviousPage');

            const mainTab = menu.getMainTabBounds();

            menu.handleMouseClick({
                clientX: mainTab.x + 5,
                clientY: mainTab.y + 5,
            });

            expect(menu.setCategory).toHaveBeenCalledWith('main');
            expect(menu.clickNextPage).not.toHaveBeenCalled();
            expect(menu.clickPreviousPage).not.toHaveBeenCalled();
        });

        it('clicking bonus tab does NOT call setCategory(bonus) when bonusMap1 is locked', () => {
            menu.menuActive = true;
            mockGame.bonusMap1Unlocked = false;

            jest.spyOn(menu, 'setCategory');
            jest.spyOn(menu, 'clickNextPage');
            jest.spyOn(menu, 'clickPreviousPage');

            const bonusTab = menu.getBonusTabBounds();

            menu.handleMouseClick({
                clientX: bonusTab.x + 5,
                clientY: bonusTab.y + 5,
            });

            expect(menu.setCategory).not.toHaveBeenCalledWith('bonus');
            expect(menu.clickNextPage).not.toHaveBeenCalled();
            expect(menu.clickPreviousPage).not.toHaveBeenCalled();
        });

        it('clicking bonus tab calls setCategory(bonus) when bonusMap1 is unlocked and does not flip pages', () => {
            mockGame.bonusMap1Unlocked = true;

            menu = new EnemyLore(mockGame);
            menu.activateMenu();
            menu.menuActive = true;

            jest.spyOn(menu, 'setCategory');
            jest.spyOn(menu, 'clickNextPage');
            jest.spyOn(menu, 'clickPreviousPage');

            const bonusTab = menu.getBonusTabBounds();

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

    describe('map gating + mini-tab behaviors', () => {
        it('bonusMap3 is locked unless bonusMap3Unlocked, glacikalDefeated, and elyvorgDefeated are true, and it does not appear in getMapNumberTabs()', () => {
            mockGame.bonusMap1Unlocked = true;
            mockGame.bonusMap3Unlocked = true;
            mockGame.glacikalDefeated = false;
            mockGame.elyvorgDefeated = false;

            menu = new EnemyLore(mockGame);
            menu.activateMenu();
            menu.setCategory('bonus');

            expect(menu.isMapKeyUnlocked('bonusMap3')).toBe(false);

            const tabs = menu.getMapNumberTabs();
            expect(tabs.some(t => t.mapKey === 'bonusMap3')).toBe(false);
        });

        it('mini-tab click jumps to the correct spread (map1..map4 unlocked) and normalizes to even index', () => {
            mockGame.map1Unlocked = true;
            mockGame.map2Unlocked = true;
            mockGame.map3Unlocked = true;
            mockGame.map4Unlocked = true;

            menu = new EnemyLore(mockGame);
            menu.activateMenu();
            menu.menuActive = true;

            const startIdx = getEnemyPageIndexByMapKey('map1');
            menu.currentPage = Math.min(startIdx, menu.getMaxValidIndex());

            const tabs = menu.getMapNumberTabs();
            const tab4 = tabs.find(t => t.mapKey === 'map4');
            if (!tab4) throw new Error('Test setup error: expected map4 tab to exist');

            // click inside the "4" tab
            menu.handleMouseClick({
                clientX: tab4.x + 2,
                clientY: tab4.y + 2,
            });

            const firstMap4 = menu.getFirstPageIndexForMapKey('map4');
            expect(firstMap4).toBeGreaterThanOrEqual(0);

            const expected = Math.min(
                (firstMap4 % 2 === 1) ? Math.max(0, firstMap4 - 1) : firstMap4,
                menu.getMaxValidIndex()
            );

            expect(menu.currentPage).toBe(expected);
        });

        it('getActiveMapKeyForSpread returns the left mapKey when both pages share it', () => {
            mockGame.map2Unlocked = true;

            menu = new EnemyLore(mockGame);
            menu.activateMenu();

            const cover2 = getCoverPageIndexByMapKey('map2');

            const evenCover2 = (cover2 % 2 === 1) ? cover2 - 1 : cover2;
            menu.currentPage = evenCover2;

            const leftKey = menu.pages[menu.currentPage]?.mapKey;
            const rightKey = menu.pages[menu.currentPage + 1]?.mapKey;

            expect(leftKey).toBe('map2');
            expect(rightKey).toBe('map2');

            expect(menu.getActiveMapKeyForSpread()).toBe('map2');
        });

        it('getActiveMapKeyForSpread prefers the right mapKey when it differs from the left', () => {
            mockGame.map2Unlocked = true;

            menu = new EnemyLore(mockGame);
            menu.activateMenu();

            const cover2 = getCoverPageIndexByMapKey('map2');

            const candidate = Math.max(0, cover2 - 1);
            menu.currentPage = Math.min(candidate, menu.getMaxValidIndex());

            const leftKey = menu.pages[menu.currentPage]?.mapKey;
            const rightKey = menu.pages[menu.currentPage + 1]?.mapKey;

            expect(rightKey).toBe('map2');
            expect(leftKey).not.toBeNull();
            expect(leftKey).not.toBe(rightKey);

            expect(menu.getActiveMapKeyForSpread()).toBe('map2');
        });
    });

    describe('draw()', () => {
        it('does nothing when menuActive is false', () => {
            menu.menuActive = false;
            menu.draw(ctx);
            expect(ctx.drawImage).not.toHaveBeenCalled();
        });

        it('stops the criminalitySoundtrack when drawing', () => {
            menu.menuActive = true;
            menu.draw(ctx);
            expect(mockGame.audioHandler.menu.stopSound).toHaveBeenCalledWith('criminalitySoundtrack');
        });

        it('draws day background when storyNight and clockNight are both false', () => {
            mockGame.map2Unlocked = false;
            mockGame.map3Unlocked = false;
            isLocalNight.mockReturnValue(false);
            menu.menuActive = true;

            menu.draw(ctx);

            expect(ctx.drawImage).toHaveBeenCalledWith(menu.backgroundImage, 0, 0, W, H);
        });

        it('draws night background when map2Unlocked is true and map3Unlocked is false (story night)', () => {
            mockGame.map2Unlocked = true;
            mockGame.map3Unlocked = false;
            isLocalNight.mockReturnValue(false);

            menu = new EnemyLore(mockGame);
            menu.activateMenu();
            menu.menuActive = true;

            menu.draw(ctx);

            expect(ctx.drawImage).toHaveBeenCalledWith(menu.backgroundImageNight, 0, 0, W, H);
        });

        it('draws day background when both map2Unlocked and map3Unlocked are true (story night off)', () => {
            mockGame.map2Unlocked = true;
            mockGame.map3Unlocked = true;
            isLocalNight.mockReturnValue(false);

            menu = new EnemyLore(mockGame);
            menu.activateMenu();
            menu.menuActive = true;

            menu.draw(ctx);

            expect(ctx.drawImage).toHaveBeenCalledWith(menu.backgroundImage, 0, 0, W, H);
        });

        it('draws the book frame and both pages content (if a right page exists)', () => {
            menu.menuActive = true;
            jest.spyOn(menu, 'drawPageContent');

            menu.draw(ctx);

            expect(menu.drawPageContent).toHaveBeenCalledWith(ctx, menu.currentPage, menu.bookX, menu.bookY);

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

        it('does NOT draw the BONUS MAPS tab label when bonusMap1Unlocked is false', () => {
            mockGame.bonusMap1Unlocked = false;
            menu.menuActive = true;

            const labels = [];
            ctx.fillText = (text) => labels.push(String(text));

            menu.draw(ctx);

            expect(labels).toContain('MAIN STORY');
            expect(labels).not.toContain('BONUS MAPS');
        });

        it('draws the BONUS MAPS tab label when bonusMap1Unlocked is true', () => {
            mockGame.bonusMap1Unlocked = true;

            menu = new EnemyLore(mockGame);
            menu.activateMenu();
            menu.menuActive = true;

            const labels = [];
            ctx.fillText = (text) => labels.push(String(text));

            menu.draw(ctx);

            expect(labels).toContain('MAIN STORY');
            expect(labels).toContain('BONUS MAPS');
        });
    });

    describe('drawPageContent()', () => {
        it('renders locked placeholders when an enemy page is locked', () => {
            const idx = getEnemyPageIndexByMapKey('map2');

            menu.drawPageContent(ctx, idx, 0, 0);

            const texts = ctx.fillText.mock.calls.map(call => call[0]);
            expect(texts).toEqual(['NAME: ???', 'TYPE: ??? & ???', 'FOUND AT: ???', 'DESCRIPTION: ???']);
        });

        it('does not render enemy placeholders for cover pages; cover title becomes "???" when locked', () => {
            const idx = getCoverPageIndexByMapKey('map2');

            const labels = [];
            ctx.fillText = (text) => labels.push(String(text));

            menu.drawPageContent(ctx, idx, 0, 0);

            expect(labels).toContain('???');
        });

        it('applies phraseColors styling on unlocked pages', () => {
            mockGame.map1Unlocked = true;

            menu = new EnemyLore(mockGame);
            menu.activateMenu();

            const records = [];
            ctx.strokeText = (text) => {
                records.push({ text: String(text), shadowColor: ctx.shadowColor, shadowBlur: ctx.shadowBlur });
            };

            const goblitoIdx = getEnemyPageIndexByName('GOBLITO');
            menu.drawPageContent(ctx, goblitoIdx, 0, 0);

            const entry = records.find(r => r.text === 'EVERYWHERE');
            expect(entry).toBeDefined();
            expect(entry.shadowColor).toBe('white');
            expect(entry.shadowBlur).toBe(5);
        });

        it('blurs images when the enemy page is locked', () => {
            const idx = getEnemyPageIndexByMapKey('map2');
            menu.drawPageContent(ctx, idx, 0, 0);
            expect(ctx.filter).toBe('blur(15px)');
        });
    });

    describe('pages data', () => {
        it('contains CHIQUITA page with correct metadata and image', () => {
            const chiquita = menu.pages.find(p => p.pageKind === 'enemy' && p.name === 'CHIQUITA');
            expect(chiquita).toBeDefined();
            expect(chiquita).toMatchObject({
                type: 'FLY & NORMAL',
                foundAt: 'VERDANT VINE',
            });
            expect(chiquita.images[0].enemyImage.id).toBe('chiquita');
        });

        it('stores the full CHIQUITA description exactly', () => {
            const chiquita = menu.pages.find(p => p.pageKind === 'enemy' && p.name === 'CHIQUITA');
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

            menu.createPage({
                name: 'TEST_MAIN',
                type: 'TYPE',
                foundAt: 'WHERE',
                description: 'DESC',
                images: [],
                mapKey: null,
                category: 'main',
            });

            menu.createPage({
                name: 'TEST_BONUS',
                type: 'TYPE',
                foundAt: 'WHERE',
                description: 'DESC',
                images: [],
                mapKey: null,
                category: 'bonus',
            });

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
            document.body.insertAdjacentHTML('beforeend', `<img id="goblin" />`);

            const imgObj = menu.createImage('goblin', 16, 32, 2, 100, 150, 1.5, 'stun');
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

    describe('phraseColors styling (main maps)', () => {
        const cases = [
            ['EVERYWHERE', 'GOBLITO', [], 'white', 5],
            ['LUNAR', 'DOTTER', [], '#06580dff', 7],
            ['NIGHTFALL', 'DUSK PLANT', ['map2Unlocked'], 'black', 10],
            ['CORAL', 'PIRANHA', ['map3Unlocked'], 'darkblue', 5],
            ['VERDANT', 'CHIQUITA', ['map4Unlocked'], 'black', 15],
            ['SPRINGLY', 'SNAILEY', ['map5Unlocked'], 'orange', 5],
            ['VENOMVEIL', 'CACTUS', ['map6Unlocked'], '#003b00', 10],
            ['INFERNAL', 'PETROPLANT', ['map7Unlocked'], 'black', 10],
            ['RED', 'SPEAR FISH', ['map3Unlocked'], 'black', 1],
            ['STUN', 'SKULNAP', [], 'black', 1],
        ];

        test.each(cases)(
            '"%s" on page "%s" with flags %j sets stroke=%s blur=%i',
            (token, pageName, flags, stroke, blur) => {
                flags.forEach(f => { mockGame[f] = true; });

                menu = new EnemyLore(mockGame);
                menu.activateMenu();

                const pageIdx = getEnemyPageIndexByName(pageName);

                const rec = [];
                ctx.strokeText = (t) =>
                    rec.push({
                        text: String(t).trim(),
                        strokeColor: ctx.shadowColor,
                        shadowBlur: ctx.shadowBlur,
                    });

                menu.drawPageContent(ctx, pageIdx, 0, 0);

                const hit = rec.find(r => r.text === token);
                expect(hit).toBeDefined();
                expect(hit.strokeColor).toBe(stroke);
                expect(hit.shadowBlur).toBe(blur);
            }
        );
    });

    describe('phraseColors styling (bonus maps)', () => {
        const bonusCases = [
            ['ICEBOUND', 'bonusMap1', ['bonusMap1Unlocked'], '#1c4a7f', 10],
            ['CRIMSON', 'bonusMap2', ['bonusMap1Unlocked', 'bonusMap2Unlocked'], '#000000ff', 10],
            ['COSMIC', 'bonusMap3', ['bonusMap1Unlocked', 'bonusMap3Unlocked', 'elyvorgDefeated', 'glacikalDefeated'], '#270033', 10],
        ];

        test.each(bonusCases)(
            '"%s" on bonus enemy page mapKey=%s with flags %j sets stroke=%s blur=%i',
            (token, mapKey, flags, stroke, blur) => {
                flags.forEach(f => { mockGame[f] = true; });

                menu = new EnemyLore(mockGame);
                menu.activateMenu();

                menu.setCategory('bonus');

                const idx = getEnemyPageIndexByMapKey(mapKey);

                const rec = [];
                ctx.strokeText = (t) =>
                    rec.push({
                        text: String(t).trim(),
                        strokeColor: ctx.shadowColor,
                        shadowBlur: ctx.shadowBlur,
                    });

                menu.drawPageContent(ctx, idx, 0, 0);

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
            menu.createPage({
                name: 'TEST ENEMY',
                type: 'TEST TYPE',
                foundAt: 'COSMIC RIFT',
                description: 'COSMIC\nRIFT',
                images: [],
                mapKey: null,
                category: 'main',
            });

            const records = [];
            ctx.strokeText = (text) => {
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
            mockGame.bonusMap1Unlocked = true;
            mockGame.bonusMap3Unlocked = true;
            mockGame.glacikalDefeated = true;
            mockGame.elyvorgDefeated = true;

            menu = new EnemyLore(mockGame);
            menu.activateMenu();
            menu.setCategory('bonus');

            const idx = getEnemyPageIndexByMapKey('bonusMap3');

            const records = [];
            ctx.strokeText = (text) => {
                records.push({
                    text: String(text),
                    shadowColor: ctx.shadowColor,
                    shadowBlur: ctx.shadowBlur,
                });
            };

            menu.drawPageContent(ctx, idx, 0, 0);

            const cosmicEntries = records.filter(r => r.text === 'COSMIC');
            expect(cosmicEntries.length).toBeGreaterThan(0);

            expect(cosmicEntries.some(e => e.shadowColor === 'transparent' || e.shadowBlur === 0)).toBe(true);
            expect(cosmicEntries.some(e => e.shadowColor === '#270033' && e.shadowBlur === 10)).toBe(true);
        });

        it('does not style a phrase word when the full phrase is not present', () => {
            const pageIndex = menu.pages.length;
            menu.createPage({
                name: 'TEST ENEMY 2',
                type: 'TEST TYPE',
                foundAt: 'NOWHERE',
                description: 'RIFT',
                images: [],
                mapKey: null,
                category: 'main',
            });

            const records = [];
            ctx.strokeText = (text) => {
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
