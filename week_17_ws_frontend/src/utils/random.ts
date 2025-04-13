export function randomStringGen() {
    const sample = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let randomString = "";
    for (let i = 0; i < 6; i++) {
        randomString = randomString + sample[Math.floor(Math.random() * sample.length)];
    }
    return randomString;
}
