export interface ElectorRecord {
  epicNumber: string;
  acNo: string;
  partNo: string;
  serialNo: string;
  electorName: string;
  electorNameHindi: string;
  electorGender: string;
  age: string;
  dob: string;
  relativeName: string;
  relativeNameHindi: string;
  relativeType: string;
  mobileNumber: string;
}

export type OperationResponse = {
  success: boolean;
  data?: ElectorRecord | ElectorRecord[];
  message?: string;
};
