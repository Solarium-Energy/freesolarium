/* The privacy policy and the terms of service, as data. Legal text: it is used word for word.
   A change to the wording comes from Solarium and is made here, in both the text and the "Last updated" date.

   The privacy policy says this website uses no analytics, no advertising cookies and no tracking script,
   and stores only the language choice in the browser. If a later change adds any of these,
   the privacy policy has to change first. */

export type LegalBlock = { type: "paragraph"; text: string } | { type: "list"; items: string[] };

export type LegalSection = {
  heading: string;
  /** The heading's number and words in lower case with hyphens, so a section can be linked. */
  id: string;
  blocks: LegalBlock[];
};

export type LegalDocument = {
  title: string;
  updated: string;
  intro: LegalBlock[];
  sections: LegalSection[];
};

export const PRIVACY_POLICY: LegalDocument = {
  "title": "Privacy policy",
  "updated": "Last updated: 17 November 2026",
  "intro": [
    {
      "type": "paragraph",
      "text": "This policy explains what information Solarium Green Energy Limited (\"Solarium\", \"we\", \"us\") collects through this website, solariumenergy.org, why we collect it, who sees it and what you can ask us to do with it. It also covers how Solarium's own staff sign in to our internal customer system at crm.solariumenergy.org."
    }
  ],
  "sections": [
    {
      "heading": "1. Who we are",
      "id": "1-who-we-are",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Solarium Green Energy Limited, B-1207, World Trade Tower, S.G. Highway, Sarkhej, Ahmedabad, Gujarat 380051, India."
        },
        {
          "type": "paragraph",
          "text": "Phone: 80030 80020 (toll-free, Mon to Sat, 9:30 am to 6:30 pm). Email: info@solariumenergy.in."
        }
      ]
    },
    {
      "heading": "2. What we collect",
      "id": "2-what-we-collect",
      "blocks": [
        {
          "type": "paragraph",
          "text": "We collect what you give us, and a few technical details that come with it."
        },
        {
          "type": "paragraph",
          "text": "When you ask for a quotation:"
        },
        {
          "type": "list",
          "items": [
            "your name as on the electricity bill and as in your bank account",
            "your address and mobile number",
            "your electricity consumer number and your DISCOM",
            "your subsidy category (General or SC / ST)",
            "the details of your roof that change the price: the floor and the height of the structure",
            "the payment mode you choose to see (without loan, bank loan or NBFC loan)"
          ]
        },
        {
          "type": "paragraph",
          "text": "When you book a system:"
        },
        {
          "type": "list",
          "items": [
            "your name, mobile number, email address, city and pincode",
            "your DISCOM, the type of project, whether you need a loan, and whether the name on the bill matches the name in the bank",
            "the length and width of the shadow-free area of your roof, and any remarks you write",
            "the name and number of the partner who referred you, if any",
            "your documents: the latest electricity bill, a passport size photograph, your Aadhaar card (front and back), your PAN card, a cancelled cheque or bank passbook, a photo of your house, a geo-tagged photo of the place for the system, and photos or videos of the site"
          ]
        },
        {
          "type": "paragraph",
          "text": "With each request we also receive the page you sent it from, the page that led you to our website, and the campaign tags in the link you followed, for example from an advertisement."
        },
        {
          "type": "paragraph",
          "text": "When you call us or write to us on WhatsApp, we keep what you tell us for your enquiry."
        }
      ]
    },
    {
      "heading": "3. Cookies and similar technology",
      "id": "3-cookies-and-similar-technology",
      "blocks": [
        {
          "type": "paragraph",
          "text": "This website does not use advertising cookies or analytics cookies. It stores one setting in your browser, your choice of language, so that the page opens in that language the next time."
        },
        {
          "type": "paragraph",
          "text": "Our hosting provider processes your IP address and browser details to deliver the pages and to keep the website secure. The fonts of this website are loaded from Google Fonts, so your browser contacts Google's servers when a page opens."
        }
      ]
    },
    {
      "heading": "4. Why we use your information",
      "id": "4-why-we-use-your-information",
      "blocks": [
        {
          "type": "list",
          "items": [
            "to prepare your quotation and show it to you",
            "to call or message you about your enquiry or your order",
            "to check your eligibility and to survey your roof",
            "to design, supply, install and service your system",
            "to apply on your behalf for the subsidy and for net metering",
            "to help with a loan, if you ask for one",
            "to arrange the insurance that comes with your system",
            "to keep the records that the law, the tax rules and the subsidy scheme require",
            "to protect this website and our systems from misuse"
          ]
        },
        {
          "type": "paragraph",
          "text": "We use your information because you asked us for a quotation or a system and gave us your details for it. We do not sell your information, and we do not let other companies use it for their advertising."
        }
      ]
    },
    {
      "heading": "5. Who we share it with",
      "id": "5-who-we-share-it-with",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Only where it is needed for the purposes above:"
        },
        {
          "type": "list",
          "items": [
            "your electricity distribution company (DISCOM), and the government bodies and portals that run the PM Surya Ghar scheme and the Gujarat state assistance, such as MNRE and GEDA",
            "the bank or lender, if you choose a loan",
            "the insurer of your system",
            "installation and service partners who work for us",
            "companies that run our systems for us: website hosting, the database and document storage of our customer system, and phone and messaging services. They act on our instructions",
            "authorities, when the law requires it"
          ]
        },
        {
          "type": "paragraph",
          "text": "Some of these companies may store or process information outside India."
        }
      ]
    },
    {
      "heading": "6. How we keep it",
      "id": "6-how-we-keep-it",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Your details and documents go from this website straight into Solarium's customer system. The website itself keeps no copy of them. Documents are uploaded over an encrypted connection into private storage. Only Solarium staff who need your file for their work can open it, and they sign in with their company account."
        },
        {
          "type": "paragraph",
          "text": "No system can be made completely secure. We work to protect your information and to limit who can see it."
        }
      ]
    },
    {
      "heading": "7. How long we keep it",
      "id": "7-how-long-we-keep-it",
      "blocks": [
        {
          "type": "paragraph",
          "text": "We keep your information for as long as we need it for your enquiry, your order and the warranty and service of your system, and for as long as the law, the tax rules and the subsidy scheme require. When we no longer need it, we delete it or remove what identifies you."
        }
      ]
    },
    {
      "heading": "8. Your choices",
      "id": "8-your-choices",
      "blocks": [
        {
          "type": "paragraph",
          "text": "You can ask us:"
        },
        {
          "type": "list",
          "items": [
            "what information we hold about you, and for a copy of it",
            "to correct information that is wrong or out of date",
            "to delete your information, or to stop using it"
          ]
        },
        {
          "type": "paragraph",
          "text": "If you ask us to delete information that we still need for an order or a subsidy application, we may not be able to go on with it, and we may have to keep what the law requires us to keep."
        },
        {
          "type": "paragraph",
          "text": "Write to info@solariumenergy.in or call 80030 80020. We reply within one month."
        }
      ]
    },
    {
      "heading": "9. Complaints",
      "id": "9-complaints",
      "blocks": [
        {
          "type": "paragraph",
          "text": "If you are not satisfied with how we handle your information, write to our Grievance Officer, Nikhil Kalal, Solarium Green Energy Limited, at the address in section 1 or at info@solariumenergy.in. We reply within one month."
        }
      ]
    },
    {
      "heading": "10. Solarium staff: sign-in with Google",
      "id": "staff-sign-in",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Solarium's staff sign in to our internal customer system at crm.solariumenergy.org with their company Google account. This section is about that sign-in. Customers never sign in, so it does not apply to them."
        },
        {
          "type": "list",
          "items": [
            "From Google we receive the staff member's name, email address and profile picture. We receive nothing else: no mail, no contacts, no calendar and no files.",
            "We use it only to sign the staff member in, and to show their name and picture to colleagues inside the customer system.",
            "It is stored in the database of the customer system.",
            "We do not sell it, we do not share it with other companies and we do not use it for advertising.",
            "It is removed when the staff account is removed. A staff member can ask for this at info@solariumenergy.in."
          ]
        },
        {
          "type": "paragraph",
          "text": "Our use of information received from Google follows the Google API Services User Data Policy."
        }
      ]
    },
    {
      "heading": "11. Children",
      "id": "11-children",
      "blocks": [
        {
          "type": "paragraph",
          "text": "This website is for adults who want solar for their home. We do not knowingly collect information from anyone under 18."
        }
      ]
    },
    {
      "heading": "12. Links to other websites",
      "id": "12-links-to-other-websites",
      "blocks": [
        {
          "type": "paragraph",
          "text": "This website links to other websites and apps, such as Google reviews, WhatsApp, our social media pages and solariumenergy.in. They have their own privacy policies."
        }
      ]
    },
    {
      "heading": "13. Changes to this policy",
      "id": "13-changes-to-this-policy",
      "blocks": [
        {
          "type": "paragraph",
          "text": "When we change this policy, we publish the new version on this page and change the date at the top."
        }
      ]
    }
  ]
};

