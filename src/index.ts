import lcs from "./lcs";

interface ParentElement extends HTMLDivElement {
    firstElementChild: BoxElement;
}

interface BoxElement extends HTMLSpanElement {
    parentElement: ParentElement;
    nextElementSibling: BoxElement;
    previousElementSibling: BoxElement;
    textContent: string;
    dataset: {
        selected: string;
        col: string;
        row: string;
    };
}

type Context = {
    lcs: ReturnType<typeof lcs>;
    rowElement: BoxElement;
    colElement: BoxElement;
    itemElement: BoxElement;
    items: BoxElement[];
    footer: HTMLDivElement;
    result: string;
};

const root = document.querySelector(":root")! as HTMLElement;
const grid = document.querySelector(".grid")! as HTMLDivElement;
const offsets = new Map([
    ["\u2190", [-1, 0]],
    ["\u2191", [0, -1]],
    ["\u2196", [-1, -1]],
]);
const classes = {
    grid: "grid",
    label: "label",
    items: "items",
    box: "box",
    even: "even",
    footer: "footer",
    animationControls: "animation-controls",
    result: "result",
    resultItem: "result-item",
};

function showResult(ctx: Required<Context>) {
    const {footer, result: text, lcs} = ctx;

    let child;

    while ((child = footer.lastChild)) {
        child.remove();
    }

    const result = document.createElement("div");
    result.classList.add(classes.result);
    result.appendChild(
        document.createTextNode(
            `LCS(${lcs.query[0]}, ${lcs.query[1]}) = ${text ? text : "no match"}`
        )
    );

    footer.appendChild(result);
}

function backTrack(ctx: Required<Context>) {
    const {colElement, rowElement, itemElement, lcs, items} = ctx;

    itemElement.ontransitionend = null;

    const [text] = itemElement.textContent;

    if (text == "0") {
        return showResult(ctx);
    }

    let i = 0;

    for (let key of offsets.keys()) {
        if (key != text) {
            i++;
            continue;
        }

        if (i == 2) {
            colElement.dataset.selected = "match";
            rowElement.dataset.selected = "match";
            ctx.result += colElement.textContent;
            ctx.colElement = colElement.previousElementSibling;
            ctx.rowElement = rowElement.previousElementSibling;
        } else if (i == 1) {
            ctx.rowElement = rowElement.previousElementSibling;
        } else {
            ctx.colElement = colElement.previousElementSibling;
        }

        break;
    }

    const col = parseInt(itemElement.dataset.col) + offsets.get(text)![0];
    const row = parseInt(itemElement.dataset.row) + offsets.get(text)![1];
    const offset = row * lcs.weights[0].length + col;
    const next = items[offset];
    ctx.itemElement = next;

    next.ontransitionend = () => backTrack(ctx);
    next.dataset.selected = "true";
}

function end(ctx: Required<Context> & {b: HTMLSpanElement}) {
    const {rowElement, colElement, itemElement: a, b, lcs} = ctx;
    const col = parseInt(a.dataset.col);
    const row = parseInt(a.dataset.row);
    a.textContent = `${lcs.paths[row - 1][col - 1]}${lcs.weights[row][col]}`;
    b.ontransitionend = null;
    b.dataset.selected = "false";

    let next: BoxElement;

    colElement.dataset.selected = "false";
    // Are we done with a row? Else next column.
    if ((next = colElement.nextElementSibling)) {
        a.dataset.selected = "false";
        ctx.colElement = next;

        return nextRowElement(ctx);
    }

    rowElement.dataset.selected = "false";
    // Are we done with the grid? Else next row.
    if ((next = rowElement.nextElementSibling)) {
        a.dataset.selected = "false";
        ctx.colElement = colElement.parentElement.firstElementChild;
        ctx.rowElement = next;

        next.ontransitionend = () => nextRowElement(ctx);
        next.dataset.selected = "true";

        return;
    }

    // For consistency wait for b to transition and then backtrack.
    b.ontransitionend = () => backTrack(ctx);
}

function nextItemElement(ctx: Required<Context>) {
    const {itemElement, items, lcs} = ctx;

    itemElement.ontransitionend = null;

    const [text] = itemElement.textContent;
    const col = parseInt(itemElement.dataset.col) + offsets.get(text)![0];
    const row = parseInt(itemElement.dataset.row) + offsets.get(text)![1];
    const offset = row * lcs.weights[0].length + col;
    const next = items[offset];

    next.ontransitionend = () => end({...ctx, ...{b: next}});
    next.dataset.selected = "true";
}

function nextColElement(ctx: Required<Context>) {
    const {colElement, rowElement, lcs, items} = ctx;

    colElement.ontransitionend = null;

    const col = parseInt(colElement.dataset.col) + 1;
    const row = parseInt(rowElement.dataset.row) + 1;
    const offset = row * lcs.weights[0].length + col;
    const next = items[offset];
    ctx.itemElement = items[offset];

    next.ontransitionend = () => nextItemElement(ctx);
    next.dataset.selected = "true";
}

