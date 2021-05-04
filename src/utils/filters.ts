import { Vendor } from '@prisma/client';
import { pick } from 'lodash';

export const filterVendor = (vendor: Vendor) => pick(vendor, ['id', 'name']);
