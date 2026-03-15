export function gcd(numA: number, numB: number): number {
    let tmpA = numA;
    let tmpB = numB;
    while (tmpA !== tmpB) {
        if (tmpA > tmpB) {
            tmpA -= tmpB;
        } else {
            tmpB -= tmpA;
        }
    }
    return tmpA;
}
