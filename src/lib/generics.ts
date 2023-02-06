export type philsysForm = {
  DateIssued: Date;
  Issuer: string;
  subject: {
    Suffix: string;
    lName: string;
    fName: string;
    mName: string;
    sex: string;
    BF: string;
    DOB: Date;
    POB: string;
    PCN: string;
    // phone: string;
    // marital: string;
  };
  alg: string;
  // pin: string;
  signature: string;
};