function nextRowElement(ctx: Required<Context>) {
    const {rowElement, colElement} = ctx;
    rowElement.ontransitionend = null;
    colElement.ontransitionend = () => nextColElement(ctx);

    if (rowElement.textContent == colElement.textContent) {
        colElement.dataset.selected = "match";
        rowElement.dataset.selected = "match";
    } else {
        colElement.dataset.selected = "true";
        rowElement.dataset.selected = "true";
    }
}

function decreaseAnimationSpeed(
    button: HTMLButtonElement,
    container: HTMLDivElement,
    timer: {id: number | undefined}
) {
    const styles = window.getComputedStyle(root);
    const text = styles.getPropertyValue("--delay");
    let delay = parseInt(text.slice(0, text.indexOf("ms"))) + 50;

    if (delay > 500) {
        button.disabled = true;
        return;
    }

    const sibling = button.nextElementSibling;
    sibling?.removeAttribute("disabled");

    root.style.setProperty("--delay", `${delay}ms`);
    container.dataset.content = `${delay}ms`;

    clearTimeout(timer.id);
    timer.id = setTimeout(() => {
        container.dataset.content = "animation speed";
    }, 1200);
}

function increaseAnimationSpeed(
    button: HTMLButtonElement,
    container: HTMLDivElement,
    timer: {id: number | undefined}
) {
    const styles = window.getComputedStyle(root);
    const text = styles.getPropertyValue("--delay");
    let delay = parseInt(text.slice(0, text.indexOf("ms"))) - 50;

    if (delay <= 0) {
        button.disabled = true;
        return;
    }

    const sibling = button.previousElementSibling;
    sibling?.removeAttribute("disabled");

    root.style.setProperty("--delay", `${delay}ms`);
    container.dataset.content = `${delay}ms`;

    clearTimeout(timer.id);
    timer.id = setTimeout(() => {
        container.dataset.content = "animation speed";
    }, 1200);
}

function makeLabel(ctx: Context, type: "row" | "col") {
    const label = document.createElement("div");
    label.classList.add(classes.label);

    const i = type == "row" ? 0 : 1;

    for (let j = 0; j < ctx.lcs.query[i].length; j++) {
        const box = document.createElement("span");
        box.classList.add(classes.box);
        box.dataset.selected = "false";
        box.textContent = ctx.lcs.query[i][j];

        if (type == "row") {
            box.dataset.row = `${j}`;
        } else {
            box.dataset.col = `${j}`;
        }

        if (!j) {
            ctx[type == "row" ? "rowElement" : "colElement"] =
                box as BoxElement;
        }

        label.appendChild(box);
    }

    label.dataset.flow = type;

    return label;
}

function makeItems(ctx: Context) {
    const items = document.createElement("div");
    items.classList.add(classes.items);

    for (let i = 0; i < ctx.lcs.weights.length; i++) {
        for (let j = 0; j < ctx.lcs.weights[0].length; j++) {
            const box = document.createElement("span");
            box.classList.add(classes.box);
            box.dataset.selected = "false";
            box.dataset.row = `${i}`;
            box.dataset.col = `${j}`;

            if (i && j) {
                box.textContent = `${ctx.lcs.paths[i - 1][j - 1]}0`;
            } else {
                box.textContent = "0";
            }

            items.appendChild(box);
        }
    }

    ctx.items = Array.from(items.children) as BoxElement[];

    return items;
}

function makeFooter(ctx: Context) {
    const footer = document.createElement("div");
    footer.classList.add(classes.footer);

    const timer = {id: undefined};
    const animationControl = document.createElement("div");
    animationControl.classList.add(classes.animationControls);
    animationControl.dataset.content = "animation speed";

    for (let i = 0; i < 2; i++) {
        const button = document.createElement("button");
        button.textContent = i ? "+" : "-";

        if (i) {
            button.onclick = () =>
                increaseAnimationSpeed(button, animationControl, timer);
        } else {
            button.toggleAttribute("disabled");
            button.onclick = () =>
                decreaseAnimationSpeed(button, animationControl, timer);
        }

        animationControl.appendChild(button);
    }

    footer.appendChild(animationControl);

    ctx.footer = footer;

    return footer;
}

function makeGrid(grid: HTMLDivElement, ctx: Context) {
    let child;

    while ((child = grid.lastChild)) {
        child.remove();
    }

    grid.appendChild(makeLabel(ctx, "row"));
    grid.appendChild(makeLabel(ctx, "col"));
    grid.appendChild(makeItems(ctx));
    grid.appendChild(makeFooter(ctx));
}

function run(ctx: Context) {
    root.style.setProperty("--delay", "500ms");

    requestAnimationFrame(() => {
        ctx.rowElement.ontransitionend = () => nextRowElement(ctx);
        ctx.rowElement.dataset.selected = "true";
    });
}

document.querySelector<HTMLFormElement>(".request-form")!.onsubmit = (
    e: SubmitEvent
) => {
    e.preventDefault();

    const target = e.currentTarget as HTMLFormElement;
    const children = Array.from(target.children) as HTMLInputElement[];
    const ctx = {
        lcs: lcs(children[0].value, children[1].value),
        result: "",
    } as Context;

    makeGrid(grid, ctx);
    run(ctx);
};
