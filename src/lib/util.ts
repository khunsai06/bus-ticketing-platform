export function concatenateStrings(list: string[]): string {
    return list.join(' ');
}

export async function delayer(milliseconds: number) {
    return new Promise((res, _) => {
        setTimeout(() => {
            res(1)
        }, milliseconds);
    })
}