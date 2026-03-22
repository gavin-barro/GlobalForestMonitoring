export const generateRandomId = function (max: number) {
    return Math.floor(Math.random() * max) + 1;
};