export const TERMS_OF_SERVICE: LegalDocument = {
  "title": "Terms of service",
  "updated": "Last updated: 17 November 2026",
  "intro": [
    {
      "type": "paragraph",
      "text": "These terms apply when you use this website, solariumenergy.org. The website is run by Solarium Green Energy Limited (\"Solarium\", \"we\", \"us\"), B-1207, World Trade Tower, S.G. Highway, Sarkhej, Ahmedabad, Gujarat 380051, India. By using the website you agree to these terms. If you do not agree, please do not use it."
    }
  ],
  "sections": [
    {
      "heading": "1. What this website is for",
      "id": "1-what-this-website-is-for",
      "blocks": [
        {
          "type": "paragraph",
          "text": "The website describes Solarium's 2.18 kW home solar system for homes in Gujarat under PM Surya Ghar: Muft Bijli Yojana. You can see a quotation for your roof and send us a booking request with your documents."
        }
      ]
    },
    {
      "heading": "2. The offer and the price",
      "id": "2-the-offer-and-the-price",
      "blocks": [
        {
          "type": "list",
          "items": [
            "The effective cost shown on this website assumes that the central assistance under PM Surya Ghar: Muft Bijli Yojana and the Gujarat state assistance are approved, as notified at the time of commissioning, for the standard 2.18 kW configuration.",
            "Subsidy amounts, eligibility and the time of payment are set by MNRE, GEDA and the DISCOM, not by Solarium. We help you apply. We cannot promise a decision that is theirs.",
            "A quotation on this website is an estimate, worked out from what you enter. The final price is confirmed after the rooftop survey and before your order is confirmed.",
            "Loan figures such as the monthly instalment and the interest are estimates. The bank or lender decides whether to give a loan, and on what terms.",
            "We may change or end the offer. A change does not affect an order that we have already confirmed in writing."
          ]
        }
      ]
    },
    {
      "heading": "3. Quotations and bookings",
      "id": "3-quotations-and-bookings",
      "blocks": [
        {
          "type": "list",
          "items": [
            "Asking for a quotation or sending the booking form is a request. It is not a confirmed order.",
            "An order exists when Solarium confirms it to you in writing, after we have checked your details and documents and surveyed your roof.",
            "This website takes no payment. The booking amount, the payment schedule, and the terms for cancellation and refund are in the quotation and the order documents that you receive and agree to before you pay.",
            "The warranty, the insurance and our service obligations for your system are in those order documents and in the papers that come with the system."
          ]
        }
      ]
    },
    {
      "heading": "4. What we ask of you",
      "id": "4-what-we-ask-of-you",
      "blocks": [
        {
          "type": "list",
          "items": [
            "Give us information that is true and complete, and tell us when it changes.",
            "Send only documents that are yours, or that you have the right to share.",
            "Do not misuse the website: no false requests, no automated submissions, and no attempt to get around its security or to disturb its working."
          ]
        }
      ]
    },
    {
      "heading": "5. Your information",
      "id": "5-your-information",
      "blocks": [
        {
          "type": "paragraph",
          "text": "We handle your details and documents as described in our privacy policy at solariumenergy.org/privacy."
        }
      ]
    },
    {
      "heading": "6. Content of this website",
      "id": "6-content-of-this-website",
      "blocks": [
        {
          "type": "paragraph",
          "text": "The text, pictures, logos and design of this website belong to Solarium or to those who allow us to use them. You may view and share the pages for your own use. Please ask us before you copy or reuse them for anything else."
        },
        {
          "type": "paragraph",
          "text": "The names and marks of institutions on this website refer to projects that Solarium has executed. They do not mean that the institution endorses this offer."
        }
      ]
    },
    {
      "heading": "7. Reviews and links",
      "id": "7-reviews-and-links",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Customer reviews on this website are taken from public reviews and show the experience of those customers. Links to other websites and apps, such as Google, WhatsApp and social media, are for your convenience. We do not control them and are not responsible for what they contain."
        }
      ]
    },
    {
      "heading": "8. Accuracy and availability",
      "id": "8-accuracy-and-availability",
      "blocks": [
        {
          "type": "paragraph",
          "text": "We work to keep this website correct and available. Even so, it may contain mistakes, and it may be unavailable at times. Savings figures are estimates and depend on your use of electricity and on tariffs. If something on this website differs from your written order documents, the order documents apply."
        }
      ]
    },
    {
      "heading": "9. Our liability",
      "id": "9-our-liability",
      "blocks": [
        {
          "type": "paragraph",
          "text": "To the extent the law allows, Solarium is not liable for indirect loss, or for loss that arises from relying on this website alone without a confirmed order. Nothing in these terms limits a liability that cannot be limited by law, or the rights you have under your order documents and under consumer law."
        }
      ]
    },
    {
      "heading": "10. Solarium's internal systems",
      "id": "10-solariums-internal-systems",
      "blocks": [
        {
          "type": "paragraph",
          "text": "The customer system at crm.solariumenergy.org is for Solarium's authorised staff only. Staff sign in with their company Google account and use it under Solarium's internal rules. No one else may try to access it."
        }
      ]
    },
    {
      "heading": "11. Law and disputes",
      "id": "11-law-and-disputes",
      "blocks": [
        {
          "type": "paragraph",
          "text": "These terms are governed by the laws of India. The courts at Ahmedabad, Gujarat have jurisdiction over any dispute about this website. Please write to us first, so that we can try to resolve it."
        }
      ]
    },
    {
      "heading": "12. Changes to these terms",
      "id": "12-changes-to-these-terms",
      "blocks": [
        {
          "type": "paragraph",
          "text": "When we change these terms, we publish the new version on this page and change the date at the top."
        }
      ]
    },
    {
      "heading": "13. Contact",
      "id": "13-contact",
      "blocks": [
        {
          "type": "paragraph",
          "text": "Solarium Green Energy Limited, B-1207, World Trade Tower, S.G. Highway, Sarkhej, Ahmedabad, Gujarat 380051, India. Phone: 80030 80020 (toll-free, Mon to Sat, 9:30 am to 6:30 pm). Email: info@solariumenergy.in."
        }
      ]
    }
  ]
};
