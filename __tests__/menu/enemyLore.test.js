import { EnemyLore } from '../../game/menu/enemyLore.js';

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
      <!-- add more if your createImage() calls hit them -->
    `;
    });

    beforeEach(() => {
        mockGame = {
            width: W,
            height: H,
            map2Unlocked: false,
            map3Unlocked: false,
            map4Unlocked: false,
            map5Unlocked: false,
            map6Unlocked: false,
            audioHandler: {
                menu: {
                    stopSound: jest.fn(),
                    playSound: jest.fn()
                }
            },
            canvas: {
                width: W,
                height: H,
                getBoundingClientRect: () => ({ left: 0, top: 0, width: W, height: H })
            }
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
            filter: '',
            shadowColor: '',
            shadowBlur: 0,
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            textAlign: ''
        };

        menu = new EnemyLore(mockGame);
        menu.activateMenu();
        jest.clearAllMocks();
    });

    describe('initialization', () => {
        it('sets up pages and book geometry correctly', () => {
            expect(menu.pages.length).toBeGreaterThan(0);
            expect(menu.pageWidth).toBeCloseTo(W * 0.43, 2);
            expect(menu.pageHeight).toBeCloseTo(H * 0.8, 2);
            expect(menu.bookX).toBeCloseTo((W - 2 * menu.pageWidth) / 2, 2);
            expect(menu.bookY).toBeCloseTo((H - menu.pageHeight) / 2, 2);
        });
    });

    describe('paging logic', () => {
        it('nextPage() advances by 1 until the last valid index', () => {
            menu.currentPage = 0;
            menu.nextPage();
            expect(menu.currentPage).toBe(1);
            menu.currentPage = menu.pages.length - 1;
            menu.nextPage();
            expect(menu.currentPage).toBe(menu.pages.length - 1);
        });

        it('previousPage() retreats by 1 down to 0', () => {
            menu.currentPage = 2;
            menu.previousPage();
            expect(menu.currentPage).toBe(1);
            menu.currentPage = 0;
            menu.previousPage();
            expect(menu.currentPage).toBe(0);
        });

        it('clickNextPage() advances by 2 (for mouse clicks)', () => {
            menu.currentPage = 0;
            menu.clickNextPage();
            expect(menu.currentPage).toBe(2);
        });

        it('clickPreviousPage() retreats by 2 down to 0', () => {
            menu.currentPage = 3;
            menu.clickPreviousPage();
            expect(menu.currentPage).toBe(1);
            menu.currentPage = 1;
            menu.clickPreviousPage();
            expect(menu.currentPage).toBe(0);
        });

        it('doesn’t overflow past the last page with clickNextPage()', () => {
            menu.currentPage = menu.pages.length - 1;
            menu.clickNextPage();
            expect(menu.currentPage).toBe(menu.pages.length - 1);
        });

        it('doesn’t underflow before page 0 with clickPreviousPage()', () => {
            menu.currentPage = 0;
            menu.clickPreviousPage();
            expect(menu.currentPage).toBe(0);
        });

        it('plays flip sound when nextPage()', () => {
            menu.currentPage = 0;
            menu.nextPage();
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('bookFlip', false, true);
        });

        it('plays flip sound when clickNextPage()', () => {
            menu.currentPage = 0;
            menu.clickNextPage();
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('bookFlip', false, true);
        });
    });

    describe('input handlers', () => {
        it('handleKeyDown: ArrowRight → nextPage, ArrowLeft → previousPage', () => {
            jest.spyOn(menu, 'nextPage');
            jest.spyOn(menu, 'previousPage');
            menu.handleKeyDown({ key: 'ArrowRight' });
            expect(menu.nextPage).toHaveBeenCalled();
            menu.handleKeyDown({ key: 'ArrowLeft' });
            expect(menu.previousPage).toHaveBeenCalled();
        });

        it('handleMouseWheel: up (deltaY<0) → clickNextPage; down → clickPreviousPage', () => {
            jest.spyOn(menu, 'clickNextPage');
            jest.spyOn(menu, 'clickPreviousPage');
            menu.handleMouseWheel({ deltaY: -100 });
            expect(menu.clickNextPage).toHaveBeenCalled();
            menu.handleMouseWheel({ deltaY: 100 });
            expect(menu.clickPreviousPage).toHaveBeenCalled();
        });

        it('handleMouseClick: left‐half → clickPreviousPage; right‐half → clickNextPage', () => {
            jest.spyOn(menu, 'clickPreviousPage');
            jest.spyOn(menu, 'clickNextPage');
            const insideY = menu.bookY + 10;

            // left‐page click
            menu.handleMouseClick({ clientX: menu.bookX + 10, clientY: insideY });
            expect(menu.clickPreviousPage).toHaveBeenCalled();

            jest.clearAllMocks();

            // right‐page click
            menu.handleMouseClick({
                clientX: menu.bookX + menu.pageWidth + 10,
                clientY: insideY
            });
            expect(menu.clickNextPage).toHaveBeenCalled();
        });

        it('none of these fire when menuActive=false', () => {
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
    });

    describe('draw()', () => {
        it('does nothing when menuActive=false', () => {
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

        it('draws day‑background when map2Unlocked=false', () => {
            mockGame.map2Unlocked = false;
            menu.menuActive = true;
            menu.draw(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                menu.backgroundImage,
                0, 0, W, H
            );
        });

        it('draws night‑background when map2Unlocked=true & map3Unlocked=false', () => {
            mockGame.map2Unlocked = true;
            mockGame.map3Unlocked = false;
            menu.menuActive = true;
            menu.draw(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                menu.backgroundImageNight,
                0, 0, W, H
            );
        });

        it('draws day‑background when map2Unlocked=true & map3Unlocked=true', () => {
            mockGame.map2Unlocked = true;
            mockGame.map3Unlocked = true;
            menu.menuActive = true;
            menu.draw(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                menu.backgroundImage,
                0, 0, W, H
            );
        });

        it('draws the book frames and page content twice', () => {
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
                menu.bookX, menu.bookY, menu.pageWidth, menu.pageHeight
            );
            expect(ctx.drawImage).toHaveBeenCalledWith(
                menu.rightPageBackground,
                menu.bookX + menu.pageWidth, menu.bookY, menu.pageWidth, menu.pageHeight
            );
        });
    });

    describe('drawPageContent()', () => {
        it('renders all four locked placeholders when page is locked', () => {
            // pageIndex ≥ 9 with map2Unlocked=false
            menu.drawPageContent(ctx, 9, 0, 0);
            const texts = ctx.fillText.mock.calls.map(call => call[0]);
            expect(texts).toEqual([
                'NAME: ???',
                'TYPE: ??? & ???',
                'FOUND AT: ???',
                'DESCRIPTION: ???'
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
                foundAt: 'VERDANT VINE'
            });
            expect(chiquita.images[0].enemyImage.id).toBe('chiquita');
        });

        it('stores the full CHIQUITA description exactly', () => {
            const chiquita = menu.pages.find(p => p.name === 'CHIQUITA');
            expect(chiquita.description).toBe(
                "CHIQUITA IS A DELIGHTFUL AND FRIENDLY BIRD WHO LOVES TO EXPLORE THE SKIES.\n" +
                "HER PEACEFUL FLIGHTS ARE A SIGHT TO BEHOLD, AS SHE GLIDES EFFORTLESSLY AND GRACEFULLY.\n" +
                "WITH A CHEERFUL CHIRP AND A GENTLE HEART, CHIQUITA BRINGS JOY AND TRANQUILITY TO EVERYONE SHE MEETS."
            );
        });
    });

    describe('page‐number rendering in draw()', () => {
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

    describe('createImage helper', () => {
        it('returns an object with correct properties', () => {
            const imgObj = menu.createImage(
                'forestmap', 16, 32, 2, 100, 150, 1.5, 'stun'
            );
            expect(imgObj.enemyImage).toBe(document.getElementById('forestmap'));
            expect(imgObj.frameWidth).toBe(16);
            expect(imgObj.frameHeight).toBe(32);
            expect(imgObj.enemyFrame).toBe(2);
            expect(imgObj.enemyX).toBe(100);
            expect(imgObj.enemyY).toBe(150);
            expect(imgObj.size).toBe(1.5);
            expect(imgObj.type).toBe('stun');
        });
    });

    describe('handleMouseClick boundaries', () => {
        it('does not flip pages when clicking outside either page area', () => {
            const spyNext = jest.spyOn(menu, 'clickNextPage');
            const spyPrev = jest.spyOn(menu, 'clickPreviousPage');

            menu.handleMouseClick({ clientX: menu.bookX - 50, clientY: menu.bookY - 50 });
            menu.handleMouseClick({
                clientX: menu.bookX + menu.pageWidth * 2 + 50,
                clientY: menu.bookY + menu.pageHeight + 50
            });

            expect(spyNext).not.toHaveBeenCalled();
            expect(spyPrev).not.toHaveBeenCalled();
        });
    });

    describe('background‐image selection edge cases', () => {
        it('defaults to day background if both map2Unlocked and map3Unlocked are false', () => {
            mockGame.map2Unlocked = false;
            mockGame.map3Unlocked = false;
            menu.menuActive = true;
            menu.draw(ctx);
            expect(ctx.drawImage).toHaveBeenCalledWith(
                menu.backgroundImage,
                0, 0, W, H
            );
        });
    });

    describe('phraseColors styling for every keyword', () => {
        const cases = [
            ['EVERYWHERE', 0, [], 'white', 5],
            ['LUNAR MOONLIT GLADE', 1, [], 'green', 5],
            ['NIGHTFALL CITY PHANTOM', 9, ['map2Unlocked'], 'black', 5],
            ['CORAL ABYSS', 14, ['map2Unlocked', 'map3Unlocked'], 'darkblue', 5],
            ['VERDANT VINE', 22, ['map2Unlocked', 'map3Unlocked', 'map4Unlocked'], 'black', 15],
            ['SPRINGLY LEMONY', 30, ['map2Unlocked', 'map3Unlocked', 'map4Unlocked', 'map5Unlocked'], 'orange', 5],
            ['INFERNAL CRATER PEAK', 41, ['map2Unlocked', 'map3Unlocked', 'map4Unlocked', 'map5Unlocked', 'map6Unlocked'], 'black', 10],
            ['RED', 16, ['map2Unlocked', 'map3Unlocked'], 'black', 1],
            ['STUN', 6, [], 'black', 1],
        ];
        test.each(cases)(
            `“%s” on page %i with %j → stroke=%s blur=%i`,
            (phrase, pageIndex, flags, stroke, blur) => {
                flags.forEach(f => mockGame[f] = true);
                const rec = [];
                ctx.strokeText = (t, x, y) =>
                    rec.push({ text: String(t).trim(), strokeColor: ctx.shadowColor, shadowBlur: ctx.shadowBlur });
                menu.drawPageContent(ctx, pageIndex, 0, 0);
                const hit = rec.find(r => r.text === phrase);
                expect(hit).toBeDefined();
                expect(hit.strokeColor).toBe(stroke);
                expect(hit.shadowBlur).toBe(blur);
            }
        );
    });

    describe('paging sound effects', () => {
        it('plays flip sound when previousPage()', () => {
            menu.currentPage = 1;
            menu.previousPage();
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('bookFlip', false, true);
        });
        it('plays flip sound when clickPreviousPage()', () => {
            menu.currentPage = 2;
            menu.clickPreviousPage();
            expect(mockGame.audioHandler.menu.playSound)
                .toHaveBeenCalledWith('bookFlip', false, true);
        });
    });

    describe('handleMouseMove()', () => {
        it('never flips pages on mouse move', () => {
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
    });
});
