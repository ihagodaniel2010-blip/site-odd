export const NAV = [
  { label: "Home", to: "/" },
  {
    label: "House Cleaning",
    to: "/house-cleaning",
    children: [
      { label: "Standard Cleaning", to: "/house-cleaning" },
      { label: "Deep Cleaning", to: "/deep-cleaning" },
      { label: "Move In / Move Out", to: "/move-in-move-out" },
      { label: "Recurring Cleaning", to: "/recurring-cleaning" },
    ],
  },
  {
    label: "Commercial Cleaning",
    to: "/commercial-cleaning",
    children: [
      { label: "Office Cleaning", to: "/office-cleaning" },
      { label: "Clinic Cleaning", to: "/commercial-cleaning" },
      { label: "Retail Cleaning", to: "/commercial-cleaning" },
      { label: "Post Construction Cleaning", to: "/commercial-cleaning" },
    ],
  },
  { label: "Services", to: "/services" },
  { label: "Portfolio", to: "/portfolio" },
  {
    label: "More",
    to: "/areas-we-serve",
    children: [
      { label: "Areas We Serve", to: "/areas-we-serve" },
      { label: "About", to: "/about" },
      { label: "FAQ", to: "/contact" },
      { label: "Contact", to: "/contact" },
    ],
  },
  { label: "Contact", to: "/contact" },
] as const;

export const PHONE = "(978) 319-8939";
export const PHONE_HREF = "tel:+19783198939";
export const PHONE_DIGITS = "19783198939";
export const EMAIL = "paivacleaners@gmail.com";
export const ADDRESS_LINE_1 = "30 3rd Street";
export const ADDRESS_LINE_2 = "Lowell, MA";
export const ADDRESS_FULL = "30 3rd Street, Lowell, MA";
export const COMPANY_NAME = "Paiva Cleaners Co.";
