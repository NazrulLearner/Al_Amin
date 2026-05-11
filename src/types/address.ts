// src/types/address.ts

export interface Address {
  country: string;
  division: string;
  district: string;
  upazila: string;
  union: string;
  village: string;
  presentAddress: string;
  permanentAddress: string;
  sameAsPresent: boolean;
}

export const ADDRESS_INITIAL_STATE: Address = {
  country: 'Bangladesh',
  division: '',
  district: '',
  upazila: '',
  union: '',
  village: '',
  presentAddress: '',
  permanentAddress: '',
  sameAsPresent: false
};