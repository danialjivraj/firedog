import { ScrollableMenu } from "./scrollableMenu.js";
import { formatTimeMs } from "../utils/formatTime.js";
import { MAP_DISPLAY_NAMES, MAP_THEME_COLORS } from "../config/constants.js";

const MAPS = [
    { key: "Map1", label: "Map 1", flags: ["map1Unlocked"] },
    { key: "Map2", label: "Map 2", flags: ["map2Unlocked"] },
    { key: "Map3", label: "Map 3", flags: ["map3Unlocked"] },
    { key: "Map4", label: "Map 4", flags: ["map4Unlocked"] },
    { key: "Map5", label: "Map 5", flags: ["map5Unlocked"] },
    { key: "Map6", label: "Map 6", flags: ["map6Unlocked"] },
    { key: "Map7", label: "Map 7", flags: ["map7Unlocked"] },
    { key: "BonusMap1", label: "Bonus Map 1", flags: ["bonusMap1Unlocked"] },
    { key: "BonusMap2", label: "Bonus Map 2", flags: ["bonusMap2Unlocked"] },
    { key: "BonusMap3", label: "Bonus Map 3", flags: ["bonusMap3Unlocked", "glacikalDefeated", "elyvorgDefeated"] },
];

const BOSS_MAPS = new Set(["Map7", "BonusMap1", "BonusMap3"]);

const ROW_H = 60;
const MAX_VISIBLE_ROWS = 5;

export class RecordsMenu extends ScrollableMenu {
    constructor(game) {
        super(game, ["Go Back"], "Records");
        this.cardModifier = "menu-card--wide menu-card--records";
        this.decimals = 2;
    }

    isBossMap(mapKey) {
        return BOSS_MAPS.has(mapKey);
    }

    getUnlockedMaps() {
        return MAPS.filter((map) => map.flags.every((flag) => !!this.game[flag]));
    }

    get listHeight() {
        return Math.max(ROW_H, Math.min(this.getUnlockedMaps().length * ROW_H, MAX_VISIBLE_ROWS * ROW_H));
    }

    get goBackIndex() {
        return this.getUnlockedMaps().length;
    }

    // dom

    buildBody(body) {
        const section = document.createElement("div");
        section.className = "records-section";

        const header = document.createElement("div");
        header.className = "records-header";
        header.innerHTML = "<span>MAP</span><span>BEST CLEAR TIME</span>";

        const empty = document.createElement("div");
        empty.className = "records-empty";
        empty.textContent = "No maps unlocked yet.";

        section.append(header, empty, this.buildScrollArea("records"));
        body.appendChild(section);

        [this.dom.back] = this.buildFooter(body, ["Go Back"], () => this.setSelected(this.goBackIndex));

        this.dom.empty = empty;
        this.dom.mapRows = [];
        this._renderedMaps = null;
    }

    _buildRows(unlocked) {
        this.dom.track.replaceChildren();

        this.dom.mapRows = unlocked.map((map, index) => {
            const root = document.createElement("div");
            root.className = "records-row";

            const name = document.createElement("span");
            name.className = "records-row__name";
            name.textContent = MAP_DISPLAY_NAMES[map.key];
            name.style.color = MAP_THEME_COLORS.forestMap[map.key]?.fill || "rgba(255,255,255,0.92)";

            const sub = document.createElement("span");
            sub.className = "records-row__sub";
            sub.textContent = map.label;

            const left = document.createElement("div");
            left.className = "records-row__left";
            left.append(name, sub);

            const clear = document.createElement("span");
            clear.className = "records-row__clear";

            const boss = document.createElement("span");
            boss.className = "records-row__boss";

            const right = document.createElement("div");
            right.className = "records-row__right";
            right.append(clear, boss);

            root.append(left, right);
            this.bindHover(root, () => this.setSelected(index));
            this.dom.track.appendChild(root);

            return { root, clear, boss };
        });
    }

    syncContent() {
        const unlocked = this.getUnlockedMaps();
        const signature = unlocked.map((map) => map.key).join(" ");

        if (signature !== this._renderedMaps) {
            this._renderedMaps = signature;
            this._buildRows(unlocked);
        }

        this.dom.empty.hidden = unlocked.length > 0;

        unlocked.forEach((map, i) => {
            const record = this.game.records?.[map.key] ?? {};
            const showBoss = this.isBossMap(map.key) && record.bossMs != null;
            const view = this.dom.mapRows[i];
            if (!view) return;

            view.clear.textContent = formatTimeMs(record.clearMs ?? null, this.decimals);
            view.clear.classList.toggle("is-empty", record.clearMs == null);

            view.boss.textContent = showBoss ? `Boss: ${formatTimeMs(record.bossMs, this.decimals)}` : "";
            view.boss.hidden = !showBoss;

            view.root.classList.toggle("is-focused", this.selectedOption === i);
        });

        this.dom.back.classList.toggle("is-focused", this.selectedOption === unlocked.length);
        this.syncScroll(this.listHeight, unlocked.length * ROW_H);
    }

    // behaviour

    update(deltaTime) {
        super.update(deltaTime);
        this.scrollMax = Math.max(0, this.goBackIndex * ROW_H - this.listHeight);
        this.tickScroll(deltaTime);
    }

    activateMenu() {
        this.scrollY = 0;
        this.targetScrollY = 0;
        this.draggingBar = false;
        this.barRect = null;

        super.activateMenu(0);
    }

    setSelected(index) {
        if (index === this.selectedOption) return;
        this.selectedOption = index;
        this.playHover();
        this.scrollSelectedIntoView();
    }

    scrollSelectedIntoView() {
        if (this.selectedOption < 0 || this.selectedOption >= this.goBackIndex) return;
        this.scrollIntoView(this.selectedOption * ROW_H, ROW_H, this.listHeight);
    }

    handleNavigation(delta) {
        const rowCount = this.goBackIndex + 1;
        this.selectedOption = (this.selectedOption + Math.sign(delta) + rowCount) % rowCount;
        this.scrollSelectedIntoView();
    }

    handleKeyDown(event) {
        if (!this._canInteract()) return;

        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            this.handleNavigation(event.key === "ArrowUp" ? -1 : 1);
            this.playHover();
        } else if (event.key === "Enter" && this.selectedOption === this.goBackIndex) {
            this.handleMenuSelection();
        }
    }

    handleMouseClick(event) {
        if (this.consumeBarClick(event)) return;
        if (!this._canInteract()) return;
        if (this.selectedOption === this.goBackIndex) this.handleMenuSelection();
    }

    handleMenuSelection() {
        if (!this.game.canSelect) return;
        super.handleMenuSelection();
        this.game.goBackMenu();
    }
}
