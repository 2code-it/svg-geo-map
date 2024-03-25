

export function formatNumber(value: number, length: number): string {
    let stringValue: string = value.toString();
    if (stringValue.length >= length) return stringValue.substring(0, length);
    if (stringValue.indexOf('.') == -1) stringValue += '.';
    return stringValue.padEnd(length, '0');
}