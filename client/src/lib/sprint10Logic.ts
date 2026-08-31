export type IncomeMeetingInput = {
  targetIncome: number;
  commissionRatePercent: number;
  averageContractSize: number;
};

export function calculateIncomeMeetingPlan({ targetIncome, commissionRatePercent, averageContractSize }: IncomeMeetingInput) {
  const normalizedTarget = Math.max(0, targetIncome);
  const normalizedRate = Math.min(100, Math.max(0, commissionRatePercent)) / 100;
  const normalizedSize = Math.max(0, averageContractSize);
  const expectedCommissionPerContract = normalizedSize * normalizedRate;

  if (!normalizedTarget || !expectedCommissionPerContract) {
    return { expectedCommissionPerContract: 0, requiredContracts: 0, requiredMeetings: 0 };
  }

  const requiredContracts = Math.ceil(normalizedTarget / expectedCommissionPerContract);
  // Demo assumption: a case normally needs one discovery and up to two follow-up meetings.
  const requiredMeetings = requiredContracts * 3;
  return { expectedCommissionPerContract, requiredContracts, requiredMeetings };
}
