export const encodeToBase64 = (object: object) => {
  const data = JSON.stringify(object);
  return Buffer.from(data).toString('base64');
};

export const decodeFromBase64 = (string: string) => {
  const buffer = Buffer.from(string, 'base64');

  return JSON.parse(buffer.toString());
};
// More info : https://stackoverflow.com/a/37511463
export const removeAccents = (string: string): string =>
  string.normalize('NFD').replace(/[\u0300-\u036F]/g, '');

export const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min) + min);
