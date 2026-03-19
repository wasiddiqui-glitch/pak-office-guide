// Adds offices for Rawalpindi, Peshawar, Multan, Faisalabad, Quetta
const fs = require("fs");
const path = require("path");

const newOffices = [
  // ─── RAWALPINDI ───────────────────────────────────────────────────────────
  {
    "id": "rawalpindi-nadra-saddar",
    "city": "Rawalpindi",
    "category": "NADRA",
    "name": "NADRA Registration Center (Saddar)",
    "area": "Saddar",
    "address": "Saddar, Rawalpindi",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=NADRA+Registration+Center+Saddar+Rawalpindi",
    "phone": "051-9272422",
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://www.nadra.gov.pk/",
    "requirements": [
      "Original CNIC / B-Form",
      "Copy of CNIC",
      "Supporting documents (if applicable)"
    ],
    "steps": [
      "Take a token / queue number",
      "Submit documents at the counter",
      "Biometrics and photo capture",
      "Receive receipt and collection timeline"
    ],
    "fees": ["Standard NADRA fees apply (verify at center)"],
    "notes": ["Arrive early to avoid long queues", "Bring extra photocopies"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "rawalpindi-nadra-westridge",
    "city": "Rawalpindi",
    "category": "NADRA",
    "name": "NADRA Registration Center (Westridge)",
    "area": "Westridge",
    "address": "Westridge, Rawalpindi",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=NADRA+Registration+Center+Westridge+Rawalpindi",
    "phone": null,
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://www.nadra.gov.pk/",
    "requirements": [
      "Original CNIC / B-Form",
      "Copy of CNIC",
      "Supporting documents (if applicable)"
    ],
    "steps": [
      "Take a token / queue number",
      "Submit documents at the counter",
      "Biometrics and photo capture",
      "Receive receipt and collection timeline"
    ],
    "fees": ["Standard NADRA fees apply (verify at center)"],
    "notes": ["Bring extra photocopies of all documents"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "rawalpindi-nadra-chaklala",
    "city": "Rawalpindi",
    "category": "NADRA",
    "name": "NADRA Registration Center (Chaklala)",
    "area": "Chaklala",
    "address": "Chaklala, Rawalpindi",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=NADRA+Registration+Center+Chaklala+Rawalpindi",
    "phone": null,
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://www.nadra.gov.pk/",
    "requirements": [
      "Original CNIC / B-Form",
      "Copy of CNIC",
      "Supporting documents (if applicable)"
    ],
    "steps": [
      "Take a token / queue number",
      "Submit documents at the counter",
      "Biometrics and photo capture",
      "Receive receipt and collection timeline"
    ],
    "fees": ["Standard NADRA fees apply (verify at center)"],
    "notes": ["Arrive early — this center can get busy"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "rawalpindi-passport-office",
    "city": "Rawalpindi",
    "category": "Passport",
    "name": "Regional Passport Office Rawalpindi",
    "area": "Murree Road",
    "address": "Murree Road, Rawalpindi",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Regional+Passport+Office+Rawalpindi",
    "phone": "051-9272601",
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://dgip.gov.pk/",
    "requirements": [
      "Original CNIC",
      "Copy of CNIC (both sides)",
      "Old passport (for renewal)",
      "2 passport-size photos (white background)",
      "Completed application form"
    ],
    "steps": [
      "Download and fill the passport application form from dgip.gov.pk",
      "Pay the fee at any authorized bank",
      "Visit the office with all documents",
      "Biometrics and photo capture",
      "Collect passport within stated timeline (or via courier)"
    ],
    "fees": [
      "Normal (30 days): PKR 3,000",
      "Urgent (7 days): PKR 5,000",
      "Rush (2 days): PKR 8,000"
    ],
    "notes": [
      "Book an appointment via the DGIP website where possible",
      "Urgent and rush processing available for extra fee",
      "Bring original documents — photocopies alone are not accepted"
    ],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "rawalpindi-driving-license-saddar",
    "city": "Rawalpindi",
    "category": "Driving License",
    "name": "Driving License Office (Saddar)",
    "area": "Saddar",
    "address": "Traffic Police Office, Saddar, Rawalpindi",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Driving+License+Office+Saddar+Rawalpindi",
    "phone": null,
    "hours": "Mon–Sat 9:00 AM – 3:00 PM",
    "website": null,
    "requirements": [
      "Original CNIC",
      "Copy of CNIC",
      "Learner permit (if applying for first license)",
      "Medical certificate",
      "2 passport-size photos"
    ],
    "steps": [
      "Visit with all required documents",
      "Written / road test (for new applicants)",
      "Pay the fee",
      "Biometrics and photo capture",
      "Receive license within 1–2 weeks"
    ],
    "fees": ["PKR 1,000 – 1,500 (verify current rate)"],
    "notes": ["Bring originals of all documents", "New applicants must pass a driving test"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "rawalpindi-wapda-office",
    "city": "Rawalpindi",
    "category": "Utilities",
    "name": "LESCO / IESCO Customer Service Center (Rawalpindi)",
    "area": "Saddar",
    "address": "IESCO Head Office, G-8/1, near Saddar, Rawalpindi",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=IESCO+Head+Office+Rawalpindi",
    "phone": "051-9252623",
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://iesco.com.pk/",
    "requirements": [
      "Consumer number (on electricity bill)",
      "Original CNIC",
      "Bill copy (if disputing a bill)"
    ],
    "steps": [
      "Take a token at the entrance",
      "Wait for your number",
      "Present your issue / documents at the counter",
      "Receive reference number or resolution"
    ],
    "fees": ["No fee for bill inquiries or complaints"],
    "notes": ["IESCO serves Rawalpindi and Islamabad regions", "New connections require additional paperwork"],
    "lastUpdated": "2026-03-19"
  },

  // ─── PESHAWAR ─────────────────────────────────────────────────────────────
  {
    "id": "peshawar-nadra-saddar",
    "city": "Peshawar",
    "category": "NADRA",
    "name": "NADRA Registration Center (Saddar)",
    "area": "Saddar",
    "address": "Saddar, Peshawar",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=NADRA+Registration+Center+Saddar+Peshawar",
    "phone": "091-9212640",
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://www.nadra.gov.pk/",
    "requirements": [
      "Original CNIC / B-Form",
      "Copy of CNIC",
      "Supporting documents (if applicable)"
    ],
    "steps": [
      "Take a token / queue number",
      "Submit documents at the counter",
      "Biometrics and photo capture",
      "Receive receipt and collection timeline"
    ],
    "fees": ["Standard NADRA fees apply (verify at center)"],
    "notes": ["Bring extra photocopies", "Arrive early to avoid long queues"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "peshawar-nadra-hayatabad",
    "city": "Peshawar",
    "category": "NADRA",
    "name": "NADRA Registration Center (Hayatabad)",
    "area": "Hayatabad",
    "address": "Hayatabad, Peshawar",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=NADRA+Registration+Center+Hayatabad+Peshawar",
    "phone": null,
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://www.nadra.gov.pk/",
    "requirements": [
      "Original CNIC / B-Form",
      "Copy of CNIC",
      "Supporting documents (if applicable)"
    ],
    "steps": [
      "Take a token / queue number",
      "Submit documents at the counter",
      "Biometrics and photo capture",
      "Receive receipt and collection timeline"
    ],
    "fees": ["Standard NADRA fees apply (verify at center)"],
    "notes": ["Hayatabad center serves the western residential area of Peshawar"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "peshawar-nadra-university-town",
    "city": "Peshawar",
    "category": "NADRA",
    "name": "NADRA Registration Center (University Town)",
    "area": "University Town",
    "address": "University Town, Peshawar",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=NADRA+Registration+Center+University+Town+Peshawar",
    "phone": null,
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://www.nadra.gov.pk/",
    "requirements": [
      "Original CNIC / B-Form",
      "Copy of CNIC",
      "Supporting documents (if applicable)"
    ],
    "steps": [
      "Take a token / queue number",
      "Submit documents at the counter",
      "Biometrics and photo capture",
      "Receive receipt and collection timeline"
    ],
    "fees": ["Standard NADRA fees apply (verify at center)"],
    "notes": ["Bring extra photocopies of all documents"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "peshawar-passport-office",
    "city": "Peshawar",
    "category": "Passport",
    "name": "Regional Passport Office Peshawar",
    "area": "Saddar",
    "address": "Saddar Road, near Shahi Bagh, Peshawar",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Regional+Passport+Office+Peshawar",
    "phone": "091-9210082",
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://dgip.gov.pk/",
    "requirements": [
      "Original CNIC",
      "Copy of CNIC (both sides)",
      "Old passport (for renewal)",
      "2 passport-size photos (white background)",
      "Completed application form"
    ],
    "steps": [
      "Download and fill the passport application form from dgip.gov.pk",
      "Pay the fee at any authorized bank",
      "Visit the office with all documents",
      "Biometrics and photo capture",
      "Collect passport within stated timeline (or via courier)"
    ],
    "fees": [
      "Normal (30 days): PKR 3,000",
      "Urgent (7 days): PKR 5,000",
      "Rush (2 days): PKR 8,000"
    ],
    "notes": [
      "Book an appointment via the DGIP website where possible",
      "Bring original documents — photocopies alone are not accepted"
    ],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "peshawar-driving-license",
    "city": "Peshawar",
    "category": "Driving License",
    "name": "Driving License Authority (DLA) Peshawar",
    "area": "Ring Road",
    "address": "DLA Complex, Ring Road, Peshawar",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Driving+License+Authority+Peshawar",
    "phone": "091-9224040",
    "hours": "Mon–Sat 9:00 AM – 3:00 PM",
    "website": null,
    "requirements": [
      "Original CNIC",
      "Copy of CNIC",
      "Learner permit (for new applicants)",
      "Medical certificate",
      "2 passport-size photos"
    ],
    "steps": [
      "Visit the DLA office with all documents",
      "Written and road test (for new applicants)",
      "Pay the applicable fee",
      "Biometrics",
      "License issued within 1–2 weeks"
    ],
    "fees": ["PKR 1,000 – 1,500 depending on license type (verify)"],
    "notes": ["New applicants must pass written and road tests", "Bring originals of all documents"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "peshawar-pesco-office",
    "city": "Peshawar",
    "category": "Utilities",
    "name": "PESCO Customer Service Center",
    "area": "Warsak Road",
    "address": "PESCO Head Office, Warsak Road, Peshawar",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=PESCO+Head+Office+Peshawar",
    "phone": "091-9213500",
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://www.pesco.gov.pk/",
    "requirements": [
      "Consumer number (on electricity bill)",
      "Original CNIC",
      "Bill copy (if disputing)"
    ],
    "steps": [
      "Take a token at the entrance",
      "Wait for your number",
      "Present your issue / documents at the counter",
      "Receive reference number or resolution"
    ],
    "fees": ["No fee for bill inquiries or complaints"],
    "notes": ["PESCO (Peshawar Electric Supply Company) serves KPK province", "New connections require site survey"],
    "lastUpdated": "2026-03-19"
  },

  // ─── MULTAN ───────────────────────────────────────────────────────────────
  {
    "id": "multan-nadra-gulgasht",
    "city": "Multan",
    "category": "NADRA",
    "name": "NADRA Registration Center (Gulgasht Colony)",
    "area": "Gulgasht Colony",
    "address": "Gulgasht Colony, Multan",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=NADRA+Registration+Center+Gulgasht+Colony+Multan",
    "phone": "061-9200332",
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://www.nadra.gov.pk/",
    "requirements": [
      "Original CNIC / B-Form",
      "Copy of CNIC",
      "Supporting documents (if applicable)"
    ],
    "steps": [
      "Take a token / queue number",
      "Submit documents at the counter",
      "Biometrics and photo capture",
      "Receive receipt and collection timeline"
    ],
    "fees": ["Standard NADRA fees apply (verify at center)"],
    "notes": ["Arrive early to avoid long queues", "Bring extra photocopies"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "multan-nadra-cantt",
    "city": "Multan",
    "category": "NADRA",
    "name": "NADRA Registration Center (Cantt)",
    "area": "Cantt",
    "address": "Cantonment Area, Multan",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=NADRA+Registration+Center+Cantt+Multan",
    "phone": null,
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://www.nadra.gov.pk/",
    "requirements": [
      "Original CNIC / B-Form",
      "Copy of CNIC",
      "Supporting documents (if applicable)"
    ],
    "steps": [
      "Take a token / queue number",
      "Submit documents at the counter",
      "Biometrics and photo capture",
      "Receive receipt and collection timeline"
    ],
    "fees": ["Standard NADRA fees apply (verify at center)"],
    "notes": ["Bring extra photocopies of all documents"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "multan-nadra-new-multan",
    "city": "Multan",
    "category": "NADRA",
    "name": "NADRA Registration Center (New Multan)",
    "area": "New Multan",
    "address": "New Multan, Multan",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=NADRA+Registration+Center+New+Multan",
    "phone": null,
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://www.nadra.gov.pk/",
    "requirements": [
      "Original CNIC / B-Form",
      "Copy of CNIC",
      "Supporting documents (if applicable)"
    ],
    "steps": [
      "Take a token / queue number",
      "Submit documents at the counter",
      "Biometrics and photo capture",
      "Receive receipt and collection timeline"
    ],
    "fees": ["Standard NADRA fees apply (verify at center)"],
    "notes": ["Bring extra photocopies of all documents"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "multan-passport-office",
    "city": "Multan",
    "category": "Passport",
    "name": "Regional Passport Office Multan",
    "area": "Nawan Sheher",
    "address": "Nawan Sheher, near Multan Cricket Stadium, Multan",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Regional+Passport+Office+Multan",
    "phone": "061-9200101",
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://dgip.gov.pk/",
    "requirements": [
      "Original CNIC",
      "Copy of CNIC (both sides)",
      "Old passport (for renewal)",
      "2 passport-size photos (white background)",
      "Completed application form"
    ],
    "steps": [
      "Download and fill the passport application form from dgip.gov.pk",
      "Pay the fee at any authorized bank",
      "Visit the office with all documents",
      "Biometrics and photo capture",
      "Collect passport within stated timeline (or via courier)"
    ],
    "fees": [
      "Normal (30 days): PKR 3,000",
      "Urgent (7 days): PKR 5,000",
      "Rush (2 days): PKR 8,000"
    ],
    "notes": [
      "Book an appointment via the DGIP website where possible",
      "Bring original documents"
    ],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "multan-driving-license",
    "city": "Multan",
    "category": "Driving License",
    "name": "Driving License Authority (DLA) Multan",
    "area": "Cantt",
    "address": "DLA Office, Cantt, Multan",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Driving+License+Office+Multan",
    "phone": null,
    "hours": "Mon–Sat 9:00 AM – 3:00 PM",
    "website": null,
    "requirements": [
      "Original CNIC",
      "Copy of CNIC",
      "Learner permit (for new applicants)",
      "Medical certificate",
      "2 passport-size photos"
    ],
    "steps": [
      "Visit with all required documents",
      "Written / road test (for new applicants)",
      "Pay the fee",
      "Biometrics and photo capture",
      "License issued within 1–2 weeks"
    ],
    "fees": ["PKR 1,000 – 1,500 depending on license type (verify)"],
    "notes": ["Bring originals of all documents"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "multan-mepco-office",
    "city": "Multan",
    "category": "Utilities",
    "name": "MEPCO Customer Service Center",
    "area": "Qasim Bela",
    "address": "MEPCO Head Office, Qasim Bela Road, Multan",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=MEPCO+Head+Office+Multan",
    "phone": "061-9220014",
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://www.mepco.com.pk/",
    "requirements": [
      "Consumer number (on electricity bill)",
      "Original CNIC",
      "Bill copy (if disputing)"
    ],
    "steps": [
      "Take a token at the entrance",
      "Wait for your number",
      "Present your issue / documents at the counter",
      "Receive reference number or resolution"
    ],
    "fees": ["No fee for bill inquiries or complaints"],
    "notes": ["MEPCO serves Multan and South Punjab", "New connection applications processed here"],
    "lastUpdated": "2026-03-19"
  },

  // ─── FAISALABAD ───────────────────────────────────────────────────────────
  {
    "id": "faisalabad-nadra-ghulam-muhammad-abad",
    "city": "Faisalabad",
    "category": "NADRA",
    "name": "NADRA Registration Center (Ghulam Muhammad Abad)",
    "area": "Ghulam Muhammad Abad",
    "address": "Ghulam Muhammad Abad, Faisalabad",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=NADRA+Registration+Center+Ghulam+Muhammad+Abad+Faisalabad",
    "phone": "041-9220101",
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://www.nadra.gov.pk/",
    "requirements": [
      "Original CNIC / B-Form",
      "Copy of CNIC",
      "Supporting documents (if applicable)"
    ],
    "steps": [
      "Take a token / queue number",
      "Submit documents at the counter",
      "Biometrics and photo capture",
      "Receive receipt and collection timeline"
    ],
    "fees": ["Standard NADRA fees apply (verify at center)"],
    "notes": ["Arrive early to avoid long queues", "Bring extra photocopies"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "faisalabad-nadra-peoples-colony",
    "city": "Faisalabad",
    "category": "NADRA",
    "name": "NADRA Registration Center (Peoples Colony)",
    "area": "Peoples Colony",
    "address": "Peoples Colony, Faisalabad",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=NADRA+Registration+Center+Peoples+Colony+Faisalabad",
    "phone": null,
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://www.nadra.gov.pk/",
    "requirements": [
      "Original CNIC / B-Form",
      "Copy of CNIC",
      "Supporting documents (if applicable)"
    ],
    "steps": [
      "Take a token / queue number",
      "Submit documents at the counter",
      "Biometrics and photo capture",
      "Receive receipt and collection timeline"
    ],
    "fees": ["Standard NADRA fees apply (verify at center)"],
    "notes": ["Bring extra photocopies of all documents"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "faisalabad-nadra-madina-town",
    "city": "Faisalabad",
    "category": "NADRA",
    "name": "NADRA Registration Center (Madina Town)",
    "area": "Madina Town",
    "address": "Madina Town, Faisalabad",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=NADRA+Registration+Center+Madina+Town+Faisalabad",
    "phone": null,
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://www.nadra.gov.pk/",
    "requirements": [
      "Original CNIC / B-Form",
      "Copy of CNIC",
      "Supporting documents (if applicable)"
    ],
    "steps": [
      "Take a token / queue number",
      "Submit documents at the counter",
      "Biometrics and photo capture",
      "Receive receipt and collection timeline"
    ],
    "fees": ["Standard NADRA fees apply (verify at center)"],
    "notes": ["Bring extra photocopies of all documents"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "faisalabad-passport-office",
    "city": "Faisalabad",
    "category": "Passport",
    "name": "Regional Passport Office Faisalabad",
    "area": "Civil Lines",
    "address": "Civil Lines, Faisalabad",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Regional+Passport+Office+Faisalabad",
    "phone": "041-9220201",
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://dgip.gov.pk/",
    "requirements": [
      "Original CNIC",
      "Copy of CNIC (both sides)",
      "Old passport (for renewal)",
      "2 passport-size photos (white background)",
      "Completed application form"
    ],
    "steps": [
      "Download and fill the passport application form from dgip.gov.pk",
      "Pay the fee at any authorized bank",
      "Visit the office with all documents",
      "Biometrics and photo capture",
      "Collect passport within stated timeline (or via courier)"
    ],
    "fees": [
      "Normal (30 days): PKR 3,000",
      "Urgent (7 days): PKR 5,000",
      "Rush (2 days): PKR 8,000"
    ],
    "notes": ["Book an appointment via the DGIP website where possible"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "faisalabad-driving-license",
    "city": "Faisalabad",
    "category": "Driving License",
    "name": "Driving License Authority (DLA) Faisalabad",
    "area": "Ghulam Muhammad Abad",
    "address": "DLA Office, Ghulam Muhammad Abad, Faisalabad",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Driving+License+Office+Faisalabad",
    "phone": null,
    "hours": "Mon–Sat 9:00 AM – 3:00 PM",
    "website": null,
    "requirements": [
      "Original CNIC",
      "Copy of CNIC",
      "Learner permit (for new applicants)",
      "Medical certificate",
      "2 passport-size photos"
    ],
    "steps": [
      "Visit with all required documents",
      "Written / road test (for new applicants)",
      "Pay the fee",
      "Biometrics and photo capture",
      "License issued within 1–2 weeks"
    ],
    "fees": ["PKR 1,000 – 1,500 depending on license type (verify)"],
    "notes": ["Bring originals of all documents", "New applicants must pass written and road tests"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "faisalabad-fesco-office",
    "city": "Faisalabad",
    "category": "Utilities",
    "name": "FESCO Customer Service Center",
    "area": "Gulberg Colony",
    "address": "FESCO Head Office, Gulberg Colony, Faisalabad",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=FESCO+Head+Office+Faisalabad",
    "phone": "041-9220444",
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://www.fesco.com.pk/",
    "requirements": [
      "Consumer number (on electricity bill)",
      "Original CNIC",
      "Bill copy (if disputing)"
    ],
    "steps": [
      "Take a token at the entrance",
      "Wait for your number",
      "Present your issue / documents at the counter",
      "Receive reference number or resolution"
    ],
    "fees": ["No fee for bill inquiries or complaints"],
    "notes": ["FESCO serves Faisalabad and surrounding districts"],
    "lastUpdated": "2026-03-19"
  },

  // ─── QUETTA ───────────────────────────────────────────────────────────────
  {
    "id": "quetta-nadra-zarghoon-road",
    "city": "Quetta",
    "category": "NADRA",
    "name": "NADRA Registration Center (Zarghoon Road)",
    "area": "Zarghoon Road",
    "address": "Zarghoon Road, Quetta",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=NADRA+Registration+Center+Zarghoon+Road+Quetta",
    "phone": "081-9202231",
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://www.nadra.gov.pk/",
    "requirements": [
      "Original CNIC / B-Form",
      "Copy of CNIC",
      "Supporting documents (if applicable)"
    ],
    "steps": [
      "Take a token / queue number",
      "Submit documents at the counter",
      "Biometrics and photo capture",
      "Receive receipt and collection timeline"
    ],
    "fees": ["Standard NADRA fees apply (verify at center)"],
    "notes": ["Arrive early — center can get busy in the morning"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "quetta-nadra-satellite-town",
    "city": "Quetta",
    "category": "NADRA",
    "name": "NADRA Registration Center (Satellite Town)",
    "area": "Satellite Town",
    "address": "Satellite Town, Quetta",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=NADRA+Registration+Center+Satellite+Town+Quetta",
    "phone": null,
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://www.nadra.gov.pk/",
    "requirements": [
      "Original CNIC / B-Form",
      "Copy of CNIC",
      "Supporting documents (if applicable)"
    ],
    "steps": [
      "Take a token / queue number",
      "Submit documents at the counter",
      "Biometrics and photo capture",
      "Receive receipt and collection timeline"
    ],
    "fees": ["Standard NADRA fees apply (verify at center)"],
    "notes": ["Bring extra photocopies of all documents"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "quetta-passport-office",
    "city": "Quetta",
    "category": "Passport",
    "name": "Regional Passport Office Quetta",
    "area": "Jinnah Road",
    "address": "Jinnah Road, near Commissioner Office, Quetta",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Regional+Passport+Office+Quetta",
    "phone": "081-9202101",
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://dgip.gov.pk/",
    "requirements": [
      "Original CNIC",
      "Copy of CNIC (both sides)",
      "Old passport (for renewal)",
      "2 passport-size photos (white background)",
      "Completed application form"
    ],
    "steps": [
      "Download and fill the passport application form from dgip.gov.pk",
      "Pay the fee at any authorized bank",
      "Visit the office with all documents",
      "Biometrics and photo capture",
      "Collect passport within stated timeline (or via courier)"
    ],
    "fees": [
      "Normal (30 days): PKR 3,000",
      "Urgent (7 days): PKR 5,000",
      "Rush (2 days): PKR 8,000"
    ],
    "notes": ["Bring original documents — photocopies alone are not accepted"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "quetta-driving-license",
    "city": "Quetta",
    "category": "Driving License",
    "name": "Driving License Office Quetta",
    "area": "Jinnah Road",
    "address": "Traffic Police Complex, Jinnah Road, Quetta",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=Driving+License+Office+Quetta",
    "phone": null,
    "hours": "Mon–Sat 9:00 AM – 3:00 PM",
    "website": null,
    "requirements": [
      "Original CNIC",
      "Copy of CNIC",
      "Learner permit (for new applicants)",
      "Medical certificate",
      "2 passport-size photos"
    ],
    "steps": [
      "Visit with all required documents",
      "Written / road test (for new applicants)",
      "Pay the fee",
      "Biometrics and photo capture",
      "License issued within 1–2 weeks"
    ],
    "fees": ["PKR 1,000 – 1,500 depending on license type (verify)"],
    "notes": ["Bring originals of all documents"],
    "lastUpdated": "2026-03-19"
  },
  {
    "id": "quetta-qesco-office",
    "city": "Quetta",
    "category": "Utilities",
    "name": "QESCO Customer Service Center",
    "area": "Zarghoon Road",
    "address": "QESCO Head Office, Zarghoon Road, Quetta",
    "googleMapsLink": "https://www.google.com/maps/search/?api=1&query=QESCO+Head+Office+Quetta",
    "phone": "081-9202300",
    "hours": "Mon–Fri 9:00 AM – 5:00 PM",
    "website": "https://www.qesco.com.pk/",
    "requirements": [
      "Consumer number (on electricity bill)",
      "Original CNIC",
      "Bill copy (if disputing)"
    ],
    "steps": [
      "Take a token at the entrance",
      "Wait for your number",
      "Present your issue / documents at the counter",
      "Receive reference number or resolution"
    ],
    "fees": ["No fee for bill inquiries or complaints"],
    "notes": ["QESCO (Quetta Electric Supply Company) serves Balochistan"],
    "lastUpdated": "2026-03-19"
  }
];

const dataPath = path.join(__dirname, "../src/data/offices.json");
const existing = JSON.parse(fs.readFileSync(dataPath, "utf8"));

// Check for duplicate IDs
const existingIds = new Set(existing.map(o => o.id));
const dupes = newOffices.filter(o => existingIds.has(o.id));
if (dupes.length > 0) {
  console.error("Duplicate IDs found:", dupes.map(o => o.id));
  process.exit(1);
}

const combined = [...existing, ...newOffices];
fs.writeFileSync(dataPath, JSON.stringify(combined, null, 2));
console.log(`Done. Added ${newOffices.length} offices. Total: ${combined.length}`);
