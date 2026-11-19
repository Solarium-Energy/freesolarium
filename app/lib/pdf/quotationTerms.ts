/* The terms and conditions of the quotation, page 3 of the PDF. Legal text, word for word: it is built from
   the text of Solarium's own terms page, and a change to the wording comes from Solarium.

   Two spots are filled in for each quotation: {meter_charges}, the meter charge of the quotation's DISCOM, in
   digits only, as the sentence says "Rs." already; and {validity_days}, the days the quotation is valid. */

export type QuotationClause = { name: string; text: string };

const CLAUSES: QuotationClause[] = [
  { name: "PRICE:", text: "The price quoted in this Proposal is inclusive of design, manufacturing, sourcing, testing, installation, supply & commissioning, as per the bill of materials & ratings submitted by Solarium along with the final offer. Any change in scope of work or addition to the bill of materials and/or ratings or any variation, whatsoever, shall be charged extra to the Customer. The price quoted is CIF-site and is firm." },
  { name: "DISCOM CHARGES:", text: "DISCOM Fees of Rs. 109 and Meter charges of Rs. {meter_charges} are included as per standard rates. Final charges are determined by DISCOM. If the final charges are higher than the amount mentioned here then the difference shall be paid by the customer to Solarium Green Energy. If the final charge is less than the amount mentioned here then the difference shall be reduced from the quotation or refunded to the customer by Solarium Green Energy." },
  { name: "OTHER DISCOM CHARGES:", text: "Load change/Name change/Name correction/Phase change if required, the charges will be borne by the customer." },
  { name: "VALIDITY OF OFFER:", text: "The price quoted by Solarium along with this Proposal is valid for {validity_days} days and thereafter the same shall be subject to reconfirmation by Solarium Green Energy." },
  { name: "INTERRUPTIONS IN WORK:", text: "The Customer must not interrupt the works, and/or shall abstain from any act or omission of which it can reasonably be expected that it may delay the works or make the works more difficult and or expensive for Solarium Green Energy. In case of cancellation of project, advance will be refunded after deducting meter charges, design and process charges." },
  { name: "WARRANTY:", text: "Tampering, misuse, addition, dismantling, reinstallation of any of the system components by unauthorized personnel will render warranty null and void." },
  { name: "SECURITY & SAFETY:", text: "On delivery of supplies to Customer’s site in good condition, Customer shall be responsible for safety & security of the materials till handing over of the same to Solarium designated personnel for installation." },
  { name: "CIVIL & STRUCTURAL WORK:", text: "Solarium limits itself to providing structures for its module mounting on RCC roofs and raised structures. The customer shall allow scrapping of the roof for binding civil foundation, hole fastening the structure on the roof or bolting on these shade roofs for installation." },
  { name: "OPERATION & MAINTENANCE (O&M):", text: "O&M is inclusive for 5 Years. Cleaning of Modules is in customer scope which covers the system & structure." },
  { name: "PUBLICITY RIGHTS:", text: "The Customer agrees and gives its irrevocable and unconditional consent to Solarium to issue any press release or announcement relating to this Proposal, or any resultant Agreement, or use the data, photographs, designs, etc. of the solar power plant for its publicity and/or marketing activities or use the same for publication anywhere. Solarium understands and agrees that no such usage shall be in a manner defamatory to the Customer." },
  { name: "EXTRA COSTS:", text: "Standard cable length and structure are included in the quoted price. No additional cost for cables or structure pipes has been added." },
];

/** The table under the clauses. */
export const QUOTATION_TERMS_TABLE = [
  { label: "Regional Office", value: "B-1203 World Trade Tower, Nr. BMW Showroom, Ahmedabad, Gujarat - 380051" },
  { label: "GSTIN", value: "24ABHCS9467Q1ZB" },
] as const;

/** The clauses with the two spots filled in. */
export function quotationTermsClauses(spots: { meterCharges: string; validityDays: string }): QuotationClause[] {
  return CLAUSES.map((clause) => ({
    name: clause.name,
    text: clause.text.replaceAll("{meter_charges}", spots.meterCharges).replaceAll("{validity_days}", spots.validityDays),
  }));
}
