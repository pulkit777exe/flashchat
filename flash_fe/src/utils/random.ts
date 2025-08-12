export function randomStringGen() {
    const sample = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let randomString = "";
    for (let i = 0; i < 6; i++) {
        randomString = randomString + sample[Math.floor(Math.random() * sample.length)];
    }
    return randomString;
}

export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
