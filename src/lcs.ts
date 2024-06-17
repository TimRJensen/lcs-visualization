export default function lcs(a: string, b: string) {
    const m = a.length + 1;
    const n = b.length + 1;

    const weights = new Array(m)
        .fill(0)
        .map(() => new Array<number>(n).fill(0));
    const paths = new Array(m - 1)
        .fill(0)
        .map(() => new Array<string>(n - 1).fill(""));

    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            if (a[i - 1] == b[j - 1]) {
                weights[i][j] = weights[i - 1][j - 1] + 1;
                paths[i - 1][j - 1] = "\u2196";
            } else if (weights[i - 1][j] >= weights[i][j - 1]) {
                weights[i][j] = weights[i - 1][j];
                paths[i - 1][j - 1] = "\u2191";
            } else {
                weights[i][j] = weights[i][j - 1];
                paths[i - 1][j - 1] = "\u2190";
            }
        }
    }

    return {weights, paths, query: [a, b]};
}
