import faker from 'faker';
import { createVendor } from '../src/operations/vendor';
import nanoid from '../src/utils/nanoid';

export const generateFakePin = (length = 6) => {
  // Create an array of random numbers from 0 to 9
  const digits = Array.from({ length }, () => Math.floor(Math.random() * 10));

  // Reduce this array to a string
  return digits.reduce((previous, current) => previous + current.toString(), '');
};

export const createFakeVendor = ({ name = faker.company.companyName(), pin }: { name?: string; pin?: string }) => {
  const id = nanoid();

  return createVendor({
    id,
    name,
    pin: pin || generateFakePin(),
  });
};
